import { useState, useCallback } from "react";
import type { LearnerProfile } from "../../../types/learner";
import type { ScenarioDialogue } from "../../../types/llm";
import { useLlm } from "../../../hooks/useLlm";
import { buildScenarioPrompt } from "../../../lib/prompts/scenario";
import { parseLlmJson } from "../../../lib/utils";
import { GameShell } from "../../../components/layout/GameShell";
import { ScenarioInput } from "./ScenarioInput";
import { DialogueView } from "./DialogueView";

type Phase = "input" | "viewing";

interface Props {
  profile: LearnerProfile;
  onEnd: () => void;
}

export function ScenarioGame({ profile, onEnd }: Props) {
  const [phase, setPhase] = useState<Phase>("input");
  const [dialogue, setDialogue] = useState<ScenarioDialogue | null>(null);
  const [currentScenario, setCurrentScenario] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { generate, isLoading } = useLlm();

  const generateDialogue = useCallback(
    async (scenarioText: string) => {
      setError(null);

      const { system, user } = buildScenarioPrompt(scenarioText, profile);

      try {
        const raw = await generate(
          [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          700
        );

        const parsed = parseLlmJson<ScenarioDialogue>(raw);

        if (!parsed || !Array.isArray(parsed.turns) || parsed.turns.length === 0) {
          setError("Could not parse dialogue. Please try again.");
          return;
        }

        setDialogue(parsed);
        setCurrentScenario(scenarioText);
        setPhase("viewing");
      } catch {
        setError("Failed to generate dialogue. Is llama.cpp running?");
      }
    },
    [generate, profile]
  );

  async function handleNextDialogue() {
    // Re-generate the same scenario for variety
    await generateDialogue(currentScenario);
  }

  function handleChangeScenario() {
    setPhase("input");
    setDialogue(null);
    setError(null);
  }

  return (
    <GameShell title="Real Scenarios" icon="💬" onEnd={onEnd}>
      {phase === "input" && (
        <div className="h-full flex flex-col">
          <ScenarioInput onGenerate={generateDialogue} isLoading={isLoading} />
          {error && (
            <p className="text-center text-xs text-red-400 pb-4">{error}</p>
          )}
        </div>
      )}

      {phase === "viewing" && dialogue && (
        <DialogueView
          dialogue={dialogue}
          onNext={handleNextDialogue}
          onChangeScenario={handleChangeScenario}
          isLoading={isLoading}
        />
      )}
    </GameShell>
  );
}