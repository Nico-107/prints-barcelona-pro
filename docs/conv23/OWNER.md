# Conv-23 Owner Notes

## Big file handling (STEP 1)

When a file > 28 MB (binary) or any ASCII STL is uploaded, the browser:
1. Converts ASCII → binary in the browser (typically 4–5× smaller)
2. If still > 28 MB, simplifies the mesh in a Web Worker (meshoptimizer WASM) targeting ≤ 28 MB / ≤ 56 MB total
3. Prices and uploads the **checkout copy** (simplified binary STL) as the order file
4. Gzips the original and uploads it as `<folder>/<name>.original.stl.gz`

**For big files, print from the `.original.stl.gz` next to the order file.** The checkout copy is geometry-equivalent (volume within ±0.5 %, bounding box within ±0.1 mm) but has a reduced triangle count.

If even the gzipped original is > 50 MB (very rare), only the checkout copy is uploaded. In that case, the checkout copy IS the print file.

The `scale=<x>` note is embedded in the original filename when the visitor scales the part:
`<timestamp>-<name>.original.scale=1.25.stl.gz`
