import { PackItemFlow } from '@/module/item/flows/PackItemFlow';
import { SR5Actor } from '../SR5Actor';
import { SR5Item } from '@/module/item/SR5Item';
import { SkillNamingFlow } from '../../flows/SkillNamingFlow';
import { SkillGroupFlow } from './SkillGroupFlow';
import { SkillItemFlow } from '@/module/item/flows/SkillItemFlow';

/**
 * Provides actor specific skill set flow operations.
 */
export const SkillSetFlow = {
    /**
     * Remove the given skillset and skills provided by it from the given actor.
     * @param actor Actor to remove the skillset from
     * @param skillsetUuid UUID of the skillset to remove. Use the actor's current skillset if not provided.
     */
    async removeSkillSet(actor: SR5Actor, skillsetUuid?: string) {
        if (!actor.system.skillset) return;
        if (!skillsetUuid) skillsetUuid = actor.system.skillset;

        const skillset = await fromUuid(skillsetUuid);
        if (!(skillset instanceof SR5Item)) return;
        if (!skillset?.isType('skill') || skillset.system.type !== 'set') return;

        const items: string[] = [];
        for (const setSkill of skillset.system.set.skills) {
            const item = actor.itemsForType.get('skill')?.find(skill => skill.name === setSkill.name);
            if (item) items.push(item.id!);
        }

        await actor.deleteEmbeddedDocuments('Item', items);
    },

    /**
     * Apply a given skillset to the given actor, adding all skills provided by the skillset. If the skillset is already applied, this will do nothing.
     * 
     * NOTE: This method is both used for existing and newly created actors. Newly created actors don't have embedded collections, yet.
     *       In that case use options.useSource.
     * 
     * @param actor Actor to apply the skillset to
     * @param skillSet Skillset to apply onto actor
     * @param options.useSource Define if the actor source data should be updated instead of actors item collection.
     */
    async applySkillSetToActor(actor: SR5Actor, skillSet: SR5Item<'skill'>, options: { useSource?: boolean } = {}) {
        if (!skillSet.isType('skill') || skillSet.system.type !== 'set') return;

        const skills = await PackItemFlow.getSkillsForSkillSet(skillSet);
        const groups = await PackItemFlow.getSkillGroupsForSkillSet(skillSet) as Item.CreateData[];
        const configuredSkillEntries = new Map(skillSet.system.set.skills.map(skill => [skill.name, skill]));
        const groupedSkillNames = SkillGroupFlow.buildGroupedSkillIndex(groups);

        const newSkillKeys = new Set<string>();
        // TODO: tamif - skill - why mixing skill items and skill group items?
        const items = [...skills, ...groups].flatMap(item => {
            const itemData = foundry.utils.deepClone(item) as Item.CreateData & { _id?: string };
            delete itemData._id;

            if (itemData.type === 'skill' && foundry.utils.getProperty(itemData, 'system.type') === 'skill') {
                if (!itemData.name) return [];

                const skillCategory = foundry.utils.getProperty(itemData, 'system.skill.category') as string | undefined;
                const skillNameByCategoryKey = SkillItemFlow.skillNameByCategoryKey(itemData.name, skillCategory);
                if (SkillItemFlow.hasSkillWithSameNameAndCategory(actor, itemData.name, skillCategory) || newSkillKeys.has(skillNameByCategoryKey)) {
                    return [];
                }
                newSkillKeys.add(skillNameByCategoryKey);

                const skillKey = SkillNamingFlow.nameToKey(itemData.name);
                const groupedSkill = groupedSkillNames.get(skillKey);
                const skillGroup = groupedSkill?.name ?? '';
                const configuredSkill = configuredSkillEntries.get(itemData.name);
                foundry.utils.setProperty(itemData, 'system.skill.group', skillGroup);
                if (groupedSkill) {
                    foundry.utils.setProperty(itemData, 'system.skill.rating', groupedSkill.rating);
                }

                if (configuredSkill) {
                    const existingSpecializations = foundry.utils.getProperty(itemData, 'system.skill.specializations') as { name: string }[] | undefined;
                    const mergedSpecializations = [...(existingSpecializations ?? [])];

                    for (const specialization of configuredSkill.specializations) {
                        if (mergedSpecializations.some(existing => existing.name === specialization.name)) continue;
                        mergedSpecializations.push(foundry.utils.deepClone(specialization));
                    }

                    foundry.utils.setProperty(itemData, 'system.skill.specializations', mergedSpecializations);
                }
            }

            return [itemData];
        });

        if (options.useSource) {
            actor.updateSource({ items, system: { skillset: skillSet.uuid } });
            return;
        }

        await actor.createEmbeddedDocuments('Item', items);
        await actor.update({ system: { skillset: skillSet.uuid } });
        console.log(`Shadowrun 5e | Added ${skills.length} skills and ${groups.length} skill groups from pack to actor ${actor.name}`);
    },
};
