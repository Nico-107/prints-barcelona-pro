import { useState, useEffect } from "react";
import type { Language } from "@/lib/pathLanguage";
import { computeShipDate, formatShipDate, shipDateLine } from "@/lib/shipDate";

/**
 * Ship-date rule (Prompt 25 §Ship-date rule, R6/R7):
 *   - We promise when the part is PRINTED and HANDED TO THE CARRIER, never
 *     when it ARRIVES. Carrier times (especially international) aren't under
 *     our control, so we never render an arrival date here.
 *   - Line format: "Listo y enviado el {día} {fecha} + envío" or short form
 *     "Enviado el {fecha}" where space is tight.
 *   - Pickup on Spain pages: "Listo para recoger el {fecha}".
 *   - Skips weekends, honours the 14:00 production cutoff.
 */
interface Props {
  language: Language | string;
  urgency: string;
  fulfillment: "pickup" | "shipping" | null;
  /** When true, use the short form "Enviado el {fecha}" — for the mobile sticky bar. */
  short?: boolean;
}

export function DeliveryPromise({ language, urgency, fulfillment, short = false }: Props) {
  const [line, setLine] = useState<string | null>(null);

  useEffect(() => {
    if (!fulfillment) { setLine(null); return; }
    const shipDate = computeShipDate(new Date(), urgency);
    const formatted = formatShipDate(shipDate, language);
    setLine(shipDateLine(formatted, language, fulfillment, short));
  }, [language, urgency, fulfillment, short]);

  if (!line) return null;

  return (
    <p className="text-xs text-muted-foreground text-right mt-0.5">
      {line}
    </p>
  );
}
