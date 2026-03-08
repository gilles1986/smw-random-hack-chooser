import { writable } from 'svelte/store';
import type { ChosenHack } from '$lib/types';
import { HISTORY_KEY } from '$lib/constants';

function createHistoryStore() {
	function loadFromStorage(): ChosenHack[] {
		if (typeof localStorage === 'undefined') return [];
		try {
			const raw = localStorage.getItem(HISTORY_KEY);
			return raw ? JSON.parse(raw) : [];
		} catch {
			return [];
		}
	}

	function persist(items: ChosenHack[]) {
		localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
	}

	const { subscribe, set, update } = writable<ChosenHack[]>(loadFromStorage());

	return {
		subscribe,

		add(hack: ChosenHack) {
			update((items) => {
				const exists = items.some((h) => h.id === hack.id);
				if (exists) return items;
				const next = [hack, ...items];
				persist(next);
				return next;
			});
		},

		remove(id: number) {
			update((items) => {
				const next = items.filter((h) => h.id !== id);
				persist(next);
				return next;
			});
		},

		clear() {
			set([]);
			localStorage.removeItem(HISTORY_KEY);
		},

		getIds(): number[] {
			let ids: number[] = [];
			const unsub = subscribe((items) => {
				ids = items.map((h) => h.id);
			});
			unsub();
			return ids;
		}
	};
}

export const historyStore = createHistoryStore();
