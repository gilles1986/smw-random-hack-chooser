export interface Hack {
	id: number;
	name: string;
	url: string;
	/** All types this hack belongs to (lowercase), e.g. ["kaizo", "tool_assisted"] */
	types: string[];
	difficulty: string;
	time: number;
}

export interface ChosenHack {
	id: number;
	name: string;
	url: string;
	types: string[];
	difficulty: string;
	chosen_date: string;
}

export interface HacksCache {
	fetched_at: string;
	data: Hack[];
}

export interface ActiveFilters {
	types: string[];
	difficulties: string[];
}
