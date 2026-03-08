<script lang="ts">
	import type { Hack, ChosenHack } from '$lib/types';
	import { DIFFICULTY_ID_TO_LABEL } from '$lib/constants';
	import { historyStore } from '$lib/stores/historyStore';
	import { createEventDispatcher } from 'svelte';

	export let hack: Hack | null = null;

	const dispatch = createEventDispatcher<{ accepted: Hack; skipped: Hack }>();

	function accept() {
		if (!hack) return;
		const entry: ChosenHack = {
			id: hack.id,
			name: hack.name,
			url: hack.url,
			types: hack.types ?? [],
			difficulty: hack.difficulty,
			chosen_date: new Date().toISOString().slice(0, 10)
		};
		historyStore.add(entry);
		dispatch('accepted', hack);
	}

	function skip() {
		if (!hack) return;
		dispatch('skipped', hack);
	}

	$: diffLabel =
		(hack && (DIFFICULTY_ID_TO_LABEL[hack.difficulty] ?? 'Unknown')) || '';
	$: typeLabel = hack ? (hack.types ?? []).join(', ').replace(/_/g, ' ') : '';
</script>

<div class="result-panel" class:empty={!hack}>
	{#if hack}
		<div class="hack-info">
			<h2 class="hack-name">{hack.name}</h2>
			<div class="meta">
				<span class="badge type">{typeLabel}</span>
				<span class="badge difficulty">{diffLabel}</span>
			</div>
			<a class="download-link" href={hack.url} target="_blank" rel="noopener noreferrer">
				↗ Open on SMWCentral
			</a>
		</div>
		<div class="actions">
			<button class="btn btn-accept" on:click={accept}>✓ Accept — Add to History</button>
			<button class="btn btn-skip" on:click={skip}>→ Skip</button>
		</div>
	{:else}
		<p class="placeholder">Press <strong>Choose Random Hack</strong> to get started.</p>
	{/if}
</div>

<style>
	.result-panel {
		background: var(--surface);
		border: 2px solid var(--border);
		border-radius: 10px;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		min-height: 160px;
		justify-content: center;
	}

	.result-panel:not(.empty) {
		border-color: var(--accent);
	}

	.hack-info {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.hack-name {
		margin: 0;
		font-size: 1.4rem;
		font-weight: 700;
		word-break: break-word;
	}

	.meta {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.badge {
		display: inline-block;
		padding: 0.2rem 0.6rem;
		border-radius: 999px;
		font-size: 0.78rem;
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

	.download-link {
		color: var(--accent);
		font-weight: 600;
		font-size: 0.95rem;
		text-decoration: none;
	}

	.download-link:hover {
		text-decoration: underline;
	}

	.actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.btn {
		padding: 0.55rem 1.25rem;
		border-radius: 6px;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		border: none;
		transition: opacity 0.15s, transform 0.1s;
	}

	.btn:active {
		transform: scale(0.97);
	}

	.btn-accept {
		background: var(--accent);
		color: #fff;
	}

	.btn-accept:hover {
		opacity: 0.88;
	}

	.btn-skip {
		background: var(--surface2);
		color: var(--text);
		border: 1px solid var(--border);
	}

	.btn-skip:hover {
		border-color: var(--accent);
	}

	.placeholder {
		text-align: center;
		color: var(--text-muted);
		margin: 0;
	}
</style>
