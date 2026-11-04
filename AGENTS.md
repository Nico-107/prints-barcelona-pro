# Backend checkout
- Keep shared estimator and pricing blocks unchanged when updating checkout policies; apply charge limits, shipping and preview handling outside those blocks to preserve print calculations.
- Use the existing public order-photos bucket for optional checkout PNG previews; never make the private print-requests bucket public.