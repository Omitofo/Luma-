import { useState } from "react";
import type { GameId } from "./types/game";
import type { LearnerProfile } from "./types/learner";
import { useLearnerStore } from "./store/useLearnerStore";
import { SetupScreen } from "./screens/SetupScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { AnkiGame } from "./screens/games/AnkiGame";
import { PhraseBuilderGame } from "./screens/games/PhraseBuilderGame";
import { ScenarioGame } from "./screens/games/ScenarioGame";

type Screen = "home" | GameId;

export default function App() {
  const { profile, hasProfile, setProfile } = useLearnerStore();
  const [screen, setScreen] = useState<Screen>("home");

  if (!hasProfile) {
    return (
      <SetupScreen
        onComplete={(p: LearnerProfile) => {
          setProfile(p);
          setScreen("home");
        }}
      />
    );
  }

  if (screen === "anki") {
    return <AnkiGame profile={profile!} onEnd={() => setScreen("home")} />;
  }

  if (screen === "phrase-builder") {
    return <PhraseBuilderGame profile={profile!} onEnd={() => setScreen("home")} />;
  }

  if (screen === "scenario") {
    return <ScenarioGame profile={profile!} onEnd={() => setScreen("home")} />;
  }

  return (
    <HomeScreen
      profile={profile!}
      onSelectGame={(id: GameId) => setScreen(id)}
      onUpdateProfile={setProfile}
    />
  );
}