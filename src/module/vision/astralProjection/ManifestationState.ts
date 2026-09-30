/** Status of an astral being that shows itself on the physical plane as a ghostly image (SR5#314). */
export const MANIFEST_STATUS = 'sr5manifesting';

/** Status of a spirit that has taken a physical, dual-natured form (SR5#303). */
export const MATERIALIZE_STATUS = 'sr5materialized';

type MaybeActor = { statuses?: Set<string> } | null | undefined;

/**
 * Read an actor's manifestation from its statuses alone.
 *
 * It imports nothing, so detection modes, token and actor code can use it without cycles.
 */
export const isManifesting = (actor: MaybeActor) => !!actor?.statuses?.has(MANIFEST_STATUS);

export const isMaterialized = (actor: MaybeActor) => !!actor?.statuses?.has(MATERIALIZE_STATUS);
