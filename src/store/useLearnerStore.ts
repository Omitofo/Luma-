import { useState, useEffect } from "react";
import type { LearnerProfile, Language } from "../types/learner";
import { ROMANIZATION_LANGUAGES } from "../types/learner";

const STORAGE_KEY = "luma_learner_profile";

function loadProfile(): LearnerProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LearnerProfile) : null;
  } catch {
    return null;
  }
}

function saveProfile(profile: LearnerProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

interface UseLearnerStore {
  profile: LearnerProfile | null;
  hasProfile: boolean;
  setProfile: (profile: LearnerProfile) => void;
  updateLanguage: (language: Language) => void;
  clearProfile: () => void;
}

export function useLearnerStore(): UseLearnerStore {
  const [profile, setProfileState] = useState<LearnerProfile | null>(
    loadProfile
  );

  useEffect(() => {
    if (profile) saveProfile(profile);
  }, [profile]);

  function setProfile(p: LearnerProfile) {
    const withRomanization: LearnerProfile = {
      ...p,
      showRomanization: ROMANIZATION_LANGUAGES.includes(p.language),
    };
    setProfileState(withRomanization);
  }

  function updateLanguage(language: Language) {
    if (!profile) return;
    setProfile({ ...profile, language });
  }

  function clearProfile() {
    localStorage.removeItem(STORAGE_KEY);
    setProfileState(null);
  }

  return {
    profile,
    hasProfile: profile !== null,
    setProfile,
    updateLanguage,
    clearProfile,
  };
}