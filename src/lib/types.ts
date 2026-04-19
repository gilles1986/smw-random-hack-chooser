export interface Hack {
	id: number;
	name: string;
	url: string;
	/** SMWCentral page URL for this hack */
	page_url?: string;
	/** All types this hack belongs to (lowercase), e.g. ["kaizo", "tool_assisted"] */
	types: string[];
	difficulty: string;
	time: number;
        exits?: number;
}

export interface ChosenHack {
        id: number;
        name: string;
        url: string;
        page_url?: string;
        types: string[];
        difficulty: string;
        chosen_date: string;
        exits?: number;
}

export interface HacksCache {
        fetched_at: string;
        data: Hack[];
}

export interface ActiveFilters {
        types: string[];
        difficulties: string[];
        minExits: number | null;
        maxExits: number | null;
}
