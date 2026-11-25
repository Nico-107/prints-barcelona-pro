# Checkpoint fixtures (synthetic + generated)

The repo is PUBLIC, so every fixture here is either synthetic or generated. Real customer
files go only in `test-fixtures/checkpoint/private/`, which is gitignored.

## Shipped fixtures

| File | Expected outcome |
|---|---|
| `01_cube_20mm.stl` | 20×20×20 mm closed cube — PLA 15 % standard: **9,90 €** |
| `02_bracket_80x40x40.stl` | Bracket — **9,90 €** |
| `03_organic_82k_tris.stl` | 82k triangles organic shape — **16,90 €** |
| `04_ascii_cube_30mm.stl` | ASCII STL of a 30 mm cube — same price as its binary form |
| `05_too_big_300x60x20.stl` | Too big under deployed axis-aligned rule; fits diagonally after P5 |
| `06_too_small_2x2x1mm.stl` | Triggers P8 very-small note |
| `07_open_box_missing_top.stl` | Open shell — volume treated as closed box |
| `08_maqueta_like_open_shell_348x272x99.stl` | Synthetic Maqueta — oversize, price ≥ 20 € |
| `09_plate_9_separate_cubes.stl` | Nine disjoint cubes — raw analysis, no robust path |
| `10_overlapping_shells_sphere_box.stl` | Overlapping shells — robust union, 9,90–12,90 |
| `11_inverted_normals_cube25.stl` | Inside-out cube — same price as right-side-out |
| `12_units_metres_cube50mm.stl` | ×1000 units suggestion |
| `13_units_inches_cube2in.stl` | ×25,4 units suggestion |
| `14_flat_plate_200x200x3.stl` | Very thin plate |
| `15_tall_tower_20x20x250.stl` | Fits (within 256×256×261) |
| `16_big_block_150x150x100.stl` | Large but under instant limit |
| `17_big_open_shell_plus_tiny_closed.stl` | Open shell + tiny closed — price ≥ 90 € |
| `18_cube_20mm.obj` | OBJ equivalent to 01 — same price |
| `19_cube_20mm.3mf` | 3MF equivalent to 01 — same price |
| `20_phone_stand_100x74x70.stl` | Phone stand — ~18–25 € depending on quality |

## Generated (gitignored)

`scripts/checkpoint/gen-fixtures.mjs` writes to `test-fixtures/checkpoint/generated/`:

- A deterministic part priced in the 18–25 € range (dimensions searched + locked once).
- 30 MB, 60 MB and 160 MB high-poly STLs for the large-file matrix (P9).
- Duplicated-shells stamp, overlapping spheres, STEP cube (AP214).
- 3MF with 3 objects, OBJ with groups, ASCII STL.

## Private (never committed)

If Nico drops real customer files into `test-fixtures/checkpoint/private/`, the pricing
tests pick them up automatically and tighten the oversize/volume assertions in P3's
fixtures table.
