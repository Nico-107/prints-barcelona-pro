import { CreditCard } from "lucide-react";

const MARKET_BADGES: Record<string, string[]> = {
  nl: ["iDEAL", "Klarna"],
  pt: ["MB WAY"],
  de: ["Klarna"],
};

interface Props {
  language: string;
}

export function PaymentBadges({ language }: Props) {
  const extra = MARKET_BADGES[language] ?? [];
  const all = ["Apple Pay", "Google Pay", ...extra];

  return (
    <div className="flex flex-wrap items-center justify-center gap-1 text-[10px] text-muted-foreground">
      <span className="inline-flex items-center gap-0.5 border border-border rounded px-1.5 py-0.5 leading-none">
        <CreditCard className="w-3 h-3 shrink-0" />
        <span>Visa / MC</span>
      </span>
      {all.map(name => (
        <span
          key={name}
          className="inline-flex items-center border border-border rounded px-1.5 py-0.5 leading-none whitespace-nowrap"
        >
          {name}
        </span>
      ))}
    </div>
  );
}
