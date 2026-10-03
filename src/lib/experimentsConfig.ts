export const EXPERIMENTS = {
  hero_pkg_r1:    { attr: "xpHeroPkg",    qa: "xp_hero",   versions: 4, enabled: true,  endsOn: "2026-12-28", langs: ["es","en","ca"] as const },
  header_btn_r1:  { attr: "xpHeaderBtn",  qa: "xp_header", versions: 4, enabled: false, endsOn: "2026-12-28", langs: ["es","en","ca"] as const },
  float_label_r1: { attr: "xpFloatLabel", qa: "xp_float",  versions: 4, enabled: false, endsOn: "2026-12-28", langs: ["es","en","ca"] as const },
  calc_title_r1:  { attr: "xpCalcTitle",  qa: "xp_calc",   versions: 4, enabled: false, endsOn: "2026-12-28", langs: ["es","en","ca"] as const },
} as const;

export type ExperimentId = keyof typeof EXPERIMENTS;
