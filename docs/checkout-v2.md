# Checkout v2 — per-part orders

## Request payload (v2)

Trigger: `pricingVersion === 2` AND every `pieces[*].material` is a string.

```json
{
  "pricingVersion": 2,
  "urgency": "standard|express|urgent",
  "fulfillment": "pickup|shipping",
  "exactPrice": 34.29,
  "pieces": [
    {
      "name": "soporte.stl",
      "quantity": 2,
      "path": "uuid/soporte.stl",
      "material": "PETG",
      "color": "black",
      "infill": 50,
      "wallLoops": 3,
      "multicolour": false,
      "volumeMm3": 30000
    }
  ],
  "material": "Mixed",
  "color": null,
  "infill": null,
  "wallLoops": null,
  "quantity": 7,
  "filePaths": ["uuid/soporte.stl"],
  "fileNames": ["soporte.stl"],
  "contactEmail": "user@example.com",
  "contactPhone": null,
  "language": "es",
  "ph_distinct_id": "...",
  "ph_session_id": "...",
  "utm_source": null,
  "utm_medium": null,
  "utm_content": null,
  "utm_campaign": null,
  "product_type": null,
  "customer_ref": null
}
```

## Pricing rules

### Constants
- `SETUP_FEE = 8` €
- `RATE_PER_GRAM = 0.22` €/g
- `MIN_PRICE = 10` €
- `INSTANT_BUY_MAX = 52.5` € (totalCents ≤ 5250 to be eligible)

### Materials (density g/cm³ / cost multiplier)
| Material  | Density | Multiplier |
|-----------|---------|-----------|
| PLA       | 1.24    | 1.0       |
| PETG      | 1.27    | 1.1       |
| HIPS      | 1.07    | 1.2       |
| ABS       | 1.04    | 1.3       |
| ASA       | 1.07    | 1.3       |
| TPU       | 1.20    | 1.3       |
| Nylon     | 1.14    | 1.4       |
| PC        | 1.20    | 1.5       |
| PVA       | 1.23    | 1.5       |
| PLA-CF    | 1.30    | 1.6       |
| PETG-CF   | 1.30    | 1.6       |
| Nylon-CF  | 1.20    | 1.6       |

**INSTANT_MATERIALS** (accepted for checkout): `PLA, PETG, ABS, TPU`

### Urgency multipliers
- `standard`: 1.0
- `express`: 1.25
- `urgent`: 1.6

### Wall factor
```
wallFactor(loops):
  loops <= 2 → 0.14
  loops == 3 → 0.20
  loops == 4 → 0.27
  else       → min(0.27 + (loops-4)*0.07, 0.80)
```

### Effective fill
```
effectiveFill(infillPct, loops) = wf + (infillPct/100) * (1 - wf)
where wf = wallFactor(loops)
```

### Per-part calculation
```
gramsPerUnit_i = (volumeMm3/1000) * density[m] * effectiveFill(infill, walls)
partRaw_i      = gramsPerUnit_i * quantity * RATE_PER_GRAM * multiplier[m]
```

### Order totals
```
raw   = SETUP_FEE + sum(partRaw_i)
base  = max(raw, MIN_PRICE)
total = base * urgencyMultiplier
```

### Rounding (floor(x + 0.5) throughout)
```
baseCents    = round(base * 100)
totalCents   = round(total * 100)
partCents_i  = round(partRaw_i * 100)
setupCents   = 800
```

### Residual distribution
```
residual = baseCents - (800 + sum(partCents_i))
if raw < MIN_PRICE:
  minAdjCents = residual          // shown as a separate Stripe line
else:
  partCents[largestIdx] += residual
  minAdjCents = 0
```

### Express surcharge
```
expressCents = totalCents - baseCents
```

### Instant window & display cap
```
eligible       = totalCents <= 5250
capShaveCents  = (eligible && totalCents > 5000) ? totalCents - 5000 : 0
partCents[largestIdx] -= capShaveCents
chargedPrintCents = totalCents - capShaveCents
```

### Shipping (not part of the print lines)
```
shippingCents = fulfillment === "shipping" ? 600 : 0
```

### Invariant
```
sum(partCents_i) + setupCents + minAdjCents + expressCents === chargedPrintCents
```

## Worked examples

### E1 — [A, B, C] standard pickup
Parts: A soporte.stl ×2 PETG 50% 3w vol30000 | B tapa.stl ×1 TPU 20% 2w vol15000 | C eje.stl ×4 PLA 20% 2w vol40000

