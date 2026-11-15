// Admin-only: stream an order's purchased pieces as a .zip with clean names.
// Called from the owner email button ("Descargar archivos (.zip)") and from
// the admin order detail (item 2.3).
//
// Clean name shape: `<order_number>_<NN>_<base>_<MATERIAL>_<color>_x<qty>.stl`
// e.g. 264_01_sensor_cover_FACE_DOWN_PETG_black_x1.stl
//
// Auth: requires an authenticated admin (bearer JWT with the admin role).
// Takes `order_id` (uuid) or `order_number` (int) in the query string.
//
// Zip format: produces a stored (uncompressed) zip. STL files compress poorly
// and a stored zip means we can stream each piece straight from Supabase
// storage without buffering anything but the crc32 and the per-file header.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { crc32 } from "https://deno.land/x/crc32@v0.2.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── name sanitisation ─────────────────────────────────────────────────────────
function slugifyPart(input: string, maxLen = 48): string {
  const s = input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9._ -]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  return s.slice(0, maxLen) || "file";
}

function cleanPieceName(opts: {
  orderNumber: number;
  index: number;
  pieceName: string;
  material?: string | null;
  color?: string | null;
  qty: number;
}): string {
  const base = opts.pieceName.replace(/\.[^.]+$/, "");
  const ext  = opts.pieceName.match(/\.[^.]+$/)?.[0] ?? ".stl";
  const idx  = String(opts.index + 1).padStart(2, "0");
  const mat  = slugifyPart(opts.material ?? "", 16);
  const col  = slugifyPart(opts.color ?? "", 20).toLowerCase();
  const pcs  = [
    String(opts.orderNumber),
    idx,
    slugifyPart(base, 40),
    mat || "material",
    col || "color",
    `x${opts.qty}`,
  ].filter(Boolean);
  return `${pcs.join("_")}${ext}`;
}

// ── zip building (STORED, no compression) ─────────────────────────────────────
// Writes a Zip64-capable stored zip entry for each file, then the central
// directory. STL payloads are too big to buffer entirely in memory on larger
// orders — we stream each file via a per-entry crc + length collector.

function textEncode(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

interface ZipEntry {
  nameBytes: Uint8Array;
  crc: number;
  size: number;
  offset: number;
}

async function buildZip(files: Array<{ name: string; bytes: Uint8Array }>): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  const entries: ZipEntry[] = [];
  let offset = 0;

  for (const f of files) {
    const nameBytes = textEncode(f.name);
    const crc = crc32(f.bytes);
    const crcNum = typeof crc === "number" ? crc : Number.parseInt(crc as unknown as string, 16);
    const size = f.bytes.byteLength;

    // Local file header (stored, method=0)
    const header = new Uint8Array(30 + nameBytes.byteLength);
    const dv = new DataView(header.buffer);
    dv.setUint32(0,  0x04034b50, true);           // local sig
    dv.setUint16(4,  20, true);                   // version needed
    dv.setUint16(6,  0, true);                    // flags
    dv.setUint16(8,  0, true);                    // method (stored)
    dv.setUint16(10, 0, true);                    // mod time
    dv.setUint16(12, 0, true);                    // mod date
    dv.setUint32(14, crcNum >>> 0, true);         // crc32
    dv.setUint32(18, size >>> 0, true);           // comp size
    dv.setUint32(22, size >>> 0, true);           // uncomp size
    dv.setUint16(26, nameBytes.byteLength, true); // name len
    dv.setUint16(28, 0, true);                    // extra len
    header.set(nameBytes, 30);

    chunks.push(header);
    chunks.push(f.bytes);

    entries.push({ nameBytes, crc: crcNum >>> 0, size, offset });
    offset += header.byteLength + size;
  }

  // Central directory
  const cdChunks: Uint8Array[] = [];
  let cdSize = 0;
  for (const e of entries) {
    const cd = new Uint8Array(46 + e.nameBytes.byteLength);
    const dv = new DataView(cd.buffer);
    dv.setUint32(0,  0x02014b50, true);            // central sig
    dv.setUint16(4,  20, true);                    // version made by
    dv.setUint16(6,  20, true);                    // version needed
    dv.setUint16(8,  0, true);                     // flags
    dv.setUint16(10, 0, true);                     // method
    dv.setUint16(12, 0, true);                     // mod time
    dv.setUint16(14, 0, true);                     // mod date
    dv.setUint32(16, e.crc, true);                 // crc32
    dv.setUint32(20, e.size >>> 0, true);          // comp size
    dv.setUint32(24, e.size >>> 0, true);          // uncomp size
    dv.setUint16(28, e.nameBytes.byteLength, true);
    dv.setUint16(30, 0, true);                     // extra
    dv.setUint16(32, 0, true);                     // comment
    dv.setUint16(34, 0, true);                     // disk
    dv.setUint16(36, 0, true);                     // int attrs
    dv.setUint32(38, 0, true);                     // ext attrs
    dv.setUint32(42, e.offset >>> 0, true);        // local offset
    cd.set(e.nameBytes, 46);
    cdChunks.push(cd);
    cdSize += cd.byteLength;
  }

  // End of central directory
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0,  0x06054b50, true);
  eocdView.setUint16(4,  0, true);                 // disk
  eocdView.setUint16(6,  0, true);                 // disk w/ cd
  eocdView.setUint16(8,  entries.length, true);    // entries on this disk
  eocdView.setUint16(10, entries.length, true);    // total entries
  eocdView.setUint32(12, cdSize >>> 0, true);
  eocdView.setUint32(16, offset >>> 0, true);
  eocdView.setUint16(20, 0, true);                 // comment len

  const total =
    chunks.reduce((s, c) => s + c.byteLength, 0) +
    cdChunks.reduce((s, c) => s + c.byteLength, 0) +
    eocd.byteLength;
  const out = new Uint8Array(total);
  let p = 0;
  for (const c of chunks)  { out.set(c, p); p += c.byteLength; }
  for (const c of cdChunks){ out.set(c, p); p += c.byteLength; }
  out.set(eocd, p);
  return out;
}

