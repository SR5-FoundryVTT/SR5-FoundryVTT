import { FLAGS, SYSTEM_NAME } from '../constants';

export const SR5VisionModes = [
    'basic',
    'astralPerception',
    'thermographic',
    'lowlight',
    'augmentedReality',
    'ultrasound',
] as const;

export const SR5VisionModePriority = [
    'astralPerception',
    'thermographic',
    'lowlight',
    'augmentedReality',
    'ultrasound',
    'basic',
] as const;

export const SR5VisionModeLabelKeys: Record<(typeof SR5VisionModes)[number], string> = {
    basic: 'SR5.Vision.Mundane',
    astralPerception: 'SR5.Vision.AstralPerception',
    thermographic: 'SR5.Vision.ThermographicVision',
    lowlight: 'SR5.Vision.LowLight',
    augmentedReality: 'SR5.Vision.AugmentedReality',
    ultrasound: 'SR5.Vision.Ultrasound',
};

export type SR5VisionModeId = (typeof SR5VisionModes)[number];

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
