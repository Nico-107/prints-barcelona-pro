/**
 * Minimal markdown renderer for intl page prose content.
 * Handles: **bold** (inline), standalone **heading**, numbered lists, bullet lists, paragraphs.
 * All intl content fields (howItWorks, materialsText, seoText, guide section bodies)
 * are authored in this subset of markdown.
 */
import { type ReactNode, Fragment } from "react";

function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}

export function renderMarkdown(text: string): ReactNode {
  const blocks = text
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);

        // Standalone bold-only block → section heading
        if (/^\*\*[^*]+\*\*$/.test(block)) {
          return (
            <h3 key={i} className="text-xl font-bold text-foreground mt-6 first:mt-0 mb-1">
              {block.slice(2, -2)}
            </h3>
          );
        }

        // Every line starts with a digit + "." → ordered list
        if (lines.length > 0 && lines.every((l) => /^\d+\./.test(l))) {
          return (
            <ol key={i} className="space-y-3 list-decimal list-inside">
              {lines.map((line, j) => (
                <li key={j} className="text-muted-foreground leading-relaxed">
                  {renderInline(line.replace(/^\d+\.\s*/, ""))}
                </li>
              ))}
            </ol>
          );
        }

        // Every line starts with "- " → unordered list
        if (lines.length > 0 && lines.every((l) => /^-\s/.test(l))) {
          return (
            <ul key={i} className="space-y-2">
              {lines.map((line, j) => (
                <li key={j} className="text-muted-foreground leading-relaxed flex gap-2">
                  <span className="text-accent flex-shrink-0 mt-0.5">–</span>
                  <span>{renderInline(line.replace(/^-\s+/, ""))}</span>
                </li>
              ))}
            </ul>
          );
        }

        // Default: paragraph
        return (
          <p key={i} className="text-muted-foreground leading-relaxed">
            {renderInline(block)}
          </p>
        );
      })}
    </div>
  );
}

/** Extract material cards from bullet-formatted materialsText. Returns null if not in bullet format. */
export function parseMaterialCards(
  text: string
): Array<{ name: string; desc: string }> | null {
  const items: Array<{ name: string; desc: string }> = [];
  for (const line of text.split("\n")) {
    const m = line.trim().match(/^-\s+\*\*([^*]+)\*\*[:\s—–-]+(.+)/);
    if (m) items.push({ name: m[1].trim(), desc: m[2].trim() });
  }
  return items.length >= 3 ? items : null;
}
