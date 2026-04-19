import type { HackDetails } from '$lib/types';

const SMWC_API = 'https://www.smwcentral.net/ajax.php';

// In-memory cache to avoid re-fetching when skipping through results
const detailsCache = new Map<number, HackDetails>();

/**
 * Fetches description, screenshots, and authors for a hack from the SMWCentral API.
 * Returns null if the request fails (e.g. CORS, network error, invalid response).
 */
export async function fetchHackDetails(hackId: number): Promise<HackDetails | null> {
	const cached = detailsCache.get(hackId);
	if (cached !== undefined) {
		return cached;
	}

	try {
		const params = new URLSearchParams({
			a: 'getsectiondetails',
			s: 'smwhacks',
			id: String(hackId)
		});
		const res = await fetch(`${SMWC_API}?${params}`, {
			headers: { Accept: 'application/json' }
		});
		if (!res.ok) return null;

		const json = await res.json();

		// Extract description — may be an HTML string
		const description: string | null =
			json.description ?? json.fields?.description ?? json.raw_fields?.description ?? null;

		// Extract screenshot URLs — API may return an array of objects or strings
		const rawScreenshots: unknown[] =
			json.screenshots ?? json.fields?.screenshots ?? json.raw_fields?.screenshots ?? [];
		const screenshots: string[] = rawScreenshots
			.map((s) => {
				if (typeof s === 'string') return s;
				if (s && typeof s === 'object') {
					const obj = s as Record<string, unknown>;
					return (obj.url ?? obj.src ?? obj.link ?? '') as string;
				}
				return '';
			})
			.filter(Boolean);

		// Extract author(s)
		const rawAuthors: unknown[] = json.authors ?? json.fields?.authors ?? json.raw_fields?.authors ?? [];
		const authors: string[] = rawAuthors
			.map((a) => {
				if (typeof a === 'string') return a;
				if (a && typeof a === 'object') {
					const obj = a as Record<string, unknown>;
					return (obj.name ?? obj.username ?? '') as string;
				}
				return '';
			})
			.filter(Boolean);

		const details: HackDetails = { description, screenshots, authors };
		detailsCache.set(hackId, details);
		return details;
	} catch {
		return null;
	}
}

/**
 * Strip all HTML tags from a string, leaving only plain text.
 * Used to safely display API-provided descriptions without XSS risk.
 */
export function stripHtml(html: string): string {
	return html
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<\/p>/gi, '\n')
		.replace(/<[^>]+>/g, '')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&nbsp;/g, ' ')
		.trim();
}
