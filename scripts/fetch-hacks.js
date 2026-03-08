#!/usr/bin/env node
/**
 * fetch-hacks.js
 * Fetches all SMW hacks from SMWCentral and writes them to static/hacks.json.
 * Run: node scripts/fetch-hacks.js
 *
 * The script fetches ALL hacks (all types, all difficulties) so the Svelte app
 * can filter entirely client-side without further API calls.
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
				// We reached a hack we already have.
				// Since results are newest-first, we can assume we have all older ones.
				stopFetching = true;
				break;
			}

			const fields = hack.raw_fields ?? hack.fields ?? {};
			const diffId = normalizeDifficulty(fields.difficulty ?? hack.difficulty ?? '');
			const types = normalizeTypes(fields.type ?? hack.type);
			newHacks.push({
				id: hack.id,
				name: hack.name,
				url: hack.download_url ?? hack.url ?? '',
				types,
				difficulty: diffId,
				difficultyLabel: DIFFICULTY_ID_TO_LABEL[diffId] ?? 'No Difficulty',
				time: hack.time ?? 0
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
