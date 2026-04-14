import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export function useLlm() {
  const [isLoading, setIsLoading] = useState(false);

  async function generate(messages: any[], maxTokens = 512) {
    setIsLoading(true);

    console.log("[LLM] request:", messages);

    return new Promise<string>((resolve, reject) => {
      let cleanupDone = false;

      const cleanup = () => {
        if (cleanupDone) return;
        cleanupDone = true;
        setIsLoading(false);
        unlistenToken();
        unlistenEnd();
      };

      let unlistenToken: any;
      let unlistenEnd: any;

      listen("token", (e) => {
        console.log("[TOKEN STREAM]", e.payload);
      }).then((fn) => (unlistenToken = fn));

      listen("token_end", (e) => {
        console.log("[FINAL RESULT]", e.payload);
        cleanup();
        resolve(e.payload as string);
      }).then((fn) => (unlistenEnd = fn));

      invoke("chat", {
        messages,
        maxTokens,
        temperature: 0.4,
      }).catch((err) => {
        console.error("[LLM ERROR]", err);
        cleanup();
        reject(err);
      });
    });
  }

  return { generate, isLoading };
}