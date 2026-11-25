// E5 / D-8 — Single source for owner email recipients across every function.
// Personal + business inbox for every order and alert; Daniel (3d.kayda@gmail.com) added
// for Sevilla pickup orders.

export const OWNER_RECIPIENTS = [
  "011107miko@gmail.com",      // Nico personal, reads this one
  "dimension3dprintsbcn@gmail.com", // business
] as const;

export const SEVILLA_RECIPIENTS = ["3d.kayda@gmail.com"] as const; // Daniel

export function recipientsFor(pickupLocation: "bcn" | "sevilla" | null): string[] {
  const base = [...OWNER_RECIPIENTS];
  if (pickupLocation === "sevilla") base.push(...SEVILLA_RECIPIENTS);
  return base;
}

export const SENDER = "Dimension3D <noreply@dimension3dprints.com>";
