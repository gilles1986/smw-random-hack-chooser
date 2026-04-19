import type { Hack, HackDetails } from '$lib/types';

/**
 * Returns description, screenshots, and authors for a hack.
 * All detail fields are pre-fetched at build time (via scripts/fetch-hacks.js) and
 * embedded in hacks.json to avoid browser-side CORS issues with the SMWCentral API.
 * Returns null when no details are available (e.g. legacy entries not yet re-fetched).
 */
export function fetchHackDetails(hack: Hack): HackDetails | null {
	if (
		hack.authors === undefined &&
		hack.description === undefined &&
		hack.screenshots === undefined
	) {
		return null;
	}

	return {
		description: hack.description ?? null,
		screenshots: hack.screenshots ?? [],
		authors: hack.authors ?? []
	};
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
