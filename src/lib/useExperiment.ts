import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { EXPERIMENTS, type ExperimentId } from "./experimentsConfig";
import { getAssignment, isExperimentActive, isForcedForExperiment } from "./experiments";

export interface ExperimentState {
  version: number;
  active: boolean;
  forced: boolean;
  langOk: boolean;
}

/**
 * Returns experiment state for the given experiment id.
 * SSR-safe: returns version 1 / active false on the server.
 * Reads assignment from document.documentElement.dataset[attr] first
 * (set by the head anti-flicker script) and never re-rolls.
 */
export function useExperiment(id: ExperimentId): ExperimentState {
  const { language } = useLanguage();
  const exp = EXPERIMENTS[id];

  const [state, setState] = useState<ExperimentState>(() => {
    if (typeof window === "undefined") {
      return { version: 1, active: false, forced: false, langOk: false };
    }
    const active = isExperimentActive(id);
    const version = getAssignment(id);
    const forced = isForcedForExperiment(id);
    const langOk = (exp.langs as readonly string[]).includes(language);
    return { version, active, forced, langOk };
  });

  // Recompute langOk when language changes (user switches language)
  useEffect(() => {
    const langOk = (exp.langs as readonly string[]).includes(language);
    setState((prev) => prev.langOk !== langOk ? { ...prev, langOk } : prev);
  }, [language, exp.langs]);

  return state;
}
