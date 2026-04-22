import { FLAGS, SYSTEM_NAME } from '../constants';

type TemplateDocumentLike = {
    getFlag?(scope: string, key: string): unknown;
    flags?: Record<string, unknown>;
};

export type SR5TemplateFlagsData = {
    isVisualSmoke: boolean;
    isThermalSmoke: boolean;
};

const readFlag = (document: TemplateDocumentLike | null | undefined, key: string) => {
    if (!document) {
        return undefined;
    }

    if (typeof document.getFlag === 'function') {
        return document.getFlag(SYSTEM_NAME, key);
    }

    const sr5Flags = (document.flags?.[SYSTEM_NAME] as Record<string, unknown> | undefined) ?? {};
    return sr5Flags[key];
};

export const getSR5TemplateFlags = (document: TemplateDocumentLike | null | undefined): SR5TemplateFlagsData => ({
    isVisualSmoke: readFlag(document, FLAGS.TemplateIsVisualSmoke) === true,
    isThermalSmoke: readFlag(document, FLAGS.TemplateIsThermalSmoke) === true,
});
