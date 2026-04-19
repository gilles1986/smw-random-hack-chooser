export const TYPE_OPTIONS: { label: string; value: string }[] = [
	{ label: 'Standard', value: 'standard' },
	{ label: 'Kaizo', value: 'kaizo' },
	{ label: 'Puzzle', value: 'puzzle' },
	{ label: 'Tool-Assisted', value: 'tool_assisted' },
	{ label: 'Pit', value: 'pit' }
];

export const DIFFICULTY_OPTIONS: { label: string; value: string }[] = [
	{ label: 'Newcomer', value: 'diff_1' },
	{ label: 'Casual', value: 'diff_2' },
	{ label: 'Intermediate', value: 'diff_3' },
	{ label: 'Advanced', value: 'diff_4' },
	{ label: 'Expert', value: 'diff_5' },
	{ label: 'Master', value: 'diff_6' },
	{ label: 'Grandmaster', value: 'diff_7' },
	{ label: 'No Difficulty', value: '' }
];

export const DIFFICULTY_ID_TO_LABEL: Record<string, string> = {
	diff_1: 'Newcomer',
	diff_2: 'Casual',
	diff_3: 'Intermediate',
	diff_4: 'Advanced',
	diff_5: 'Expert',
	diff_6: 'Master',
	diff_7: 'Grandmaster',
	'': 'No Difficulty'
};

export const HACKS_JSON_URL = 'hacks.json';
export const CACHE_KEY = 'smw_hacks_cache';
export const HISTORY_KEY = 'smw_chosen_hacks';
export const FILTERS_KEY = 'smw_filters';
export const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function smwCentralPageUrl(id: number): string {
	return `https://www.smwcentral.net/?p=section&a=details&id=${id}`;
}