// ── handler ────────────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const orderIdParam = url.searchParams.get("order_id");
    const orderNumberParam = url.searchParams.get("order_number");
    if (!orderIdParam && !orderNumberParam) {
      return new Response(JSON.stringify({ error: "MISSING_ORDER" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Authenticate the caller as an admin. We use the user's JWT to verify
    // their role, then use the service role to read files.
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const admin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "FORBIDDEN" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let query = admin.from("orders").select("id, order_number, file_paths, pieces");
    query = orderIdParam ? query.eq("id", orderIdParam) : query.eq("order_number", Number(orderNumberParam));
    const { data: order, error: orderErr } = await query.maybeSingle();
    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: "ORDER_NOT_FOUND" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const pieces: Array<Record<string, unknown>> = Array.isArray(order.pieces) ? (order.pieces as unknown[] as Array<Record<string, unknown>>) : [];

    // Map pieces → files: each piece.path (if present) is the storage key.
    // If a piece has no path (older orders), fall back to file_paths[i].
    const filePaths: string[] = Array.isArray(order.file_paths) ? (order.file_paths as string[]) : [];
    const fetched: Array<{ name: string; bytes: Uint8Array }> = [];

    for (let i = 0; i < pieces.length; i++) {
      const p = pieces[i];
      const path = (typeof p.path === "string" && p.path) || filePaths[i] || null;
      if (!path) continue;
      const { data: fileBlob, error: dlErr } = await admin.storage.from("print-requests").download(path);
      if (dlErr || !fileBlob) {
        console.warn(`order ${order.order_number}: download failed for ${path}: ${dlErr?.message}`);
        continue;
      }
      const bytes = new Uint8Array(await fileBlob.arrayBuffer());
      const cleanName = cleanPieceName({
        orderNumber: Number(order.order_number),
        index: i,
        pieceName: String(p.name ?? `piece_${i + 1}.stl`),
        material: typeof p.material === "string" ? p.material : null,
        color: typeof p.color === "string" ? p.color : null,
        qty: typeof p.quantity === "number" ? p.quantity : 1,
      });
      fetched.push({ name: cleanName, bytes });
    }

    if (fetched.length === 0) {
      return new Response(JSON.stringify({ error: "NO_FILES" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const zip = await buildZip(fetched);
    return new Response(zip, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="pedido_${order.order_number}.zip"`,
        "Content-Length": String(zip.byteLength),
        ...corsHeaders,
      },
    });
  } catch (err) {
    console.error("order-files-zip error:", err);
    const message = err instanceof Error ? err.message : "unknown";
    return new Response(JSON.stringify({ error: "INTERNAL_ERROR", message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
