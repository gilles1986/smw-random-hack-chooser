import { writable, derived } from 'svelte/store';
import type { Hack, ActiveFilters } from '$lib/types';
import { CACHE_KEY, CACHE_TTL_MS, HACKS_JSON_URL } from '$lib/constants';
import { base } from '$app/paths';

function createHacksStore() {
	const allHacks = writable<Hack[]>([]);
	const loading = writable(false);
	const error = writable<string | null>(null);
	const filters = writable<ActiveFilters>({ types: [], difficulties: [], minExits: null, maxExits: null });

	async function loadHacks() {
		loading.set(true);
		error.set(null);

		try {
			// Fetch fresh data on every page load - do not cache the whole array in localStorage
			const url = base ? `${base}/${HACKS_JSON_URL}` : `/${HACKS_JSON_URL}`;
			const res = await fetch(url);
			if (!res.ok) throw new Error(`Failed to load hacks.json: HTTP ${res.status}`);
			const data: Hack[] = await res.json();

			allHacks.set(data);
		} catch (e) {
			error.set(e instanceof Error ? e.message : String(e));
		} finally {
			loading.set(false);
		}
	}

	function clearCache() {
		localStorage.removeItem(CACHE_KEY);
	}

	const filteredHacks = derived([allHacks, filters], ([$all, $filters]) => {
		return $all.filter((hack) => {
			const hackTypes = hack.types ?? [];
			const typeMatch =
				$filters.types.length === 0 ||
				$filters.types.some((t) => hackTypes.includes(t));
			const diffMatch =
				$filters.difficulties.length === 0 || $filters.difficulties.includes(hack.difficulty);
			const exits = hack.exits ?? 0;
			const minExitsMatch = $filters.minExits === null || exits >= $filters.minExits;
			const maxExitsMatch = $filters.maxExits === null || exits <= $filters.maxExits;
			
			return typeMatch && diffMatch && minExitsMatch && maxExitsMatch;
		});
	});

	return {
		allHacks: { subscribe: allHacks.subscribe },
		loading: { subscribe: loading.subscribe },
		error: { subscribe: error.subscribe },
		filters,
		filteredHacks,
		loadHacks,
		clearCache
	};
}

export const hacksStore = createHacksStore();
