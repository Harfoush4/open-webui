// Albert model tiers.
//
// Users shouldn't have to reason about raw Ollama model ids. We surface a
// simple Low / Medium / High tier as the primary label, and keep the real
// model id visible in a smaller font so an admin can still identify it.
//
// v1 mapping (CLAUDE.md tier decision). Models not listed here fall back to
// their own label (e.g. extra Ollama models an admin pulls).
export const MODEL_TIERS: Record<string, string> = {
	'llama3.3:70b': 'High',
	'qwen3-vl:30b-a3b-instruct': 'Medium - Best For Everyday Use',
	'qwen3:8b': 'Low'
};

/** Tier label for a model id, or null if the model isn't a named tier. */
export const tierLabel = (id: string | undefined | null): string | null =>
	id ? (MODEL_TIERS[id] ?? null) : null;
