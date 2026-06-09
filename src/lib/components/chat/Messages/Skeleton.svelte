<script lang="ts">
	// Albert "thinking" indicator — shown while a response is generating.
	// The Albert spark breathes in the themed accent colour (navy in light,
	// glow-blue in dark via --color-accent from our theme tokens), so it reads
	// as "Albert is thinking" instead of a generic loading dot.
	export let size = 'md';
	$: dim = size === 'md' ? 'size-5' : size === 'xs' ? 'size-3.5' : 'size-4';
</script>

<span
	class="relative flex {dim} mx-1 my-1"
	style="color: var(--color-accent, #2d2e80);"
	aria-label="Albert is thinking"
>
	<svg viewBox="0 0 100 100" class="albert-thinking-spark w-full h-full" fill="currentColor" aria-hidden="true">
		<path d="M50 4 C 54 30 56 44 96 50 C 56 56 54 70 50 96 C 46 70 44 56 4 50 C 44 44 46 30 50 4 Z" />
	</svg>
</span>

<style>
	@keyframes albert-think {
		0%,
		100% {
			transform: scale(0.9);
			opacity: 0.6;
		}
		50% {
			transform: scale(1.08);
			opacity: 1;
		}
	}
	.albert-thinking-spark {
		transform-origin: center;
		animation: albert-think 1.4s ease-in-out infinite;
	}
	@media (prefers-reduced-motion: reduce) {
		.albert-thinking-spark {
			animation: none;
			opacity: 0.85;
		}
	}
</style>
