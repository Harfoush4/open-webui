// Albert model tiers.
//
// Users shouldn't have to reason about raw Ollama model ids. We surface a
// simple Low / Medium / High tier as the primary label, and keep the real
// model id visible in a smaller font so an admin can still identify it.
//
// v1 mapping (CLAUDE.md tier decision). Models not listed here fall back to
// their own label (e.g. extra Ollama models an admin pulls).
//
// The picker points at the `albert-*` tags built by prompts/apply-tiers.sh —
// these have the grounding system prompt + num_ctx baked in (durable across
// Open WebUI DB resets). The raw base tags are kept as fallback labels in case
// an admin un-hides them.
export const MODEL_TIERS: Record<string, string> = {
	// Albert tier models (grounding baked in) — what the picker actually shows.
	'albert-high': 'High',
	'albert-high:latest': 'High',
	'albert-medium': 'Medium - Best For Everyday Use',
	'albert-medium:latest': 'Medium - Best For Everyday Use',
	'albert-low': 'Low',
	'albert-low:latest': 'Low',
	// Base tags (hidden from the picker in admin) — fallback labels only.
	'llama3.3:70b': 'High',
	'qwen3-vl:30b-a3b-instruct': 'Medium - Best For Everyday Use',
	'qwen3:8b': 'Low'
};

/** Tier label for a model id, or null if the model isn't a named tier. */
export const tierLabel = (id: string | undefined | null): string | null =>
	id ? (MODEL_TIERS[id] ?? null) : null;
