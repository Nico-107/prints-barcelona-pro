/// <reference types="vite/client" />

declare module "meshoptimizer/simplifier" {
  export const MeshoptSimplifier: {
    ready: Promise<void>;
    simplify(
      indices: Uint32Array,
      vertex_positions: Float32Array,
      vertex_positions_stride: number,
      target_index_count: number,
      target_error: number,
      flags?: string[],
    ): Uint32Array;
  };
}
