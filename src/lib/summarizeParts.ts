export interface PartInput {
  material: string;
  infill: number;
  wallLoops: number;
  multicolour: boolean;
}

export interface PartSummary {
  /** "PLA" or "Mixed (PETG, TPU, PLA)" */
  material: string;
  /** "15%" or "mixed" — for the DB infill column */
  infill: string;
  /** numeric infill if all parts share it, null otherwise */
  infillNum: number | null;
  /** first part's wallLoops — always present; use for DB wall_loops */
  wallLoops: number;
  multicolour: boolean;
  /** true iff every part shares the same material, infill, and wallLoops */
  isUniform: boolean;
}

export function summarizeParts(pieces: PartInput[]): PartSummary {
  if (pieces.length === 0) {
    return { material: "", infill: "0%", infillNum: 0, wallLoops: 2, multicolour: false, isUniform: true };
  }

  const first = pieces[0];
  const multicolour = pieces.some(p => p.multicolour);

  const seenMats = new Set<string>();
  const distinctMats: string[] = [];
  for (const p of pieces) {
    if (!seenMats.has(p.material)) {
      seenMats.add(p.material);
      distinctMats.push(p.material);
    }
  }

  const uniformMat = distinctMats.length === 1;
  const uniformInfill = pieces.every(p => p.infill === first.infill);
  const uniformWalls = pieces.every(p => p.wallLoops === first.wallLoops);
  const isUniform = uniformMat && uniformInfill && uniformWalls;

  if (isUniform) {
    return {
      material: first.material,
      infill: `${first.infill}%`,
      infillNum: first.infill,
      wallLoops: first.wallLoops,
      multicolour,
      isUniform: true,
    };
  }

  const shown = distinctMats.slice(0, 4);
  const rest = distinctMats.length - shown.length;
  const matList = rest > 0 ? `${shown.join(", ")} +${rest}` : shown.join(", ");

  return {
    material: `Mixed (${matList})`,
    infill: "mixed",
    infillNum: null,
    wallLoops: first.wallLoops,
    multicolour,
    isUniform: false,
  };
}
