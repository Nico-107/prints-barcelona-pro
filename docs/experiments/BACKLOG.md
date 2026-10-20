# Experiment Backlog

Queued tests — **do not build yet**. Each row has: hypothesis, variants, layer, primary metric, and MDE (minimum detectable effect) at ~115 sessions/week.

At current traffic, tests below ~1.5× relative lift will not reach significance within `maxDays: 56`. Prioritise tests with high expected effect size.

| # | Test | Layer | Hypothesis | Variants | Primary metric | MDE |
|---|---|---|---|---|---|---|
| 1 | **Price including shipping** | `checkout_modal` | Showing all-in price ("16,64 € con envío") reduces friction vs split "10,74 € + envío" | A: current split · B: total-first | `instant_checkout_initiated` | ≥1.5× · run after `modal_actions_r1` |
| 2 | **Primary button style** | `global_style` | Arrow icon or lift shadow on the CTA increases click rate | A: current · B: + arrow icon · C: + shadow/lift | `buy_clicked` | ≥1.5× · colour stays orange; contrast matters more than hue |
| 3 | **Hero background** | `global_style` | Subtle "print layer lines" pattern deepens the hero feel and increases upload | A: current grid · B: plain dark · C: print layer lines | `upload_started` | ≥1.5× |
| 4 | **Mobile sticky bottom bar** | `home_body` | A sticky "Sube tu archivo" bar after the hero lifts upload on mobile | A: none · B: sticky bar | `upload_started` | ≥1.5× · mobile only · run after `home_proof_r1` |
| 5 | **Sample-part offer** | `checkout_modal` | "¿Primera vez? Te enviamos una foto de tu pieza antes de enviarla" increases trust and conversion | A: none · B: offer shown | `instant_checkout_initiated` | ≥1.5× · real process only — owner must confirm |
| 6 | **Design page flow** | page-specific | Form-first layout converts better than examples-first for `/disena-tu-pieza-3d` | A: examples-first · B: form-first · C: WhatsApp-first | `contact_entered` | ≥1.5× |
| 7 | **Catalogue card pricing** | page-specific | Showing price on the card increases clicks vs "desde" price vs no price | A: current · B: exact price on card · C: no price | `cta_click` (catalog) | ≥1.5× |
| 8 | **FAQ position** | `home_body` | Moving FAQ before the calculator increases engagement and reduces abandoned uploads | A: current (after calc) · B: before calc | `upload_started` | ≥1.5× · run after `home_proof_r1` |
| 9 | **Free-shipping threshold message** | `checkout_modal` | "Envío gratis desde X €" nudges users toward higher-value orders | A: none · B: threshold shown | `instant_checkout_initiated` | ≥1.5× · **owner pricing decision required first** |
| 10 | **Exit-intent offer copy** | — | Better offer copy after `exit_reason` survey data | TBD based on survey results | `whatsapp_from_modal` | TBD · build after 4+ weeks of survey data |
