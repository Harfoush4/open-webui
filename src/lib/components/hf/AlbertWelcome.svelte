<script lang="ts">
	// Albert first-login onboarding (Phase 6). Lets a user opt into memory,
	// seed an "about you" profile, and optionally import what another assistant
	// (ChatGPT/Claude) remembers about them. Seeds are stored as Open WebUI
	// memories (embedded via the host Ollama), which the grounding-safe memory
	// patch injects into the user message. Re-openable from Settings →
	// Personalization, so it doubles as the "Albert profile" editor.
	import { getContext } from 'svelte';
	import { toast } from 'svelte-sonner';

	import { settings, user } from '$lib/stores';
	import { updateUserSettings } from '$lib/apis/users';
	import { addNewMemory } from '$lib/apis/memories';

	import Modal from '$lib/components/common/Modal.svelte';
	import Switch from '$lib/components/common/Switch.svelte';

	const i18n = getContext('i18n');

	export let show = false;

	let memoryOn = true;
	let aboutYou = '';
	let importOpen = false;
	let importedMemory = '';
	let saving = false;

	// Prompt the user runs in their other assistant to export its memory.
	const EXTRACTION_PROMPT =
		'Summarise everything you know and remember about me — my role, how I work, my preferences, and how I like you to respond — as a short, copy-pasteable bullet list. Only include things you are confident about.';

	$: firstName = ($user?.name ?? '').split(' ')[0];

	const persist = async () => {
		// memory is a per-user setting; persist it + mark onboarding seen.
		await settings.set({ ...$settings, memory: memoryOn, albertWelcomeSeen: true });
		await updateUserSettings(localStorage.token, { ui: $settings });
	};

	const skip = async () => {
		await persist();
		show = false;
	};

	const saveAndContinue = async () => {
		if (saving) return;
		saving = true;
		try {
			const seeds = [aboutYou.trim(), importedMemory.trim()].filter((s) => s.length > 0);
			for (const s of seeds) {
				await addNewMemory(localStorage.token, s).catch((e) => console.error(e));
			}
			await persist();
			if (seeds.length) toast.success($i18n.t('Saved — Albert will remember this.'));
			show = false;
		} finally {
			saving = false;
		}
	};

	const copyPrompt = async () => {
		try {
			await navigator.clipboard.writeText(EXTRACTION_PROMPT);
			toast.success($i18n.t('Prompt copied'));
		} catch (e) {
			console.error(e);
		}
	};
</script>

<Modal bind:show size="md">
	<div class="px-6 py-5 text-black dark:text-white">
		<div class="flex items-center gap-2 mb-1">
			<img src="/static/favicon.png" class="size-7" alt="" />
			<h2 class="text-xl font-medium m-0 font-primary">
				{$i18n.t('Welcome to Albert')}{firstName ? `, ${firstName}` : ''} ✨
			</h2>
		</div>

		<p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
			{$i18n.t(
				"Albert can remember a few things about you across chats — your role, your projects, how you like replies — so you don't have to repeat yourself."
			)}
		</p>

		<div
			class="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-850 px-3.5 py-2.5 mb-4"
		>
			<div class="text-sm pr-3">
				<div class="font-medium">{$i18n.t('Memory is on')}</div>
				<div class="text-xs text-gray-500 dark:text-gray-400">
					{$i18n.t('You can turn it off anytime in Settings → Personalization.')}
				</div>
			</div>
			<Switch bind:state={memoryOn} />
		</div>

		<label class="text-sm font-medium block mb-1">
			{$i18n.t('About you')}
			<span class="text-gray-400 font-normal">({$i18n.t('optional')})</span>
		</label>
		<textarea
			bind:value={aboutYou}
			rows="4"
			placeholder={$i18n.t(
				"e.g. I'm in finance, I prefer concise bullet-point answers and British spelling."
			)}
			class="w-full text-sm rounded-xl bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 outline-none resize-none"
		/>

		<button
			type="button"
			class="mt-3 text-sm font-medium text-left flex items-center gap-1.5 hover:opacity-80"
			on:click={() => (importOpen = !importOpen)}
		>
			<span class="text-xs">{importOpen ? '▾' : '▸'}</span>
			{$i18n.t('Coming from ChatGPT or Claude? Import your memory')}
		</button>
		{#if importOpen}
			<div class="mt-2 text-xs text-gray-600 dark:text-gray-300">
				<div class="mb-1">{$i18n.t('1. Paste this into ChatGPT/Claude, then copy its reply:')}</div>
				<div
					class="flex items-start gap-2 rounded-lg bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 px-3 py-2"
				>
					<div class="flex-1 italic">{EXTRACTION_PROMPT}</div>
					<button type="button" class="shrink-0 underline" on:click={copyPrompt}
						>{$i18n.t('Copy')}</button
					>
				</div>
				<div class="mt-2 mb-1">{$i18n.t('2. Paste its reply here:')}</div>
				<textarea
					bind:value={importedMemory}
					rows="4"
					placeholder={$i18n.t('Paste what the other assistant remembers about you…')}
					class="w-full text-sm rounded-xl bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 outline-none resize-none"
				/>
			</div>
		{/if}

		<div class="flex justify-end gap-2 mt-5">
			<button
				type="button"
				class="px-3.5 py-1.5 text-sm font-medium rounded-full hover:bg-black/5 dark:hover:bg-white/5"
				on:click={skip}>{$i18n.t('Skip')}</button
			>
			<button
				type="button"
				disabled={saving}
				class="px-3.5 py-1.5 text-sm font-medium rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 disabled:opacity-50"
				on:click={saveAndContinue}>{$i18n.t('Save & continue')}</button
			>
		</div>
	</div>
</Modal>
