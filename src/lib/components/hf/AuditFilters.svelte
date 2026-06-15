<script lang="ts">
	// Albert — inline compliance-audit filter panel (V2-A).
	//
	// Shown AFTER a site is resolved and BEFORE the audit runs, mirroring the
	// standalone auditor's filter bar (period / type / status / latest), all
	// combinable. The compliance_audit_tool emits a `chat:message:albert_filters`
	// event with {site, client_ref}; Chat.svelte stashes it on the message and
	// ResponseMessage renders this panel.
	//
	// On "Run audit" we hand a structured `Run audit: …` message to onRun (the
	// parent submits it as the next turn). The tool detects the "Run audit:"
	// prefix, parses the filters, and runs the audit with them.
	export let site: string = '';
	export let clientRef: string = '';
	export let onRun: (text: string) => void = () => {};

	const PERIODS = [
		{ d: 180, label: '6 mo' },
		{ d: 365, label: '1 yr' },
		{ d: 730, label: '2 yr' },
		{ d: 1825, label: '5 yr' },
		{ d: -1, label: 'All time' }
	];
	const TYPES = [
		'Any',
		'EICR',
		'Fire Alarm',
		'Emergency Light',
		'PAT',
		'Gas',
		'Gas Catering',
		'Air Conditioning',
		'Oil',
		'PFFE'
	];
	const STATUSES = [
		{ v: '', label: 'Any' },
		{ v: 'current', label: 'Current' },
		{ v: 'expired', label: 'Expired' },
		{ v: 'unsatisfactory', label: 'Unsat' }
	];

	// Defaults match the standalone auditor: last 5 years, any type/status, all on file.
	let period = 1825;
	let selectedTypes = new Set(); // empty = Any (all types); Type is MULTI-select
	let status = '';
	let latest = false;
	let submitted = false;

	function toggleType(t) {
		if (t === 'Any') {
			selectedTypes = new Set(); // "Any" clears the selection
			return;
		}
		const next = new Set(selectedTypes);
		next.has(t) ? next.delete(t) : next.add(t);
		selectedTypes = next; // reassign so Svelte reacts
	}

	function run() {
		if (submitted || !site) return;
		submitted = true;
		const periodTok = period === -1 ? 'all' : String(period);
		const typeTok = selectedTypes.size ? [...selectedTypes].join(',') : 'Any';
		const text =
			`Run audit: ${site} | type=${typeTok} | status=${status || 'Any'} ` +
			`| period=${periodTok} | latest=${latest}`;
		onRun(text);
	}
</script>

<div
	class="albert-audit-filters my-2 w-full rounded-2xl border border-gray-100 dark:border-gray-850 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm p-3.5"
>
	<div class="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2.5">
		Filter the audit — <span class="font-semibold text-gray-850 dark:text-gray-100">{site}</span>
	</div>

	<div class="flex items-start gap-2 mb-2">
		<span class="afl">Period</span>
		<div class="flex flex-wrap gap-1.5">
			{#each PERIODS as p}
				<button type="button" class="afchip" class:active={period === p.d} on:click={() => (period = p.d)}>
					{p.label}
				</button>
			{/each}
		</div>
	</div>

	<div class="flex items-start gap-2 mb-2">
		<span class="afl">Type<br /><span class="afhint">pick any</span></span>
		<div class="flex flex-wrap gap-1.5">
			{#each TYPES as t}
				<button
					type="button"
					class="afchip"
					class:active={t === 'Any' ? selectedTypes.size === 0 : selectedTypes.has(t)}
					on:click={() => toggleType(t)}
				>
					{t}
				</button>
			{/each}
		</div>
	</div>

	<div class="flex items-start gap-2 mb-2">
		<span class="afl">Status</span>
		<div class="flex flex-wrap gap-1.5">
			{#each STATUSES as s}
				<button type="button" class="afchip" class:active={status === s.v} on:click={() => (status = s.v)}>
					{s.label}
				</button>
			{/each}
		</div>
	</div>

	<div class="flex items-start gap-2 mb-3">
		<span class="afl">Latest</span>
		<div class="flex flex-wrap gap-1.5">
			<button type="button" class="afchip" class:active={!latest} on:click={() => (latest = false)}>
				All on file
			</button>
			<button type="button" class="afchip" class:active={latest} on:click={() => (latest = true)}>
				Latest only
			</button>
		</div>
	</div>

	<div class="flex justify-end">
		<button type="button" class="afbtn" on:click={run} disabled={submitted}>
			{submitted ? 'Running…' : 'Run audit ▸'}
		</button>
	</div>
</div>

<style>
	.afl {
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-gray-500, #7b87a8);
		min-width: 3.4rem;
		padding-top: 0.35rem;
		line-height: 1.25;
	}
	.afhint {
		font-weight: 600;
		letter-spacing: 0;
		text-transform: none;
		opacity: 0.7;
		font-size: 9px;
	}
	.afchip {
		font-size: 11px;
		font-weight: 600;
		padding: 0.25rem 0.6rem;
		border-radius: 9999px;
		border: 1px solid var(--color-gray-200, #e2e8f4);
		background: var(--color-gray-50, #f4f6fb);
		color: var(--color-gray-700, #3a3f60);
		cursor: pointer;
		transition: background 130ms, color 130ms, border-color 130ms, transform 130ms;
	}
	.afchip:hover {
		border-color: var(--color-accent-line, #a9ceee);
		background: var(--color-accent-soft, #e6f1fa);
		transform: translateY(-1px);
	}
	.afchip.active {
		background: var(--color-blue-600, #2d2e80);
		border-color: var(--color-blue-600, #2d2e80);
		color: #fff;
	}
	.afbtn {
		font-size: 12px;
		font-weight: 700;
		padding: 0.4rem 1rem;
		border-radius: 9999px;
		background: var(--color-blue-600, #2d2e80);
		color: #fff;
		box-shadow: 0 0 12px var(--color-accent-glow, rgba(127, 216, 245, 0.5));
		transition: transform 130ms, box-shadow 130ms, opacity 130ms;
	}
	.afbtn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 0 18px var(--color-accent-glow, rgba(127, 216, 245, 0.7));
	}
	.afbtn:disabled {
		opacity: 0.6;
		cursor: default;
	}
	@media (prefers-reduced-motion: reduce) {
		.afchip,
		.afbtn {
			transition: none;
		}
	}
</style>
