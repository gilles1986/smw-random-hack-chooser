#!/usr/bin/env node
/**
 * fetch-hacks.js
 * Fetches all SMW hacks from SMWCentral and writes them to static/hacks.json.
 * Run: node scripts/fetch-hacks.js
 *
 * The script fetches ALL hacks (all types, all difficulties) so the Svelte app
 * can filter entirely client-side without further API calls.
 *
 * It also fetches per-hack details (authors, description, screenshots) via
 * getsectiondetails and embeds them into hacks.json, eliminating the need for
 * browser-side API calls that would be blocked by CORS.
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_URL = 'https://www.smwcentral.net/ajax.php';
const DELAY_MS = 800;
const OUTPUT_PATH = join(__dirname, '..', 'static', 'hacks.json');

const DIFFICULTY_ID_TO_LABEL = {
	diff_1: 'Newcomer',
	diff_2: 'Casual',
	diff_3: 'Intermediate',
	diff_4: 'Advanced',
	diff_5: 'Expert',
	diff_6: 'Master',
	diff_7: 'Grandmaster',
	'': 'No Difficulty'
};

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(page) {
	const params = new URLSearchParams({
		a: 'getsectionlist',
		s: 'smwhacks',
		n: String(page),
		u: '0'
	});
	const url = `${API_URL}?${params}`;
	const res = await fetch(url, {
		headers: { 'User-Agent': 'SMW-Random-Hack-Chooser/1.0' }
	});
	if (!res.ok) throw new Error(`HTTP ${res.status} on page ${page}`);
	return res.json();
}

/**
 * Fetches per-hack details (authors, description, screenshots) from getsectiondetails.
 * Returns null on any error so missing details never block the overall fetch.
 */
async function fetchDetails(hackId) {
	const params = new URLSearchParams({
		a: 'getsectiondetails',
		s: 'smwhacks',
		id: String(hackId)
	});
	const url = `${API_URL}?${params}`;
	try {
		const res = await fetch(url, {
			headers: { 'User-Agent': 'SMW-Random-Hack-Chooser/1.0' }
		});
		if (!res.ok) return null;
		const json = await res.json();

		const description =
			json.description ?? json.fields?.description ?? json.raw_fields?.description ?? null;

		const rawScreenshots =
			json.screenshots ?? json.fields?.screenshots ?? json.raw_fields?.screenshots ?? [];
		const screenshots = (Array.isArray(rawScreenshots) ? rawScreenshots : [])
			.map((s) => {
				if (typeof s === 'string') return s;
				if (s && typeof s === 'object') {
					return (s.url ?? s.src ?? s.link ?? '') || '';
				}
				return '';
			})
			.filter(Boolean);

		const rawAuthors =
			json.authors ?? json.fields?.authors ?? json.raw_fields?.authors ?? [];
		const authors = (Array.isArray(rawAuthors) ? rawAuthors : [])
			.map((a) => {
				if (typeof a === 'string') return a;
				if (a && typeof a === 'object') {
					return (a.name ?? a.username ?? '') || '';
				}
				return '';
			})
			.filter(Boolean);

		return { authors, description: description ?? null, screenshots };
	} catch {
		return null;
	}
}

function normalizeTypes(raw) {
	if (!raw) return ['standard'];
	const arr = Array.isArray(raw) ? raw : [raw];
	return arr.map((t) => String(t).toLowerCase()).filter(Boolean);
}

function normalizeDifficulty(raw) {
	if (raw === null || raw === undefined) return '';
	return String(raw);
}

function loadExistingHacks() {
	if (existsSync(OUTPUT_PATH)) {
		try {
			const data = JSON.parse(readFileSync(OUTPUT_PATH, 'utf-8'));
			if (Array.isArray(data) && data.length > 0) {
				return data;
			}
		} catch (e) {
			console.warn('\nCould not parse existing hacks.json, starting fresh.');
		}
	}
	return [];
}

