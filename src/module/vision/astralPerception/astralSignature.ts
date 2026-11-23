import { isAstralForm } from '@/module/vision/astralProjection/AstralProjectionState';
import { getPhysicalTargetActor, hasPhysicalPresence } from '@/module/vision/physicalVision/physicalDetectionMode';

type DetectionTarget = Parameters<typeof getPhysicalTargetActor>[0];

/**
 * How a target appears to astral perception (SR5#312).
 *
 * - form: an astral form, like a spirit or a projecting magician, "more colorful and brighter than auras".
 * - awakened: an Awakened or astrally active being, whose aura shows its magic.
 * - aura: a living being, "a shining, vibrant, colorful luminescence".
 * - shadow: a non-living thing, "grey, lifeless, and intangible".
 */
export type AstralTier = 'shadow' | 'aura' | 'awakened' | 'form';

export const ASTRAL_TIERS: readonly AstralTier[] = ['shadow', 'aura', 'awakened', 'form'];

/** Essence buckets auras are drawn at, from the dimmest to a full, unaugmented aura. */
export const MAX_ESSENCE_BUCKET = 6;

export interface AstralSignature {
    tier: AstralTier;
    /** Rounded Essence, 1 to 6. Cyberware thins an aura, so lower buckets glow weaker. */
    bucket: number;
}

/** The astral tier of a target, or null for one that doesn't exist on the astral plane, like a sprite. */
export const getAstralTier = (target: DetectionTarget): AstralTier | null => {
    const token = (target as { document?: TokenDocument } | null)?.document;
    const actor = getPhysicalTargetActor(target);
    if ((token instanceof TokenDocument && isAstralForm(token)) || actor?.type === 'spirit') return 'form';

    const astral = actor?.system.visibilityChecks.targets.astral;
    if (astral?.astralActive) return 'awakened';
    if (astral?.hasAura) return actor?.system.special === 'magic' ? 'awakened' : 'aura';
    if (astral?.affectedBySpell) return 'aura';
    return hasPhysicalPresence(target) ? 'shadow' : null;
};

export const essenceBucket = (actor: { system: object } | null | undefined) => {
    const essence = (actor?.system as { attributes?: { essence?: { value?: number } } } | undefined)
        ?.attributes?.essence?.value;
    const value = typeof essence === 'number' && Number.isFinite(essence) ? essence : MAX_ESSENCE_BUCKET;
    return Math.min(MAX_ESSENCE_BUCKET, Math.max(1, Math.round(value)));
};

export const getAstralSignature = (target: DetectionTarget, fallback: AstralTier | null = null): AstralSignature | null => {
    const tier = getAstralTier(target) ?? fallback;
    if (!tier) return null;
    return { tier, bucket: essenceBucket(getPhysicalTargetActor(target)) };
};
