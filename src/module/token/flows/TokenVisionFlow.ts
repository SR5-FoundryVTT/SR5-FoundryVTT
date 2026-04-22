import { FLAGS, SYSTEM_NAME } from '@/module/constants';
import {
    normalizeVisionModeId,
    resolveActorDefaultVisionMode,
    SR5VisionModeId,
    SR5VisionModeLabelKeys,
    SR5VisionModes,
} from '@/module/vision/visionModeState';

type ActorDocumentWithFlags = {
    getFlag(scope: 'shadowrun5e', key: typeof FLAGS.ActorDefaultVisionMode): unknown;
};

export type TokenDocumentWithVisionFlags = {
    getFlag(scope: 'shadowrun5e', key: typeof FLAGS.TokenActiveVisionMode): unknown;
    setFlag(scope: 'shadowrun5e', key: typeof FLAGS.TokenActiveVisionMode, value: SR5VisionModeId): Promise<unknown>;
    unsetFlag(scope: 'shadowrun5e', key: typeof FLAGS.TokenActiveVisionMode): Promise<unknown>;
    actor?: ActorDocumentWithFlags | null;
};

const getRegisteredVisionModes = (): SR5VisionModeId[] => SR5VisionModes.filter(mode => mode === 'basic' || Boolean(CONFIG.Canvas.visionModes[mode]));

const getModeCycle = (): (SR5VisionModeId | null)[] => [null, ...getRegisteredVisionModes()];

const getSelection = (tokenDocument: TokenDocumentWithVisionFlags): SR5VisionModeId | null => {
    return normalizeVisionModeId(tokenDocument.getFlag(SYSTEM_NAME, FLAGS.TokenActiveVisionMode));
};

export const TokenVisionFlow = {
    getTokenVisionModeSelection(tokenDocument: TokenDocumentWithVisionFlags): SR5VisionModeId | null {
        return getSelection(tokenDocument);
    },

    getTokenVisionMode(tokenDocument: TokenDocumentWithVisionFlags): SR5VisionModeId {
        return getSelection(tokenDocument)
            ?? resolveActorDefaultVisionMode(tokenDocument.actor)
            ?? 'basic';
    },

    getVisionModeLabelKey(mode: SR5VisionModeId | null): string {
        return mode ? SR5VisionModeLabelKeys[mode] : 'SR5.Vision.ActorDefault';
    },

    getTokenVisionModeSelectionLabelKey(tokenDocument: TokenDocumentWithVisionFlags): string {
        const selected = getSelection(tokenDocument);
        return this.getVisionModeLabelKey(selected);
    },

    async cycleTokenVisionMode(
        tokenDocument: TokenDocumentWithVisionFlags,
        direction = 1,
    ): Promise<SR5VisionModeId | null> {
        const cycle = getModeCycle();
        const selected = getSelection(tokenDocument);
        const currentIndex = cycle.findIndex(mode => mode === selected);
        const safeIndex = currentIndex >= 0 ? currentIndex : 0;
        const nextIndex = (safeIndex + direction + cycle.length) % cycle.length;
        const nextMode = cycle[nextIndex];

        if (nextMode === null) {
            await tokenDocument.unsetFlag(SYSTEM_NAME, FLAGS.TokenActiveVisionMode);
            return null;
        }

        await tokenDocument.setFlag(SYSTEM_NAME, FLAGS.TokenActiveVisionMode, nextMode);
        return nextMode;
    },
};
