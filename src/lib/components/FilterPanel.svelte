<script lang="ts">
	import { TYPE_OPTIONS, DIFFICULTY_OPTIONS } from '$lib/constants';
	import { hacksStore } from '$lib/stores/hacksStore';

	const { filters, filteredHacks } = hacksStore;

	function toggleType(value: string) {
		filters.update((f) => {
			const types = f.types.includes(value)
				? f.types.filter((t) => t !== value)
				: [...f.types, value];
			return { ...f, types };
		});
	}

	function toggleDifficulty(value: string) {
		filters.update((f) => {
			const difficulties = f.difficulties.includes(value)
				? f.difficulties.filter((d) => d !== value)
				: [...f.difficulties, value];
			return { ...f, difficulties };
		});
	}

	function clearFilters() {
		filters.set({ types: [], difficulties: [], minExits: null, maxExits: null });
	}

	$: hasFilters = $filters.types.length > 0 || $filters.difficulties.length > 0 || $filters.minExits !== null || $filters.maxExits !== null;
</script>

<div class="filter-bar">
	<div class="filter-row">
		<span class="row-label">Type</span>
		<div class="chip-group">
			{#each TYPE_OPTIONS as opt}
				<button
					class="chip"
					class:active={$filters.types.includes(opt.value)}
					on:click={() => toggleType(opt.value)}
				>
					{opt.label}
				</button>
			{/each}
		</div>
	</div>

	<div class="filter-row">
		<span class="row-label">Difficulty</span>
		<div class="chip-group">
			{#each DIFFICULTY_OPTIONS as opt}
				<button
					class="chip"
					class:active={$filters.difficulties.includes(opt.value)}
					on:click={() => toggleDifficulty(opt.value)}
				>
					{opt.label}
				</button>
			{/each}
		</div>
	</div>

	<div class="filter-row">
		<span class="row-label">Exits</span>
		<div class="exits-inputs">
			<input type="number" min="0" placeholder="Min" bind:value={$filters.minExits} />
			<span>-</span>
			<input type="number" min="0" placeholder="Max" bind:value={$filters.maxExits} />
		</div>
	</div>

	<div class="filter-actions">
		<div class="match-badge">
			<strong>{$filteredHacks.length}</strong> matches
		</div>
		{#if hasFilters}
			<button class="btn-clear" on:click={clearFilters}>✕ Clear</button>
		{/if}
	</div>
</div>

<style>
	.filter-bar {
		background: var(--surface);
		border-bottom: 1px solid var(--border);
		padding: 1rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		position: relative;
	}

	.filter-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.row-label {
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
		min-width: 85px;
	}

	.chip-group {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.chip {
		background: var(--surface2);
		border: 1px solid var(--border);
		color: var(--text-muted);
		padding: 0.35rem 0.85rem;
		border-radius: 999px;
		font-size: 0.85rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		user-select: none;
	}

	.chip:hover {
		border-color: var(--text-muted);
		color: var(--text);
	}

	.chip.active {
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
		box-shadow: 0 0 10px rgba(124, 111, 247, 0.3);
	}

	.filter-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-top: 0.25rem;
	}

	.match-badge {
		background: var(--surface2);
		border: 1px solid var(--border);
		padding: 0.3rem 0.75rem;
		border-radius: 6px;
		font-size: 0.85rem;
		color: var(--text);
	}

	.match-badge strong {
		color: var(--accent);
	}

	.btn-clear {
		background: transparent;
		border: 1px solid transparent;
		color: var(--text-muted);
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		padding: 0.3rem 0.75rem;
		border-radius: 6px;
		transition: all 0.2s;
	}

	.btn-clear:hover {
		background: rgba(255, 100, 100, 0.1);
		border-color: rgba(255, 100, 100, 0.3);
		color: #ff6b6b;
	}

	.exits-inputs {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.exits-inputs input {
		width: 80px;
		padding: 0.35rem 0.6rem;
		border-radius: 6px;
		border: 1px solid var(--border);
		background: var(--surface2);
		color: var(--text);
		font-family: inherit;
		font-size: 0.85rem;
	}

	.exits-inputs input:focus {
		outline: none;
		border-color: var(--accent);
	}

	.exits-inputs span {
		color: var(--text-muted);
	}

	@media (max-width: 720px) {
		.filter-row {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}
	}
</style>
