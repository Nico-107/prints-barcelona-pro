# A/B Experiment Registry

All experiments run through the shared engine in `src/lib/experimentsConfig.ts`.
The head snippet (CSS + JS) is generated at build time by the Vite plugin in `vite.config.ts`.

## Analysis exclusions

Always exclude sessions where `is_internal = true`, `xp_forced = true`, or `xp_<id> = "n/a"` from experiment analysis.

---

## Test 1 — hero_pkg_r1 (Hero Package)

| Field | Value |
|---|---|
| **ID** | `hero_pkg_r1` |
| **HTML attribute** | `data-xp-hero-pkg` |
| **Dataset property** | `xpHeroPkg` |
| **Analytics property** | `xp_hero_pkg_r1` |
| **QA param** | `?xp_hero=1..4` |
| **Slot selector** | `[data-xp-slot="hero_pkg_r1"]` |
| **Pages in scope** | `/` and `/ca` only (Hero.tsx) |
| **Enabled** | Yes |
| **Start** | 2026-10-03 |
| **End** | 2026-12-28 |
| **Languages** | es, en, ca (fr/de/nl/it/pt get Version 1 copy, no exposure fired) |
| **Versions** | 4 (25% each) |

### Version copy

**Version 1 (control)** — current site copy:
- Title: `hero.title` (e.g. "High-Quality 3D Printing in Barcelona")
- Subtitle: geo-detected or `hero.subtitle`
- Pill: `hero.speedPromise`
- Button: `hero.cta.getQuote`

**Version 2:**

| Lang | Title | Subtitle | Pill | Button | Under |
|---|---|---|---|---|---|
| EN | 3D printing in Barcelona | Upload your file. Get your price in 1 hour. | Free · No account · Real person | Get my price | No account needed |
| ES | Impresión 3D en Barcelona | Sube tu archivo. Recibe el precio en 1 hora. | Gratis · Sin registro · Persona real | Ver mi precio | Sin registro |
| CA | Impressió 3D a Barcelona | Puja el teu arxiu. Rep el preu en 1 hora. | Gratis · Sense compte · Persona real | Veure el meu preu | Sense compte |

**Version 3:**

| Lang | Title | Subtitle | Pill | Button | Under |
|---|---|---|---|---|---|
| EN | Custom 3D Printing in Barcelona — Prototypes, Spare Parts and One-Offs | Upload a 3D file for an instant price, or send a photo of what you need. A real person reviews every order and replies in under 1 hour. Pickup in Barcelona or shipping across Spain. | Free quote · No minimum order · PLA, PETG, ABS, TPU and more · 24–48h | Calculate my price — instant with a 3D file | Upload an STL file · No account · No commitment · A real person reviews every order |
| ES | Impresión 3D a medida en Barcelona — prototipos, repuestos y piezas únicas | Sube un archivo 3D para un precio al instante, o envía una foto de lo que necesitas. Una persona real revisa cada pedido y responde en menos de 1 hora. Recogida en Barcelona o envío a toda España. | Presupuesto gratuito · Sin pedido mínimo · PLA, PETG, ABS, TPU y más · 24–48h | Calcular mi precio — al instante con archivo 3D | Sube un archivo STL · Sin registro · Sin compromiso · Una persona real revisa cada pedido |
| CA | Impressió 3D a mida a Barcelona — prototips, recanvis i peces úniques | Puja un arxiu 3D per tenir un preu a l'instant, o envia'ns una foto del que necessites. Una persona real revisa cada comanda i respon en menys d'1 hora. Recollida a Barcelona o enviament a tot Espanya. | Pressupost gratuït · Sense comanda mínima · PLA, PETG, ABS, TPU i més · 24–48h | Calcular el meu preu — a l'instant amb arxiu 3D | Puja un arxiu STL · Sense compte · Sense compromís · Una persona real revisa cada comanda |

**Version 4:**

| Lang | Title | Subtitle | Pill | Button | Under |
|---|---|---|---|---|---|
| EN | 3D Printing in Barcelona — From €10, No Minimum | Send a file or a photo and get your price in under 1 hour. Pick up in Barcelona or we ship across Spain. | From €10 · No minimum order · Reviewed by a real person | Get my price — from €10 | No account · No commitment |
| ES | Impresión 3D en Barcelona — desde 10 €, sin pedido mínimo | Envía un archivo o una foto y recibe tu precio en menos de 1 hora. Recoge en Barcelona o te lo enviamos a toda España. | Desde 10 € · Sin pedido mínimo · Revisado por una persona real | Ver mi precio — desde 10 € | Sin registro · Sin compromiso |
| CA | Impressió 3D a Barcelona — des de 10 €, sense comanda mínima | Envia un arxiu o una foto i rep el teu preu en menys d'1 hora. Recull-ho a Barcelona o t'ho enviem a tot Espanya. | Des de 10 € · Sense comanda mínima · Revisat per una persona real | Veure el meu preu — des de 10 € | Sense compte · Sense compromís |

### Events

| Event | When | Key properties |
|---|---|---|
| `experiment_exposure` | Once per session, after self-check, active & langOk | `experiment`, `version`, `language`, `page_type`, `forced`, `visible_ok` |
| `experiment_error` | When render self-check fails | `experiment`, `reason`, `assigned`, `visible` |
| `quote_cta_click` | Hero button click (all versions) | `location: "hero"` |

---

## Test 2 — header_btn_r1 (Header Button)

**Status: enabled in Prompt 2**

| Field | Value |
|---|---|
| **ID** | `header_btn_r1` |
| **HTML attribute** | `data-xp-header-btn` |
| **Dataset property** | `xpHeaderBtn` |
| **QA param** | `?xp_header=1..4` |
| **Enabled** | No |
| **End** | 2026-12-28 |
| **Languages** | es, en, ca |

---

## Test 3 — float_label_r1 (WhatsApp Float Label)

**Status: enabled in Prompt 2**

| Field | Value |
|---|---|
| **ID** | `float_label_r1` |
| **HTML attribute** | `data-xp-float-label` |
| **Dataset property** | `xpFloatLabel` |
| **QA param** | `?xp_float=1..4` |
| **Enabled** | No |
| **End** | 2026-12-28 |
| **Languages** | es, en, ca |

---

## Test 4 — calc_title_r1 (Calculator Title)

**Status: enabled in Prompt 2**

| Field | Value |
|---|---|
| **ID** | `calc_title_r1` |
| **HTML attribute** | `data-xp-calc-title` |
| **Dataset property** | `xpCalcTitle` |
| **QA param** | `?xp_calc=1..4` |
| **Enabled** | No |
| **End** | 2026-12-28 |
| **Languages** | es, en, ca |

---

## Kill switch & end date behaviour

- Set `enabled: false` in `experimentsConfig.ts` and rebuild → all visitors see Version 1 regardless of stored assignment
- `endsOn` past → same effect automatically; no rebuild needed after the date passes
- Both paths are structurally enforced: the head snippet is generated from the same config as the app
