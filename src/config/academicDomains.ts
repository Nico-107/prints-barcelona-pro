/**
 * Academic email domain patterns for student discount (section 3.5).
 * - Suffix match: "uab.cat" matches "alumne@uab.cat"
 * - Pattern rules: .edu (global), .edu.{cc} (country-code), .ac.{cc} (UK-style),
 *   plus a short explicit list the owner can extend.
 */
export const ACADEMIC_SUFFIXES: string[] = [
  // Generic
  ".edu",
  // Country-code edu
  ".edu.es", ".edu.mx", ".edu.ar", ".edu.co", ".edu.pe", ".edu.ve", ".edu.br",
  ".edu.pt", ".edu.au", ".edu.cn", ".edu.in", ".edu.sg", ".edu.hk", ".edu.pl",
  // UK-style ac.cc
  ".ac.uk", ".ac.at", ".ac.nz", ".ac.za", ".ac.il", ".ac.jp", ".ac.kr",
  // Spain universities
  "uab.cat", "upc.edu", "upf.edu", "ub.edu", "upm.es", "uam.es", "ucm.es",
  "us.es", "ugr.es", "unizar.es", "usc.es", "uva.es", "ull.edu.es",
  "uji.es", "urv.cat", "udl.cat", "udg.edu", "uvic.cat",
  // Common European
  "kuleuven.be", "ugent.be", "vub.be", "ulb.ac.be",
  "epfl.ch", "ethz.ch",
  "tu-berlin.de", "kit.edu", "rwth-aachen.de", "tum.de", "hu-berlin.de",
  "sorbonne-universite.fr", "polytechnique.edu", "ens.fr",
  "polimi.it", "unibo.it", "sapienza.it",
  "tudelft.nl", "uva.nl", "vu.nl",
];

/** Returns true when the email's domain matches any academic suffix. */
export function isAcademicEmail(email: string): boolean {
  const lower = email.toLowerCase().trim();
  return ACADEMIC_SUFFIXES.some(suf => lower.endsWith(suf));
}
