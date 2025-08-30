/**
 * Generated Automatically, DO NOT EDIT
 *
 * Check utils/generate_schemas.py for more info
 *
 * Shared TypeScript utility types for XML-to-TS schema generation.
 */

/** Represents an explicit empty value from a self-closed element. */
export type Empty = null;

/** Represents a homogeneous array of values. */
export type Many<T> = T[];

/** Represents either a single value or an array of values. */
export type OneOrMany<T> = T | T[];

/** Represents a string literal type for numeric values. */
export type IntegerString = `${number}`;
