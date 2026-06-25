#!/usr/bin/env python3
"""
Generate a clean SVG map of Europe with cities plotted using real geographic
coordinates and ETRS89-LAEA projection (EPSG:3035 — the standard European
equal-area projection). Country outlines come from Natural Earth 110m data.

Output:
  public/europe-map.svg  — standalone SVG for visual verification
  stdout                 — JSON city coordinates in SVG space (for TSX)
"""

import json
import os
import sys

import geopandas as gpd
from pyproj import Transformer
from shapely.geometry import box as shapely_box

# ── City definitions with REAL lat/lng ────────────────────────────
# ORDER MUST match buildCities() call order in COPY (en/es/ca):
# ["Barcelona","Madrid","Valencia","Lisbon","Paris","Amsterdam","Berlin","Munich","Milan"]
CITIES = [
    {"name": "Barcelona", "lat": 41.39, "lon":  2.17,  "live": True,  "labelSide": "right"},
    {"name": "Madrid",    "lat": 40.42, "lon": -3.70,  "live": False, "labelSide": "left"},
    {"name": "Valencia",  "lat": 39.47, "lon": -0.38,  "live": False, "labelSide": "right"},
    {"name": "Lisbon",    "lat": 38.72, "lon": -9.14,  "live": False, "labelSide": "right"},
    {"name": "Paris",     "lat": 48.86, "lon":  2.35,  "live": False, "labelSide": "left"},
    {"name": "Amsterdam", "lat": 52.37, "lon":  4.90,  "live": False, "labelSide": "right"},
    {"name": "Berlin",    "lat": 52.52, "lon": 13.40,  "live": False, "labelSide": "right"},
    {"name": "Munich",    "lat": 48.14, "lon": 11.58,  "live": False, "labelSide": "right"},
    {"name": "Milan",     "lat": 45.46, "lon":  9.19,  "live": False, "labelSide": "right"},
]

# ── SVG canvas ────────────────────────────────────────────────────
SVG_W = 800
SVG_H = 660
PADDING = 25

# ── Geographic bounds (lon_min, lat_min, lon_max, lat_max) ────────
# Wide enough to show all 9 cities with generous margins.
# Atlantic coast (Lisbon −9.14) to Munich/Milan/Berlin (~14° E).
# Southern tip of Iberia (~36°N) to Netherlands (~53°N).
BOUNDS = (-13.5, 34.5, 25.0, 59.0)

# ── Projection: WGS84 → ETRS89-LAEA (EPSG:3035) ──────────────────
# Standard official EU map projection; preserves area and shape well
# for the European extent.
transformer = Transformer.from_crs("EPSG:4326", "EPSG:3035", always_xy=True)


def proj(lon, lat):
    """Project (lon, lat) in WGS84 to LAEA meters."""
    return transformer.transform(lon, lat)


# Project the four corners of our bounding box to get projected extent
px0, py0 = proj(BOUNDS[0], BOUNDS[1])  # SW corner
px1, py1 = proj(BOUNDS[2], BOUNDS[3])  # NE corner

# Adjust aspect: if the projected box has a different ratio than SVG,
# expand the shorter dimension so nothing is distorted.
proj_w = px1 - px0
proj_h = py1 - py0
inner_w = SVG_W - 2 * PADDING
inner_h = SVG_H - 2 * PADDING
scale = min(inner_w / proj_w, inner_h / proj_h)
# Centre the map in the canvas
offset_x = PADDING + (inner_w - proj_w * scale) / 2
offset_y = PADDING + (inner_h - proj_h * scale) / 2


def to_svg(px, py):
    """Convert projected LAEA coords (metres) → SVG pixel coords."""
    sx = offset_x + (px - px0) * scale
    sy = SVG_H - offset_y - (py - py0) * scale  # flip y-axis
    return round(sx, 1), round(sy, 1)


def ring_to_path(coords):
    """Convert a coordinate ring [(x,y), …] → SVG path segment."""
    parts = []
    for i, (lon, lat) in enumerate(coords):
        px, py = proj(lon, lat)
        sx, sy = to_svg(px, py)
        parts.append(f"{'M' if i == 0 else 'L'}{sx},{sy}")
    parts.append("Z")
    return "".join(parts)


def geom_to_path(geom):
    """Convert a shapely Polygon or MultiPolygon → SVG path d-string."""
    polys = [geom] if geom.geom_type == "Polygon" else list(geom.geoms)
    parts = []
    for poly in polys:
        if poly.is_empty:
            continue
        parts.append(ring_to_path(list(poly.exterior.coords)))
        for interior in poly.interiors:
            parts.append(ring_to_path(list(interior.coords)))
    return "".join(parts)


# ── Load Natural Earth 110m countries ─────────────────────────────
def load_world():
    """Load world countries GeoDataFrame (WGS84, per-country polygons)."""
    import subprocess
    import tempfile

    # 1. Check if we already have the file cached locally
    cache_path = "/tmp/ne_110m_countries.zip"
    if os.path.exists(cache_path):
        try:
            gdf = gpd.read_file(cache_path)
            if gdf.crs is None:
                gdf = gdf.set_crs("EPSG:4326")
            print(f"Loaded: cached Natural Earth countries ({cache_path})", file=sys.stderr)
            return gdf
        except Exception as e:
            print(f"Cache load failed: {e}", file=sys.stderr)

    # 2. Download via curl (avoids Python SSL cert issues on macOS)
    url = "https://naciscdn.org/naturalearth/110m/cultural/ne_110m_admin_0_countries.zip"
    print(f"Downloading Natural Earth 110m countries via curl...", file=sys.stderr)
    result = subprocess.run(
        ["curl", "-sL", url, "-o", cache_path],
        capture_output=True, timeout=60
    )
    if result.returncode == 0:
        gdf = gpd.read_file(cache_path)
        if gdf.crs is None:
            gdf = gdf.set_crs("EPSG:4326")
        print("Loaded: Natural Earth 110m countries (downloaded via curl)", file=sys.stderr)
        return gdf

    raise RuntimeError(
        "Could not load Natural Earth countries data. "
        f"Try: curl -sL {url} -o {cache_path}"
    )


