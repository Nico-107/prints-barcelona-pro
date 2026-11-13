/**
 * Phase 2.3: UploadCard — the shared high-up "upload file / see price"
 * module. Thin wrapper around the existing StlEstimator so pages don't
 * hand-roll their own drop zone. Formats come from one constant
 * (Phase 2.9).
 */
import StlEstimator from "@/components/StlEstimator";
import { FILE_FORMATS_DISPLAY } from "@/lib/fileFormats";

interface UploadCardProps {
  compact?: boolean;
  refCity?: string;
  refDays?: string;
  initialMaterial?: string;
}

export function UploadCard({ compact = true, refCity, refDays, initialMaterial }: UploadCardProps) {
  return (
    <section aria-label="Upload" className="py-ds-section-y md:py-ds-section-y-md">
      <div className="container px-4">
        <StlEstimator
          compact={compact}
          refCity={refCity}
          refDays={refDays}
        />
        {/* initialMaterial support in StlEstimator is Phase-3 work. */}
        {initialMaterial && <input type="hidden" data-initial-material={initialMaterial} />}
        <p className="mt-3 text-xs font-mono text-ds-text-muted uppercase tracking-wider">
          {FILE_FORMATS_DISPLAY}
        </p>
      </div>
    </section>
  );
}
