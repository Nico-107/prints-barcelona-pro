# Zapier ↔ Packlink setup — O9 / R4

Two Zaps wire the admin to Packlink PRO without touching their un-documented REST API.
Both Zaps run under Nico's Zapier account.

## Zap 1 — "Enviar a Packlink" from the admin
Triggered when Nico presses "Enviar a Packlink (Zapier)" in `/admin` (Envíos tab).

- Trigger: **Webhooks by Zapier → Catch Hook** (copy the hook URL into admin settings table
  `packlink_webhook_url`).
- Action: **Packlink PRO → Create Shipment Draft**
  - Reference: `{{order_number}}`
  - Weight / dimensions / addresses from the admin payload
  - Postcode preserved with its leading zero (Catch Hook passes the string field as-is)

## Zap 2 — Packlink status → our hook
Triggered every time Packlink updates the shipment status.

- Trigger: **Packlink PRO → Shipment Status Updated**
- Action: **Webhooks by Zapier → POST**
  - URL: `https://ssdbkzswqpbgpeirackr.supabase.co/functions/v1/packlink-status-hook?secret={{PACKLINK_HOOK_SECRET}}`
  - Body (JSON):
    ```json
    {
      "order_ref": "{{reference}}",
      "tracking_number": "{{tracking_number}}",
      "carrier": "{{carrier}}",
      "status": "{{status}}"
    }
    ```

## Secrets

- `PACKLINK_HOOK_SECRET` — generate once with `openssl rand -hex 24`, store in Lovable
  secrets *and* in Zapier's workflow (so Zapier knows the URL query to use).

## Field mapping notes

- Insurance column in the CSV uses `"no"` by default. Switch to `"yes"` manually for parcels
  declared value > €150.
- `status` values from Packlink: `IN_TRANSIT`, `DELIVERED`, `OUT_FOR_DELIVERY`, `AT_PICKUP_POINT`.
  The hook writes them directly into `orders.status` and the admin maps them to the
  Spanish labels. `DELIVERED` triggers the delivered email.
