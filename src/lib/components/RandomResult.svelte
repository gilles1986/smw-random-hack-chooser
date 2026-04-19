<script lang="ts">
	import type { Hack, ChosenHack, HackDetails } from '$lib/types';
	import { DIFFICULTY_ID_TO_LABEL, smwCentralPageUrl } from '$lib/constants';
	import { historyStore } from '$lib/stores/historyStore';
	import { fetchHackDetails, stripHtml } from '$lib/hackDetails';
	import { createEventDispatcher } from 'svelte';

	export let hack: Hack | null = null;

	const dispatch = createEventDispatcher<{ accepted: Hack; skipped: Hack }>();

	let details: HackDetails | null = null;
	let activeScreenshot = 0;

	$: if (hack) {
		details = fetchHackDetails(hack);
		activeScreenshot = 0;
	} else {
		details = null;
		activeScreenshot = 0;
	}

	function accept() {
		if (!hack) return;
		const entry: ChosenHack = {
			id: hack.id,
			name: hack.name,
			url: hack.url,
			page_url: hack.page_url,
			types: hack.types ?? [],
			difficulty: hack.difficulty,
			exits: hack.exits,
			chosen_date: new Date().toISOString().slice(0, 10)
		};
		historyStore.add(entry);
		dispatch('accepted', hack);
	}

	function skip() {
		if (!hack) return;
		dispatch('skipped', hack);
	}

	function prevScreenshot() {
		if (!details || details.screenshots.length === 0) return;
		activeScreenshot = (activeScreenshot - 1 + details.screenshots.length) % details.screenshots.length;
	}

	function nextScreenshot() {
		if (!details || details.screenshots.length === 0) return;
		activeScreenshot = (activeScreenshot + 1) % details.screenshots.length;
	}

	$: diffLabel =
		(hack && (DIFFICULTY_ID_TO_LABEL[hack.difficulty] ?? 'Unknown')) || '';
	$: typeLabel = hack ? (hack.types ?? []).join(', ').replace(/_/g, ' ') : '';
	$: descriptionText = details?.description ? stripHtml(details.description) : null;
</script>

<div class="result-panel" class:empty={!hack}>
	{#if hack}
		<div class="hack-info">
			<h2 class="hack-name">{hack.name}</h2>
			{#if details?.authors?.length}
				<p class="hack-authors">by {details.authors.join(', ')}</p>
			{/if}
			<div class="meta">
				<span class="badge type">{typeLabel}</span>
				<span class="badge difficulty">{diffLabel}</span>
				{#if hack.exits !== undefined && hack.exits >= 0}
					<span class="badge exits">{hack.exits} Exit{hack.exits !== 1 ? 's' : ''}</span>
				{/if}
			</div>
		<div class="hack-links">
			<a
				class="page-link"
				href={hack.page_url ?? smwCentralPageUrl(hack.id)}
				target="_blank"
				rel="noopener noreferrer"
			>
				↗ SMWCentral Page
			</a>
			{#if hack.url}
				<a class="download-link" href={hack.url} target="_blank" rel="noopener noreferrer">
					⬇ Download ZIP
				</a>
			{/if}
		</div>
		</div>

		{#if details}
			{#if details.screenshots.length > 0}
				<div class="screenshots">
					<div class="screenshot-viewer">
						<img
							src={details.screenshots[activeScreenshot]}
							alt="Screenshot {activeScreenshot + 1} of {hack.name}"
							class="screenshot-img"
						/>
						{#if details.screenshots.length > 1}
							<div class="screenshot-nav">
								<button class="nav-btn" on:click={prevScreenshot} aria-label="Previous screenshot">‹</button>
								<span class="screenshot-counter">{activeScreenshot + 1} / {details.screenshots.length}</span>
								<button class="nav-btn" on:click={nextScreenshot} aria-label="Next screenshot">›</button>
							</div>
						{/if}
					</div>
				</div>
			{/if}
			{#if descriptionText}
				<div class="description">{descriptionText}</div>
			{/if}
		{/if}

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

	.badge.exits {
		background: var(--surface2);
		color: var(--text);
		border: 1px solid var(--border);
	}

	.hack-links {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		align-items: center;
	}

	.page-link,
	.download-link {
		color: var(--accent);
		font-weight: 600;
		font-size: 0.95rem;
		text-decoration: none;
	}

	.page-link:hover,
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

	/* ── Screenshots ── */
	.screenshots {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.screenshot-viewer {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
		background: var(--surface2);
		border-radius: 8px;
		padding: 0.5rem;
		border: 1px solid var(--border);
	}

	.screenshot-img {
		max-width: 100%;
		max-height: 280px;
		object-fit: contain;
		border-radius: 4px;
		display: block;
	}

	.screenshot-nav {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.nav-btn {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 0.1rem 0.55rem;
		font-size: 1.1rem;
		cursor: pointer;
		color: var(--text);
		line-height: 1.4;
		transition: border-color 0.15s;
	}

	.nav-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.screenshot-counter {
		font-size: 0.8rem;
		color: var(--text-muted);
		min-width: 3rem;
		text-align: center;
	}

	/* ── Description ── */
	.description {
		font-size: 0.88rem;
		line-height: 1.55;
		color: var(--text);
		background: var(--surface2);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 0.75rem 1rem;
		max-height: 200px;
		overflow-y: auto;
		word-break: break-word;
		white-space: pre-line;
	}

	.hack-authors {
		margin: 0;
		font-size: 0.85rem;
		color: var(--text-muted);
	}
</style>
