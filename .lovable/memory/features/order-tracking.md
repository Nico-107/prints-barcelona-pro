---
name: Order Tracking System
description: Public order tracking at /track + admin panel at /admin-orders with real Supabase Auth + admin role
type: feature
---
**Public side:**
- Header link "Track Your Order / Rastrear Pedido" → `/track`
- Customers enter Order ID + last 3 digits of phone
- Track page calls SECURITY DEFINER RPC `get_order_tracking(_order_number, _phone_last3)` which returns only safe fields (no full phone). Direct SELECT on orders is blocked for the public.

**Admin side:**
- Routes: `/admin-orders` direct, OR click step 4 in HowItWorks 10 times
- Auth: Supabase Auth email+password. Admin must have a row in `public.user_roles` with role='admin'.
- Signups are disabled — admin users are created via Lovable Cloud → Users panel; admin role assigned in `user_roles` table.
- CRUD orders, search by #/phone/title, upload photos to `order-photos` bucket.

**DB:** `public.orders` (admin-only RLS for SELECT/INSERT/UPDATE/DELETE). `public.user_roles` table + `has_role(uuid, app_role)` SECURITY DEFINER function. `order_number` from sequence starting 100; `phone_last3` is generated column.

**Storage:** `order-photos` (public bucket, admin-only INSERT/UPDATE/DELETE/list; public CDN URLs still serve known files). `print-requests` (private, anon INSERT allowed for the quote form, edge function processes via service role).

**Statuses:** order_received, quote_sent, quote_approved, printing_started, finishing_qc, ready_pickup, shipped, completed.

**Pickup address:** Rambla de Brasil 53, Barcelona.
