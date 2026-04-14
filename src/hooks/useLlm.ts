/**
 * useLlm — single-slot LLM hook.
 *
 * Guarantees:
 * - Only ONE request in-flight at a time (module-level singleton).
 * - Calling generate() while another is running cancels the previous.
 * - Calling cancel() immediately stops listening for the response.
 * - useEffect cleanup in game components should call cancel() on unmount
 *   so exiting a game stops the request.
 *
 * NOTE on Rust-side cancellation:
 * reqwest::blocking does not support mid-flight abort. When cancel() is called,
 * we stop LISTENING for the response (so the UI unblocks immediately) and signal
 * the cancel_flag. The Rust thread will still finish its HTTP request, but it
 * will see the flag and discard the result instead of emitting token_end.
 * This means the model continues generating on the server side until it finishes,
 * but the frontend is already unblocked. True mid-flight cancellation would
 * require switching to reqwest async or using a streaming approach.
 */

import { useRef, useState, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// ─── module-level singleton ───────────────────────────────────────────────────
let _globalAbort: AbortController | null = null;

function acquireSlot(): AbortController {
  if (_globalAbort) {
    _globalAbort.abort();
    // Best-effort: set the Rust cancel flag so it discards the response
    invoke("cancel_chat").catch(() => {});
  }
  _globalAbort = new AbortController();
  return _globalAbort;
}

function releaseSlot(ac: AbortController) {
  if (_globalAbort === ac) _globalAbort = null;
}
// ─────────────────────────────────────────────────────────────────────────────

export function useLlm() {
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Cancel on unmount — called when user exits a game screen
  useEffect(() => {
    return () => {
      if (abortRef.current && !abortRef.current.signal.aborted) {
        console.log("[LLM] component unmounting — cancelling in-flight request");
        abortRef.current.abort();
        invoke("cancel_chat").catch(() => {});
      }
    };
  }, []);

  const cancel = useCallback(() => {
    if (abortRef.current && !abortRef.current.signal.aborted) {
      abortRef.current.abort();
      invoke("cancel_chat").catch(() => {});
    }
    setIsLoading(false);
  }, []);

  const generate = useCallback(
    async (messages: LlmMessage[], maxTokens = 512): Promise<string> => {
      const ac = acquireSlot();
      abortRef.current = ac;
      setIsLoading(true);

      const unlisteners: UnlistenFn[] = [];

      function cleanup() {
        unlisteners.forEach((fn) => fn());
        releaseSlot(ac);
        setIsLoading(false);
      }

      return new Promise<string>((resolve, reject) => {
        if (ac.signal.aborted) {
          cleanup();
          reject(new Error("cancelled"));
          return;
        }

        ac.signal.addEventListener(
          "abort",
          () => {
            cleanup();
            reject(new Error("cancelled"));
          },
          { once: true }
        );

        listen<string>("token_end", (event) => {
          if (ac.signal.aborted) return;
          cleanup();
          resolve(event.payload);
        }).then((fn) => unlisteners.push(fn));

        invoke("chat", {
          messages,
          maxTokens,
          temperature: 0.35,
        }).catch((err) => {
          if (ac.signal.aborted) return;
          cleanup();
          reject(err);
        });
      });
    },
    []
  );

  return { generate, isLoading, cancel };
}