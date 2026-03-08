<script lang="ts">
	import { onMount } from 'svelte';
	import type { Hack } from '$lib/types';
	import { hacksStore } from '$lib/stores/hacksStore';
	import { historyStore } from '$lib/stores/historyStore';
	import FilterPanel from '$lib/components/FilterPanel.svelte';
	import RandomResult from '$lib/components/RandomResult.svelte';
	import HistoryList from '$lib/components/HistoryList.svelte';

	const { loading, error, filteredHacks } = hacksStore;

	let currentHack: Hack | null = null;

	onMount(() => {
		hacksStore.loadHacks();
	});

	function chooseRandom() {
		const excludedIds = new Set($historyStore.map((h) => h.id));
		const pool = $filteredHacks.filter((h) => !excludedIds.has(h.id));

		if (pool.length === 0) {
			alert('No hacks available with current filters (all may already be in history).');
			return;
		}

		const idx = Math.floor(Math.random() * pool.length);
		currentHack = pool[idx];
	}

	function onAccepted() {
		currentHack = null;
	}

	function onSkipped() {
		chooseRandom();
	}

	$: availableCount = $filteredHacks.filter(
		(h) => !$historyStore.some((c) => c.id === h.id)
	).length;
</script>

<div class="app">
	<header class="app-header">
		<div class="header-inner">
			<h1>🎲 SMW Random Hack Chooser</h1>
			<p class="subtitle">Let fate decide your next Super Mario World hack</p>
		</div>
	</header>

	<FilterPanel />

	<main class="app-main">
		<section class="action-column">
			<div class="choose-section">
				{#if $loading}
					<div class="loading-indicator">
						<span class="spinner"></span>
						Loading hack database…
					</div>
				{:else if $error}
					<div class="error-box">
						⚠ {$error}
						<button on:click={() => hacksStore.loadHacks()}>Retry</button>
					</div>
				{:else}
					<button
						class="btn-choose"
						disabled={availableCount === 0}
						on:click={chooseRandom}
					>
						🎲 Choose Random Hack
					</button>
					<span class="pool-info">{availableCount} hacks in pool ready to play</span>
				{/if}
			</div>

			<RandomResult hack={currentHack} on:accepted={onAccepted} on:skipped={onSkipped} />
		</section>

		<section class="history-column">
			<HistoryList />
		</section>
	</main>
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--bg);
		color: var(--text);
	}

	.app-header {
		background: var(--header-bg);
		border-bottom: 1px solid var(--border);
		padding: 1rem 1.5rem;
	}

	.header-inner h1 {
		margin: 0;
		font-size: 1.6rem;
	}

	.subtitle {
		margin: 0.2rem 0 0 0;
		color: var(--text-muted);
		font-size: 0.9rem;
	}

	.app-main {
		display: grid;
		grid-template-columns: 1.3fr 1fr;
		gap: 1.5rem;
		padding: 2rem 1.5rem;
		max-width: 1200px;
		width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
		flex: 1;
	}

	@media (max-width: 850px) {
		.app-main {
			grid-template-columns: 1fr;
		}
	}

	.action-column,
	.history-column {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.choose-section {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.75rem;
	}

	.btn-choose {
		padding: 1rem 2rem;
		font-size: 1.15rem;
		font-weight: 700;
		border-radius: 12px;
		border: none;
		background: linear-gradient(135deg, var(--accent), #5648d8);
		color: #fff;
		cursor: pointer;
		transition: all 0.15s ease;
		box-shadow: 0 4px 15px rgba(124, 111, 247, 0.25);
	}

	.btn-choose:disabled {
		opacity: 0.4;
		cursor: not-allowed;
		box-shadow: none;
		background: var(--surface2);
		color: var(--text-muted);
	}

	.btn-choose:not(:disabled):hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(124, 111, 247, 0.4);
	}

	.btn-choose:not(:disabled):active {
		transform: translateY(1px) scale(0.98);
		box-shadow: 0 2px 10px rgba(124, 111, 247, 0.3);
	}

	.pool-info {
		font-size: 0.9rem;
		color: var(--text-muted);
		padding-left: 0.5rem;
	}

	.loading-indicator {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 0.9rem;
		color: var(--text-muted);
	}

	.spinner {
		display: inline-block;
		width: 18px;
		height: 18px;
		border: 2px solid var(--border);
		border-top-color: var(--accent);
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error-box {
		background: #fee;
		border: 1px solid #fcc;
		border-radius: 6px;
		padding: 0.6rem 1rem;
		font-size: 0.9rem;
		color: #c33;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.error-box button {
		padding: 0.2rem 0.6rem;
		border: 1px solid #c33;
		border-radius: 4px;
		background: none;
		color: #c33;
		cursor: pointer;
	}
</style>
