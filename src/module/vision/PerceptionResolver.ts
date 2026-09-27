import type { PerceptionCapabilitiesType } from '@/module/types/template/Visibility';
import { SR5 } from '@/module/config';
import { hasAugmentedRealityDevice } from './augmentedReality/matrixIcon';

type PerceptionItem = {
    type: string;
    name?: string | null;
    system?: {
        importFlags?: { sourceid?: string; name?: string } | null;
        category?: string;
        technology?: { equipped?: boolean; wireless?: string } | null;
    };
};

type PerceptionActor = {
    system: Record<string, any>;
    items?: Iterable<PerceptionItem>;
};

/** Chummer id of the Astral Perception adept power. */
export const ASTRAL_PERCEPTION_POWER_ID = '39224ecf-f3d0-40b6-95a6-2f047f95d736';
const ASTRAL_PERCEPTION_POWER_NAME = 'Astral Perception';

/** GM overrides of astral eligibility. 'default' keeps what the magical type grants. */
const OVERRIDES: Record<string, boolean | undefined> = { allow: true, deny: false };

export class PerceptionResolver {
    /**
     * Resolve which senses an actor has.
     *
     * Active Effect grants are already part of the prepared capabilities, as actor preparation applies
     * actor and item effects. Magical eligibility and the augmented reality of Matrix devices are added on top,
     * with explicit GM overrides applied last.
     */
    static resolve(actor: PerceptionActor): PerceptionCapabilitiesType {
        const capabilities = actor.system.visibilityChecks?.capabilities;
        const resolved: PerceptionCapabilitiesType = {
            physical: {
                lowLight: !!capabilities?.physical?.lowLight,
                thermographic: !!capabilities?.physical?.thermographic,
                ultrasound: !!capabilities?.physical?.ultrasound,
            },
            astral: {
                perception: !!capabilities?.astral?.perception,
                projection: !!capabilities?.astral?.projection,
            },
            matrix: {
                augmentedReality: !!capabilities?.matrix?.augmentedReality
                    || hasAugmentedRealityDevice(actor),
            },
        };

        this.applyMagicalEligibility(actor, resolved);
        return resolved;
    }

    private static applyMagicalEligibility(actor: PerceptionActor, capabilities: PerceptionCapabilitiesType) {
        const magic = actor.system.magic as Record<string, any> | undefined;
        if (!magic) return;

        const type = magic.type as keyof typeof SR5.magicalTypes | undefined;
        if (type === 'magician') {
            capabilities.astral.perception = true;
            capabilities.astral.projection = true;
        } else if (type === 'aspected_magician') {
            capabilities.astral.perception = true;
        } else if ((type === 'adept' || type === 'mystic_adept') && this.hasAstralPerceptionPower(actor)) {
            // SR5#69 adepts and mystic adepts perceive astrally only through the Astral Perception power.
            capabilities.astral.perception = true;
        }

        capabilities.astral.perception = OVERRIDES[magic.astralPerceptionOverride] ?? capabilities.astral.perception;
        capabilities.astral.projection = OVERRIDES[magic.astralProjectionOverride] ?? capabilities.astral.projection;
    }

    /**
     * Whether the actor has the Astral Perception adept power, recognized by its Chummer id, its imported name,
     * or its name for powers created by hand.
     */
    static hasAstralPerceptionPower(actor: PerceptionActor) {
        if (!actor.items) return false;
        const localized = game.i18n?.localize('SR5.Vision.AstralPerception').toLowerCase();
        for (const item of actor.items) {
            if (item.type !== 'adept_power') continue;
            const flags = item.system?.importFlags;
            if (flags?.sourceid === ASTRAL_PERCEPTION_POWER_ID) return true;
            if (flags?.name === ASTRAL_PERCEPTION_POWER_NAME) return true;
            const name = item.name?.trim().toLowerCase();
            if (name && (name === ASTRAL_PERCEPTION_POWER_NAME.toLowerCase() || name === localized)) return true;
        }
        return false;
    }
}
