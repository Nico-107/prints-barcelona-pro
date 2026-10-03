import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { EXPERIMENTS, type ExperimentId } from "./experimentsConfig";
import { getAssignment, isExperimentActive, isForcedForExperiment } from "./experiments";

export interface ExperimentState {
  version: number;
  active: boolean;
  forced: boolean;
  langOk: boolean;
}

// Always start here — identical on server and on the first client render.
// Real values are applied in a useEffect after hydration, which avoids the
// mismatch that occurs when useState() initialises differently in the browser.
const SSR_DEFAULTS: ExperimentState = { version: 1, active: false, forced: false, langOk: false };

export function useExperiment(id: ExperimentId): ExperimentState {
  const { language } = useLanguage();
  const exp = EXPERIMENTS[id];

  const [state, setState] = useState<ExperimentState>(SSR_DEFAULTS);

  // Compute real assignment after mount so the initial render matches SSR.
  useEffect(() => {
    const active = isExperimentActive(id);
    const version = getAssignment(id);
    const forced = isForcedForExperiment(id);
    const langOk = (exp.langs as readonly string[]).includes(language);
    setState({ version, active, forced, langOk });
  }, [id, language, exp.langs]);

  return state;
}
