import { FLAGS, SYSTEM_NAME } from '../constants';

type DetectionRangeParameters = Parameters<foundry.canvas.perception.DetectionMode['_testRange']>;

type DocumentWithFlags = {
    getFlag(scope: string, key: string): unknown;
};

type TokenDocumentWithActor = DocumentWithFlags & {
    actor?: DocumentWithFlags | null;
    sight?: {
        range?: number;
    };
};

const readRangeOverride = (modeId: string, value: unknown) => {
    if (!value || typeof value !== 'object') {
        return null;
    }

    const rawRange = (value as Record<string, unknown>)[modeId];
    const range = Number(rawRange);
    return Number.isFinite(range) && range > 0 ? range : null;
};

const resolveRangeOverride = (visionSource: DetectionRangeParameters[0], modeId: string) => {
    if (!modeId) {
        return null;
    }

    const tokenDocument = (visionSource?.object as { document?: TokenDocumentWithActor } | undefined)?.document;
    if (!tokenDocument) {
        return null;
    }

    const tokenOverrides = tokenDocument.getFlag(SYSTEM_NAME, FLAGS.TokenDetectionRangeOverrides);
    const tokenRange = readRangeOverride(modeId, tokenOverrides);
    if (tokenRange !== null) {
        return tokenRange;
    }

    const actorOverrides = tokenDocument.actor?.getFlag(SYSTEM_NAME, FLAGS.ActorDetectionRangeOverrides);
    return readRangeOverride(modeId, actorOverrides);
};

export const resolveDetectionModeRange = (
    visionSource: DetectionRangeParameters[0],
    mode: DetectionRangeParameters[1],
) => {
    const configuredRange = Number(mode?.range);
    if (Number.isFinite(configuredRange) && configuredRange > 0) {
        return configuredRange;
    }

    const modeId = typeof mode?.id === 'string' ? mode.id : '';
    const rangeOverride = resolveRangeOverride(visionSource, modeId);
    if (rangeOverride !== null) {
        return rangeOverride;
    }

    const sightRange = Number((visionSource?.object as { document?: TokenDocumentWithActor } | undefined)?.document?.sight?.range);
    if (Number.isFinite(sightRange) && sightRange > 0) {
        return sightRange;
    }

    return 0;
};