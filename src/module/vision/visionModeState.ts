import { FLAGS, SYSTEM_NAME } from '../constants';

export const SR5VisionModes = [
    'basic',
    'astralPerception',
    'thermographic',
    'lowlight',
    'matrix',
] as const;

export const SR5VisionModePriority = [
    'astralPerception',
    'thermographic',
    'lowlight',
    'matrix',
    'basic',
] as const;

export const SR5VisionModeLabelKeys: Record<(typeof SR5VisionModes)[number], string> = {
    basic: 'SR5.Vision.Mundane',
    astralPerception: 'SR5.Vision.AstralPerception',
    thermographic: 'SR5.Vision.ThermographicVision',
    lowlight: 'SR5.Vision.LowLight',
    matrix: 'SR5.Vision.Matrix',
};

export type SR5VisionModeId = (typeof SR5VisionModes)[number];
export type SR5PerceptionPlane = 'physical' | 'astral' | 'matrix';

type DocumentWithFlags = {
    getFlag(scope: string, key: string): unknown;
};

type TokenDocumentWithActor = DocumentWithFlags & {
    actor?: DocumentWithFlags | null;
};

const sr5VisionModeSet = new Set<string>(SR5VisionModes);

export const normalizeVisionModeId = (value: unknown): SR5VisionModeId | null => {
    if (typeof value !== 'string') {
        return null;
    }

    return sr5VisionModeSet.has(value) ? (value as SR5VisionModeId) : null;
};

export const resolveActorDefaultVisionMode = (actor: DocumentWithFlags | null | undefined): SR5VisionModeId | null => {
    if (!actor) {
        return null;
    }

    return normalizeVisionModeId(actor.getFlag(SYSTEM_NAME, FLAGS.ActorDefaultVisionMode));
};

export const resolveTokenActiveVisionMode = (
    tokenDocument: TokenDocumentWithActor | null | undefined,
): SR5VisionModeId | null => {
    if (!tokenDocument) {
        return null;
    }

    return normalizeVisionModeId(tokenDocument.getFlag(SYSTEM_NAME, FLAGS.TokenActiveVisionMode))
        ?? resolveActorDefaultVisionMode(tokenDocument.actor);
};

export const resolveVisionSourceMode = (
    visionSource: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>[0],
): SR5VisionModeId => {
    const tokenDocument = (visionSource?.object as { document?: TokenDocumentWithActor } | undefined)?.document;
    return resolveTokenActiveVisionMode(tokenDocument)
        ?? normalizeVisionModeId(visionSource?.visionMode?.id)
        ?? 'basic';
};

export const isVisionSourceMode = (
    visionSource: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>[0],
    modeId: SR5VisionModeId,
) => resolveVisionSourceMode(visionSource) === modeId;

export const resolveVisionSourcePlane = (
    visionSource: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>[0],
): SR5PerceptionPlane => {
    const mode = resolveVisionSourceMode(visionSource);
    if (mode === 'astralPerception') {
        return 'astral';
    }

    if (mode === 'matrix') {
        return 'matrix';
    }

    return 'physical';
};

type TokenVisibilityChecks = {
    astral?: {
        hasAura?: boolean;
        astralActive?: boolean;
        affectedBySpell?: boolean;
    };
    matrix?: {
        hasIcon?: boolean;
    };
};

export const hasTargetPresenceOnPlane = (
    target: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>[1],
    plane: SR5PerceptionPlane,
) => {
    const tokenDocument = target?.document instanceof TokenDocument ? target.document : null;
    if (!tokenDocument) {
        return false;
    }

    const visibilityChecks = tokenDocument.actor?.system?.visibilityChecks as TokenVisibilityChecks | undefined;

    if (plane === 'astral') {
        return !!visibilityChecks?.astral?.hasAura
            || !!visibilityChecks?.astral?.astralActive
            || !!visibilityChecks?.astral?.affectedBySpell;
    }

    if (plane === 'matrix') {
        return !!visibilityChecks?.matrix?.hasIcon;
    }

    return true;
};
