/**
 * useLlm — React hook that wraps the Tauri LLM bridge.
 *
 * Guarantees
 * ──────────
 * 1. Abort on unmount  — listeners torn down + Rust thread signalled.
 * 2. Single active slot — starting a new request cancels the previous one.
 * 3. Stall timeout     — no token within STALL_TIMEOUT_MS → abort + error.
 * 4. User-friendly errors for the most common failure modes.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { LlmMessage } from "../types/llm";
import { acquireLlmSlot, releaseLlmSlot } from "../lib/llmAbortController";

const STALL_TIMEOUT_MS = 30_000;

interface UseLlmOptions {
  onToken?: (token: string) => void;
}

interface UseLlmReturn {
  generate: (messages: LlmMessage[], maxTokens?: number) => Promise<string>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export function useLlm(options: UseLlmOptions = {}): UseLlmReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optionsRef = useRef(options);
  useEffect(() => { optionsRef.current = options; }, [options]);

  const controllerRef = useRef<AbortController | null>(null);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        releaseLlmSlot(controllerRef.current);
        controllerRef.current = null;
        // Signal the Rust thread to stop processing tokens
        invoke("cancel_chat").catch(() => {});
      }
    };
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  // ── generate ──────────────────────────────────────────────────────────────
  const generate = useCallback(
    async (messages: LlmMessage[], maxTokens = 512): Promise<string> => {
      // Cancel any previous in-flight request first
      if (controllerRef.current) {
        releaseLlmSlot(controllerRef.current);
        invoke("cancel_chat").catch(() => {});
      }

      const controller = acquireLlmSlot();
      controllerRef.current = controller;

      setIsLoading(true);
      setError(null);

      let fullResponse = "";
      const unlisteners: UnlistenFn[] = [];
      let stallTimer: ReturnType<typeof setTimeout> | null = null;

      function resetStallTimer() {
        if (stallTimer) clearTimeout(stallTimer);
        stallTimer = setTimeout(() => {
          controller.abort();
          invoke("cancel_chat").catch(() => {});
        }, STALL_TIMEOUT_MS);
      }

      function cleanup() {
        if (stallTimer) clearTimeout(stallTimer);
        unlisteners.forEach((fn) => fn());
        unlisteners.length = 0;
      }

      try {
        // Register listeners BEFORE invoking so we capture all tokens
        const unlistenToken = await listen<string>("token", (e) => {
          if (controller.signal.aborted) return;
          fullResponse += e.payload;
          optionsRef.current.onToken?.(e.payload);
          resetStallTimer();
        });
        unlisteners.push(unlistenToken);

        const unlistenEnd = await listen<string>("token_end", (e) => {
          if (controller.signal.aborted) return;
          fullResponse = e.payload;
          if (stallTimer) clearTimeout(stallTimer);
        });
        unlisteners.push(unlistenEnd);

        if (controller.signal.aborted) throw new Error("cancelled");

        resetStallTimer();

        await invoke("chat", { messages, maxTokens });

        if (controller.signal.aborted) return "";

        return fullResponse;

      } catch (err) {
        if (controller.signal.aborted) return ""; // silent cancel

        const raw =
          err instanceof Error ? err.message
          : typeof err === "string" ? err
          : "Unknown error";

        const friendly =
          raw.toLowerCase().includes("connection") || raw.toLowerCase().includes("connect")
            ? "Cannot reach the AI model — is llama.cpp running on port 8080?"
            : raw.toLowerCase().includes("timeout") || raw.toLowerCase().includes("stall")
            ? "The AI model is taking too long. Please try again."
            : raw.startsWith("Error:")
            ? raw                // already formatted by Rust
            : `AI error: ${raw}`;

        setError(friendly);
        throw new Error(friendly);

      } finally {
        cleanup();
        if (controllerRef.current === controller) {
          setIsLoading(false);
        }
      }
    },
    []
  );

  return { generate, isLoading, error, reset };
}