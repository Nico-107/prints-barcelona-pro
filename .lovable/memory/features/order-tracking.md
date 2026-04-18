---
name: Order Tracking System
description: Public order tracking at /track + hidden admin panel at /admin-orders for manual order management
type: feature
---
**Public side:**
- Header link "Track Your Order / Rastrear Pedido" → `/track`
- Customers enter Order ID (number, starts at 100) + last 3 digits of phone
- Premium tracker shows: header, 5-step timeline, ETA, fulfillment, notes, photo gallery, WhatsApp CTA

**Admin side:**
- Routes: `/admin-orders` direct, OR click step 4 ("Recogida o envío") in HowItWorks 10 times
- Password gate: `011107` (hardcoded, sessionStorage flag `d3d_admin_ok`)
- CRUD orders, search by #/phone/title, upload photos to `order-photos` bucket

**DB:** `public.orders` table; `order_number` from sequence starting 100; `phone_last3` is generated column from `customer_phone`. RLS allows public CRUD (admin gate is client-side only — by user choice).

**Statuses:** order_received, quote_sent, quote_approved, printing_started, finishing_qc, ready_pickup, shipped, completed.

**Pickup address shown to customers:** Rambla de Brasil 53, Barcelona.
