//lib/llmAbortController.ts
/**
 * Global LLM abort controller.
 * Only one LLM session can run at a time — cancelling before starting a new
 * one prevents orphaned event listeners and duplicate token streams.
 */

let currentController: AbortController | null = null;

export function getLlmController(): AbortController {
  return currentController!;
}

/** Call before every new LLM request. Cancels any in-flight request. */
export function acquireLlmSlot(): AbortController {
  if (currentController) {
    currentController.abort();
  }
  currentController = new AbortController();
  return currentController;
}

/** Call in cleanup (useEffect return / unmount). */
export function releaseLlmSlot(controller: AbortController): void {
  if (currentController === controller) {
    controller.abort();
    currentController = null;
  }
}