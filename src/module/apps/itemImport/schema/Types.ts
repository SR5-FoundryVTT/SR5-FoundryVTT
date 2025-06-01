/**
 * utility-types.ts
 *
 * Shared TypeScript utility types for XML-to-TS schema generation.
 */

/** Represents an explicit “empty” value (self-closed element marker). */
export type Empty = "";

/** A homogeneous array of values. */
export type Many<T> = T[];

/** Either a single value or an array of values. */
export type OneOrMany<T> = T | T[];
