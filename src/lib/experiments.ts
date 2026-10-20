/**
 * Public API for experiment assignment — now backed by the v2 engine.
 * Component code imports from here; the engine details are in ./experiments/.
 */

export {
  isExperimentActive,
  getVariant,
  isForcedVariant,
  isAnyForced,
  wasExposureFired,
  markExposureFired,
  migrateOnConsent as migrateExperimentAssignment,
} from './experiments/engine';

export { useXpExposure, fireXpExposure } from './experiments/exposure';
export type { ExperimentDef, VariantId, LayerId } from './experiments/registry';