world = load_world()

# ── Clip geometries to our bounding box (with 2° margin) ──────────
clip_box = shapely_box(BOUNDS[0] - 2, BOUNDS[1] - 2, BOUNDS[2] + 2, BOUNDS[3] + 2)
world = world[world.geometry.intersects(clip_box)].copy()
world["geometry"] = world.geometry.intersection(clip_box)
world = world[~world.geometry.is_empty].copy()

# Simplify for manageable SVG size (0.2° tolerance ≈ ~20 km)
world["geometry"] = world.geometry.simplify(0.2)

# ── Build country <path> elements ─────────────────────────────────
country_paths = []
for _, row in world.iterrows():
    geom = row.geometry
    if geom is None or geom.is_empty:
        continue
    d = geom_to_path(geom)
    if d:
        country_paths.append(f'    <path d="{d}"/>')

# ── Project city coordinates → SVG space ──────────────────────────
city_data = []
for city in CITIES:
    px, py = proj(city["lon"], city["lat"])
    sx, sy = to_svg(px, py)
    city_data.append({
        "name":      city["name"],
        "live":      city["live"],
        "svgX":      sx,
        "svgY":      sy,
        "labelSide": city["labelSide"],
    })

# ── Build city <circle> elements ──────────────────────────────────
city_elements = []
for c in city_data:
    x, y = c["svgX"], c["svgY"]
    if c["live"]:
        # Outer pulse ring
        city_elements.append(
            f'    <circle class="city-pulse" cx="{x}" cy="{y}" r="10"/>'
        )
        city_elements.append(
            f'    <circle class="city-live" cx="{x}" cy="{y}" r="5"'
            f' data-city="{c["name"]}" data-live="true"/>'
        )
    else:
        city_elements.append(
            f'    <circle class="city-expanding" cx="{x}" cy="{y}" r="4.5"'
            f' data-city="{c["name"]}"/>'
        )

# ── Assemble SVG ──────────────────────────────────────────────────
svg = f"""\
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 {SVG_W} {SVG_H}"
     role="img" aria-label="Europe map showing Dimension3D maker network cities">
  <style>
    .country        {{ fill: #e2e8f0; stroke: #94a3b8; stroke-width: 0.8; stroke-linejoin: round; }}
    .city-live      {{ fill: #25d366; }}
    .city-expanding {{ fill: #f59e0b; opacity: 0.85; }}
    .city-pulse     {{ fill: none; stroke: #25d366; stroke-width: 1.5; opacity: 0.4; }}
  </style>
  <g class="countries" fill-rule="evenodd">
{chr(10).join(country_paths)}
  </g>
  <g class="cities">
{chr(10).join(city_elements)}
  </g>
</svg>
"""

# ── Write standalone preview SVG ──────────────────────────────────
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out_svg = os.path.join(root, "public", "europe-map.svg")

with open(out_svg, "w", encoding="utf-8") as f:
    f.write(svg)

# ── Write TypeScript data file for use in EuropeMapSVG.tsx ────────
import re as _re
path_strings = [_re.search(r'd="([^"]+)"', p).group(1) for p in country_paths]

ts_lines = [
    "// Auto-generated by scripts/generate_europe_map.py — do not edit by hand.",
    "// Projection: ETRS89-LAEA (EPSG:3035). Source: Natural Earth 110m public domain.",
    "",
    "export const SVG_W = 800;",
    "export const SVG_H = 660;",
    "",
    "export const EUROPE_COUNTRY_PATHS: string[] = [",
]
for p in path_strings:
    ts_lines.append(f'  "{p}",')
ts_lines.append("];")
ts_lines.append("")
ts_lines.append(
    "// City SVG positions derived from real lat/lng via LAEA projection."
)
ts_lines.append(
    "// Index order matches buildCities() in Makers.tsx: "
    "Barcelona,Madrid,Valencia,Lisbon,Paris,Amsterdam,Berlin,Munich,Milan"
)
ts_lines.append(
    "export const CITY_SVG_COORDS: { "
    "name: string; live: boolean; "
    "svgX: number; svgY: number; "
    "labelSide: 'above' | 'below' | 'left' | 'right'; "
    "}[] = ["
)
for c in city_data:
    ts_lines.append(
        f'  {{ name: "{c["name"]}", live: {str(c["live"]).lower()}, '
        f'svgX: {c["svgX"]}, svgY: {c["svgY"]}, '
        f'labelSide: "{c["labelSide"]}" }},'
    )
ts_lines.append("];")
ts_lines.append("")

out_ts = os.path.join(root, "src", "data", "europeMapData.ts")
os.makedirs(os.path.dirname(out_ts), exist_ok=True)
with open(out_ts, "w", encoding="utf-8") as f:
    f.write("\n".join(ts_lines))

print(f"\n✓ SVG written to {out_svg}")
print(f"✓ TypeScript data written to {out_ts}")
print(f"  Country paths: {len(country_paths)}")
print(f"  City markers:  {len(CITIES)}")
print("\nCity SVG coordinates:")
print(json.dumps(city_data, indent=2))
