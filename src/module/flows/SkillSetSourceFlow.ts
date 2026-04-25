import { SR5Item } from '@/module/item/SR5Item';

/**
 * Intended for referencing a skillset item for sheet display.
 */
export interface SkillSetReferenceData {
    name: string
    img: string
    uuid: string
}

/**
 * Handle everything around referencing skillset as a source (skill, group). Mostly for sheet display.
 */
export const SkillSetSourceFlow = {
    async prepareSkillSetReference(skillsetUuid?: string | null): Promise<SkillSetReferenceData | null> {
        if (!skillsetUuid) return null;

        const skillset = await fromUuid(skillsetUuid);
        if (!(skillset instanceof SR5Item)) return null;
        if (!skillset.isType('skill') || skillset.system.type !== 'set') return null;

        return {
            name: skillset.name ?? '',
            img: skillset.img as string,
            uuid: skillset.uuid,
        };
    },
};