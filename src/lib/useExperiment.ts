import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { EXPERIMENTS, type ExperimentId } from './experimentsConfig';
import { getVariant, isExperimentActive, isForcedVariant } from './experiments/engine';

export interface ExperimentState {
  /** The assigned variant ('A' = control, 'B', 'C', …). Always 'A' during SSR. */
  variant: string;
  active: boolean;
  forced: boolean;
  langOk: boolean;
}

// Stable SSR default — every page prerender sees control without flash.
const SSR_DEFAULTS: ExperimentState = { variant: 'A', active: false, forced: false, langOk: false };

export function useExperiment(id: ExperimentId): ExperimentState {
  const { language } = useLanguage();
  const exp = EXPERIMENTS[id];

  const [state, setState] = useState<ExperimentState>(SSR_DEFAULTS);

  useEffect(() => {
    const active = isExperimentActive(id);
    const variant = getVariant(id);
    const forced = isForcedVariant(id);
    const langOk = exp.langs.length === 0 || exp.langs.includes(language);
    setState({ variant, active, forced, langOk });
  }, [id, language, exp.langs]);

  return state;
}
