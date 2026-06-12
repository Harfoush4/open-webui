<script lang="ts">
	// Albert sign-in wipe-off. The sign-in page sweeps a quick navy panel in to
	// cover the screen, then navigates here and sets sessionStorage['albert-reveal'].
	// On first mount of the app we play the SLOW wipe-off: the navy panel that is
	// already covering the screen slides away to reveal the loaded app. Because
	// this lives on the app side (not the auth page), it outlasts navigation and
	// never delays entry — the app is interactive underneath while it wipes off.
	//
	// Styling lives in theme/overrides.css (.albert-reveal-out) so its duration is
	// tweakable without a rebuild; we remove the overlay on animationend, so the
	// JS never needs to know that duration (no number to keep in sync).
	import { onMount } from 'svelte';
	import { WEBUI_BASE_URL } from '$lib/constants';

	let show = false;

	onMount(() => {
		if (sessionStorage.getItem('albert-reveal') !== '1') return;
		sessionStorage.removeItem('albert-reveal'); // one-shot — don't replay
		const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
		if (reduceMotion) return; // app is simply there, no wipe
		show = true;
	});

	const done = (e: AnimationEvent) => {
		// Only the panel's own wipe (ignore the mark animation bubbling up).
		if (e.animationName !== 'albert-reveal-wipe') return;
		show = false;
	};
</script>

{#if show}
	<div class="albert-reveal-out" aria-hidden="true" on:animationend={done}>
		<img src="{WEBUI_BASE_URL}/static/albert-white.png" alt="" />
	</div>
{/if}