async function fetchAllHacks() {
	const existingHacks = loadExistingHacks();
	const knownIds = new Set(existingHacks.map((h) => h.id));
	const newHacks = [];

	let currentPage = 1;
	let lastPage = 1;
	let stopFetching = false;

	if (knownIds.size > 0) {
		console.log(`Found ${knownIds.size} existing hacks. Starting delta fetch...`);
	}

	do {
		process.stdout.write(`\rFetching page ${currentPage}/${lastPage}...`);
		const data = await fetchPage(currentPage);
		lastPage = data.last_page ?? 1;

		for (const hack of data.data ?? []) {
			if (knownIds.has(hack.id)) {
				stopFetching = true;
				break;
			}

			const fields = hack.raw_fields ?? hack.fields ?? {};
			const diffId = normalizeDifficulty(fields.difficulty ?? hack.difficulty ?? '');
			const types = normalizeTypes(fields.type ?? hack.type);

			let parsedExits = 0;
			const lengthRaw = fields.length ?? hack.length;
			if (typeof lengthRaw === 'number') {
				parsedExits = lengthRaw;
			} else if (typeof lengthRaw === 'string') {
				const matched = lengthRaw.match(/(\d+)/);
				if (matched) parsedExits = parseInt(matched[1], 10);
			}

			newHacks.push({
				id: hack.id,
				name: hack.name,
				url: hack.download_url ?? hack.url ?? '',
				page_url: `https://www.smwcentral.net/?p=section&a=details&id=${hack.id}`,
				types,
				difficulty: diffId,
				difficultyLabel: DIFFICULTY_ID_TO_LABEL[diffId] ?? 'No Difficulty',
				time: hack.time ?? 0,
				exits: parsedExits
			});
		}

		if (stopFetching) {
			process.stdout.write(`\nCaught up to known hacks on page ${currentPage}. Delta fetch complete.`);
			break;
		}

		currentPage++;
		if (currentPage <= lastPage) await sleep(DELAY_MS);
	} while (currentPage <= lastPage);

	process.stdout.write('\n');

	// Fetch details for new hacks
	if (newHacks.length > 0) {
		console.log(`Fetching details for ${newHacks.length} new hack(s)...`);
		for (let i = 0; i < newHacks.length; i++) {
			const hack = newHacks[i];
			process.stdout.write(`\rFetching details ${i + 1}/${newHacks.length} (id=${hack.id})...`);
			const details = await fetchDetails(hack.id);
			if (details) {
				hack.authors = details.authors;
				hack.description = details.description;
				hack.screenshots = details.screenshots;
			}
			if (i < newHacks.length - 1) await sleep(DELAY_MS);
		}
		process.stdout.write('\n');
	}

	// Back-fill details for existing hacks that are missing them
	const missingDetails = existingHacks.filter((h) => h.authors === undefined);
	if (missingDetails.length > 0) {
		console.log(`Back-filling details for ${missingDetails.length} existing hack(s) without details...`);
		for (let i = 0; i < missingDetails.length; i++) {
			const hack = missingDetails[i];
			process.stdout.write(`\rBack-filling ${i + 1}/${missingDetails.length} (id=${hack.id})...`);
			const details = await fetchDetails(hack.id);
			if (details) {
				hack.authors = details.authors;
				hack.description = details.description;
				hack.screenshots = details.screenshots;
			}
			if (i < missingDetails.length - 1) await sleep(DELAY_MS);
		}
		process.stdout.write('\n');
	}

	return [...newHacks, ...existingHacks];
}

async function main() {
	console.log('SMW Random Hack Chooser — Data Fetcher');
	console.log('Fetching all hacks from SMWCentral...');

	const hacks = await fetchAllHacks();
	console.log(`Fetched ${hacks.length} hacks total.`);

	mkdirSync(join(__dirname, '..', 'static'), { recursive: true });
	writeFileSync(OUTPUT_PATH, JSON.stringify(hacks, null, 2), 'utf-8');
	console.log(`Written to ${OUTPUT_PATH}`);
}

main().catch((err) => {
	console.error('Error:', err);
	process.exit(1);
});
