import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { LlmMessage } from "../types/llm";

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

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  const generate = useCallback(
    async (messages: LlmMessage[], maxTokens = 512): Promise<string> => {
      setIsLoading(true);
      setError(null);

      let fullResponse = "";

      const unlistenToken = await listen<string>("token", (e) => {
        fullResponse += e.payload;
        options.onToken?.(e.payload);
      });

      const unlistenEnd = await listen<string>("token_end", (e) => {
        fullResponse = e.payload;
      });

      try {
        await invoke("chat", {
          messages,
          maxTokens,
        });
        return fullResponse;
      } catch (err) {
        const msg = String(err);
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsLoading(false);
        unlistenToken();
        unlistenEnd();
      }
    },
    [options]
  );

  return { generate, isLoading, error, reset };
}