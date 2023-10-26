/**
 * Recurses through an object's keys to construct paths to all its leaf nodes by concatenating nested keys with a dot (.)
 *
 * For example, an object with the structure:
 * {
 *   alpha: string,
 *   bravo: {
 *     charlie: string,
 *     delta: {
 *       echo: string
 *     }
 *   }
 * }
 * Will yield the union type: "alpha" | "bravo.charlie" | "bravo.delta.echo"
 */
export type NestedKeys<T extends object> = {
    [K in keyof T & string]: T[K] extends object
        ? `${K}.${NestedKeys<T[K]>}`
        : K
}[keyof T & string];
