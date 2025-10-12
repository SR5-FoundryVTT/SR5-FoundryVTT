/**
 * Strongly typed replacements for common Object and Array utilities.
 * Provides fully inferred `keys`, `entries`, `values`, `fromEntries`, etc.
 * Safe for both Node and browser environments.
 *
 * NOTE: The `as` type assertions are necessary because TypeScript's built-in
 * method signatures (e.g., for `Object.keys`) are conservatively typed and
 * don't fully capture the relationship between an object's keys and values.
 */
export const Typed = {
    /**
     * A strongly typed version of `Object.keys`.
     * @param obj The object to get the keys from.
     * @returns An array of the object's own enumerable property names, correctly typed as strings.
     * For arrays, this will be an array of string-formatted indices (e.g., `['0', '1']`).
     */
    keys: <T extends object>(obj: T) =>
        Object.keys(obj) as T extends readonly any[]
            ? `${number}`[]
            : (`${Exclude<keyof T, symbol>}`)[],

    /**
     * A strongly typed version of `Object.entries`.
     * This version preserves the specific type relationship between each key and its value
     * for objects, and correctly types the `[index, value]` pairs for arrays.
     * @param obj The object or array to get the entries from.
     * @returns An array of the object's own enumerable [key, value] pairs.
     * For arrays, keys are string-formatted indices.
     */
    entries: <T extends object>(obj: T) =>
        Object.entries(obj) as T extends readonly (infer E)[]
            ? [`${number}`, E][]
            : { [K in Exclude<keyof T, symbol>]: [`${K}`, T[K]] }[Exclude<keyof T, symbol>][],

    /**
     * A strongly typed version of `Object.values`.
     * @param obj The object to get the values from.
     * @returns An array of the object's own enumerable property values.
     */
    values: <T extends object>(obj: T) => Object.values(obj) as T[keyof T][],

    /**
     * A strongly typed version of `Object.fromEntries`.
     * This version reconstructs the precise object type from the entries.
     * @param entries An iterable of key-value pairs.
     * @returns A new object whose properties are given by the entries.
     */
    fromEntries: <const E extends readonly (readonly [PropertyKey, unknown])[]>(
        entries: E
    ) =>
        Object.fromEntries(entries) as {
            [K in E[number][0]]: Extract<E[number], readonly [K, unknown]>[1];
        },
} as const;
