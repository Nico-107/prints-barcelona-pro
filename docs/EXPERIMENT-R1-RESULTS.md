# Experiment R1 Results

Period: Oct 3–19 2026 · ~215 visitors · owner traffic excluded

| Slot | Winner | Evidence |
|---|---|---|
| Homepage hero (`hero_pkg_r1`) | **v4**: "Impresión 3D en Barcelona — desde 10 €, sin pedido mínimo" / button "Ver mi precio — desde 10 €" | 6 of 8 leads; 11% lead rate vs ≤ 2% for the others |
| Calculator title (`calc_title_r1`) | **v4**: "Precio al instante — desde 10 €" | 6 leads / 46 vs ≤ 2 for the others |
| Header button (`header_btn_r1`) | **continue testing v3 vs v4 as `header_btn_r2`** | v3 "Precio al instante" and v4 "Precios desde 10 €" tied (3 leads each) — not significant |
| WhatsApp bubble (`float_label_r1`) | **v4**: "Habla con una persona real" | 26% WhatsApp clicks vs ~14% for the others |

## Actions taken (Prompt 17, branch `xp-winners-17`)

- `hero_pkg_r1`, `calc_title_r1`, `float_label_r1` set to `enabled: false`.
- `header_btn_r1` renamed to `header_btn_r2` (versions: 2 = v3 vs v4, 50/50); data starts clean.
- Winning copy promoted to permanent copy in `calc.title` and `whatsapp.float.label` for all 8 languages.
- Hero renders v4 copy directly for es/en/ca via `xp.hero.v4.*` keys.
- International pages (de/fr/it/nl/pt) updated: `nav.requestQuote`, `calc.title`, `whatsapp.float.label`.
- All `data-xp-slot` markup removed for the three ended experiments.
- `experiment_exposure` no longer sent for ended experiments.
