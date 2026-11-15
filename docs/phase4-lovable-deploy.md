# Phase 4 — what to deploy in Lovable

Nothing to deploy from Phase 4 yet.

Phase 4 stopped at item 4.0 (research first). See
`docs/packlink-integration.md` for the exact list of what Packlink's own
documentation does not currently confirm — specifically whether the
`/v1/*` endpoints are still callable from a current PRO API key, how
Packlink signs or allow-lists webhook callbacks, and whether a sandbox
API key can be issued.

Until the five open questions in §3 of that doc have an answer, 4.1
(packlink-create-draft), 4.2 (packlink-webhook), 4.3 (refresh-tracking
button) and 4.4 (fixture tests) are intentionally not written — the
goal body explicitly says *"do not guess endpoints"*.

While Phase 4 is paused the owner's shipping workflow is the manual
block shipped in Phase 2, item 2.4 (`/admin/queue` → order detail →
"Envío manual"): carrier select, tracking number, tracking URL template.
That path works today and does not depend on Packlink at all.