| | gramsPerUnit | partCents |
|---|---|---|
| A | 22.86 | 1106 |
| B | 5.616 | 161 |
| C | 15.4752 | 1362 |

raw=34.289, totalCents=3429, setup=800, minAdj=0, express=0, cap=0, charged=3429, shipping=0, eligible=true

### E2 — same parts, express + shipping
totalCents=4286, parts=[1106,161,1362], setup=800, express=857, charged=4286, shipping=600

### E3 — [S] standard minimum price
S: clip.stl ×1 PLA 15% 2w vol3000
gramsPerUnit=1.0007, raw=8.22, baseCents=1000, parts=[22], setup=800, minAdj=178, charged=1000

### E4 — [big] standard cap
big: base.stl ×1 PLA 20% 2w vol505200
gramsPerUnit=195.4518, raw=50.999, totalCents=5100, parts=[4300→4200 after cap], cap=100, charged=5000

## Validation error codes

| Code | Condition |
|------|-----------|
| `INVALID_PIECES` | pieces not an array, empty, or >20 |
| `INVALID_MATERIAL` | material not in INSTANT_MATERIALS |
| `INVALID_INFILL` | infill not in [5,15,30,50,80] |
| `INVALID_WALLS` | wallLoops not an integer 2..8 |
| `INVALID_QUANTITY` | quantity not an integer 1..999 |
| `INVALID_VOLUME` | volumeMm3 not finite, ≤0, or >50 000 000 |
| `INVALID_URGENCY` | urgency not in [standard, express, urgent] |
| `INVALID_FULFILLMENT` | fulfillment not pickup or shipping |
| `INSTANT_NOT_AVAILABLE` | any piece has multicolour: true |
| `PRICE_ABOVE_INSTANT_LIMIT` | totalCents > 5250 |
| `PRICE_MISMATCH` | |round(exactPrice×100) − chargedPrintCents| > 2 |

## Notes format

### Uniform (all parts same material, infill, walls)
Identical to legacy:
```
Instant checkout (self-service, ≤ €35). Email: …. Material: PETG / black. Infill: 50, 3 walls, qty 4. Total price: €34.29. Files: …. Paths: …. Language: es. Pieces: ….
```

### Mixed (per-part specs differ)
```
Instant checkout (self-service). Email: …. Material: Mixed (PETG, TPU, PLA). Infill: mixed, mixed walls, qty 7. Total price: €34.29. Files: …. Paths: …. Language: es. Parts: soporte.stl x2 [PETG 50% 3w black]; tapa.stl x1 [TPU 20% 2w]; eje.stl x4 [PLA 20% 2w].
```

## Quote → order legacy column convention (Admin accept flow)

When `pieces` carry per-part material:
- `product_title`: `3D Print — Mixed (PETG, TPU, PLA)` (up to 4 materials, then "+n")
- `notes.Material`: `Mixed (PETG, TPU, PLA)`
- `notes.Infill`: `mixed, mixed walls`
- `quantity`: total units across all pieces
- `multicolour`: any piece has multicolour=true

Uniform orders keep today's format (infill like `"15"`).

## Stripe session structure (v2)

- One line item per part with `costCents > 0` (quantity=1)
  - Name: `"{name} — {MATERIAL}, {infill}% {fillWord}, ×{qty}"` (≤120 chars)
  - fillWord: es→"relleno", ca→"farciment", else→"infill"
- Setup line: 800 cents
- Min adjustment line (if minAdjCents > 0)
- Express surcharge line (if expressCents > 0)
- Shipping option (600 EUR, when fulfillment="shipping")

Localised line names:
| Line | es | ca | en |
|------|----|----|-----|
| Setup | Preparación del pedido | Preparació de la comanda | Order setup |
| Min adj | Ajuste al pedido mínimo (10 €) | Ajust a la comanda mínima (10 €) | Adjustment to the €10 minimum |
| Express | Suplemento express | Suplement exprés | Express surcharge |
| Shipping | Envío estándar | Enviament estàndard | Standard shipping |

Metadata additions (v2 only): `pricing_version="2"`, `part_count`, `materials` (comma-separated, ≤200 chars)

## PostHog order_paid additions (v2)

Additive properties on the existing `order_paid` event:
- `pricing_version`: 2
- `part_count`: number of parts
- `materials`: comma-separated material names
- `is_mixed`: boolean (true when materials contains a comma)
