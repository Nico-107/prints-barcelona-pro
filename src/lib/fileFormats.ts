/**
 * Phase 2.9: one file-formats constant.
 *
 * Source of truth for what the uploader accepts. Any page that shows a
 * list of accepted formats imports from here — no hand-typed lists.
 *
 * The accept string (`ACCEPT_ATTR`) is what <input type="file"> receives.
 * The display list (`FILE_FORMATS_DISPLAY`) is what prose and cards show.
 */

/** 3D file extensions the uploader processes end-to-end. */
export const FILE_FORMATS_3D = ["STL", "OBJ", "3MF", "STEP"] as const;

/** Photo extensions accepted when a customer sends a photo instead. */
export const FILE_FORMATS_PHOTO = ["JPG", "PNG", "HEIC", "WEBP", "PDF"] as const;

/** Human-readable 3D list, e.g. "STL, OBJ, 3MF, STEP". */
export const FILE_FORMATS_3D_DISPLAY = FILE_FORMATS_3D.join(", ");

/** Human-readable combined list for "upload something" prose. */
export const FILE_FORMATS_DISPLAY = FILE_FORMATS_3D_DISPLAY;

/** accept="" attribute for <input type="file">. */
export const ACCEPT_ATTR_3D = ".stl,.obj,.3mf,.step,.stp,.iges,.igs";
export const ACCEPT_ATTR_3D_AND_PHOTO = ".stl,.obj,.3mf,.glb,.step,.stp,.iges,.igs,.jpg,.jpeg,.png,.heic,.webp,.pdf";
