<script lang="ts">
	import { historyStore } from '$lib/stores/historyStore';
	import { DIFFICULTY_ID_TO_LABEL } from '$lib/constants';
</script>

<div class="history-panel">
	<div class="history-header">
		<h3>Played Hacks ({$historyStore.length})</h3>
		{#if $historyStore.length > 0}
			<button class="btn-clear-all" on:click={() => historyStore.clear()}>Clear all</button>
		{/if}
	</div>

	{#if $historyStore.length === 0}
		<p class="empty-msg">No hacks accepted yet.</p>
	{:else}
		<div class="history-list">
			{#each $historyStore as entry (entry.id)}
				<div class="history-entry">
					<div class="entry-info">
						<a
							class="entry-name"
							href={entry.url}
							target="_blank"
							rel="noopener noreferrer"
							title="Open on SMWCentral"
						>
							{entry.name}
						</a>
						<div class="entry-meta">
						{#each entry.types ?? [] as t}
							<span class="badge type">{t.replace(/_/g, ' ')}</span>
						{/each}
							<span class="badge difficulty"
								>{DIFFICULTY_ID_TO_LABEL[entry.difficulty] ?? 'Unknown'}</span
							>
							<span class="entry-date">{entry.chosen_date}</span>
						</div>
					</div>
					<button
						class="btn-remove"
						title="Remove from history"
						on:click={() => historyStore.remove(entry.id)}
					>
						✕
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.history-panel {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 8px;
		overflow: hidden;
	}

	.history-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--border);
		background: var(--surface2);
	}

	.history-header h3 {
		margin: 0;
		font-size: 0.95rem;
	}

	.btn-clear-all {
		background: none;
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 0.2rem 0.6rem;
		font-size: 0.8rem;
		cursor: pointer;
		color: var(--text-muted);
		transition: border-color 0.15s, color 0.15s;
	}

	.btn-clear-all:hover {
		border-color: #e55;
		color: #e55;
	}

	.empty-msg {
		text-align: center;
		padding: 2rem;
		color: var(--text-muted);
		margin: 0;
		font-size: 0.9rem;
	}

	.history-list {
		max-height: 400px;
		overflow-y: auto;
	}

	.history-entry {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.65rem 1rem;
		border-bottom: 1px solid var(--border);
		gap: 0.5rem;
	}

	.history-entry:last-child {
		border-bottom: none;
	}

	.history-entry:hover {
		background: var(--surface2);
	}

	.entry-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 0;
	}

	.entry-name {
		font-weight: 600;
		font-size: 0.9rem;
		color: var(--accent);
		text-decoration: none;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.entry-name:hover {
		text-decoration: underline;
	}

	.entry-meta {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		flex-wrap: wrap;
	}

	.badge {
		display: inline-block;
		padding: 0.1rem 0.45rem;
		border-radius: 999px;
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: capitalize;
	}

	.badge.type {
		background: var(--badge-type-bg);
		color: var(--badge-type-fg);
	}

	.badge.difficulty {
		background: var(--badge-diff-bg);
		color: var(--badge-diff-fg);
	}

	.entry-date {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.btn-remove {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--text-muted);
		font-size: 0.8rem;
		padding: 0.25rem 0.4rem;
		border-radius: 4px;
		flex-shrink: 0;
		transition: background 0.15s, color 0.15s;
	}

	.btn-remove:hover {
		background: #e553;
		color: #e55;
	}
</style>
