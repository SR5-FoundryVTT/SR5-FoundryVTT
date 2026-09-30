/**
 * How an actor shows up in the Matrix around it.
 *
 * - visible: other users spot its icon automatically within 100 m (SR5#235).
 * - silent: its icon runs silent and must be found with Matrix Perception first.
 * - none: it has no wireless device, so nothing of it is in the Matrix.
 */
export type MatrixIconState = 'visible' | 'silent' | 'none';

type IconItem = {
    type: string;
    system?: {
        category?: string;
        technology?: { equipped?: boolean; wireless?: string } | null;
    } | null;
};

export type IconActor = {
    type: string;
    system: Record<string, any>;
    items?: Iterable<IconItem>;
};

/** Actors that are their own Matrix persona instead of carrying a device that is. */
const PERSONA_ACTOR_TYPES = new Set(['vehicle', 'ic', 'sprite']);

/** Devices that can run a persona and feed it into the user's senses as augmented reality. */
const AR_DEVICE_CATEGORIES = new Set(['commlink', 'cyberdeck', 'rcc']);

/** The wireless mode of an equipped device with its wireless on, or null for anything else. */
const activeWirelessMode = (item: IconItem) => {
    const technology = item.system?.technology;
    if (!technology?.equipped) return null;
    return technology.wireless === 'online' || technology.wireless === 'silent' ? technology.wireless : null;
};

/** Whether the actor is its own persona: a vehicle, IC, sprite or technomancer's living persona. */
export const hasActorPersona = (actor: IconActor) =>
    PERSONA_ACTOR_TYPES.has(actor.type) || actor.system.special === 'resonance';

/**
 * The actor's icon, worked out from what it carries.
 *
 * SR5#234 every wireless device is in the Matrix. SR5#219 a person's devices usually merge into one icon for
 * their PAN, but a wireless weapon or other dangerous device shows up on its own, so one online device is
 * enough to be spotted even when the persona runs silent.
 *
 * The visibility targets act as overrides: without `hasIcon` the actor never shows up, and with `runningSilent`
 * all of its icons run silent.
 */
export function getMatrixIconState(actor: IconActor | null | undefined): MatrixIconState {
    const targets = actor?.system.visibilityChecks?.targets?.matrix;
    if (!actor || !targets?.hasIcon) return 'none';

    let hasIcon = false;
    let visible = false;
    if (hasActorPersona(actor)) {
        hasIcon = true;
        visible = !actor.system.matrix?.running_silent;
    }
    for (const item of actor.items ?? []) {
        const mode = activeWirelessMode(item);
        if (!mode) continue;
        hasIcon = true;
        if (mode === 'online') visible = true;
    }

    if (!hasIcon) return 'none';
    return visible && !targets.runningSilent ? 'visible' : 'silent';
}

/**
 * Whether the actor sees augmented reality: a technomancer through their living persona, anyone else through an
 * equipped commlink, cyberdeck or RCC with its wireless on (SR5#53).
 */
export function hasAugmentedRealityDevice(actor: Omit<IconActor, 'type'>) {
    if (actor.system.special === 'resonance') return true;
    for (const item of actor.items ?? []) {
        if (item.type !== 'device' || !AR_DEVICE_CATEGORIES.has(item.system?.category ?? '')) continue;
        if (activeWirelessMode(item)) return true;
    }
    return false;
}
