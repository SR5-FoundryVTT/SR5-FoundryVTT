import { PackItemFlow } from '@/module/item/flows/PackItemFlow';
import { SR5Actor } from '../SR5Actor';
import { SR5Item } from '@/module/item/SR5Item';
import { SkillItemFlow } from '@/module/item/flows/SkillItemFlow';
import { ActorSkillFlow } from './ActorSkillFlow';
import { Helpers } from '@/module/helpers';

interface ReplaceSkillSetOptions {
    askForConfirmation?: boolean;
}

/**
 * Provides actor specific skill set flow operations.
 */
export const SkillSetFlow = {
    /**
     * Replace the actor's current skillset with the given one.
     * @param actor Actor to replace the skillset on
     * @param skillSet Skillset to apply after removing any existing skillset
     * @param options.askForConfirmation Whether to ask the user for confirmation before replacing the skillset
     */
    async replaceSkillSet(actor: SR5Actor, skillSet: SR5Item<'skill'>, options: ReplaceSkillSetOptions = {askForConfirmation: true}) {
        if (!skillSet.isType('skill') || skillSet.system.type !== 'set') return;
        
        if (actor.system.skillset) {
            const userConsented = await Helpers.confirmDeletion({askForConfirmation: options.askForConfirmation});
            if (!userConsented) return;
            await this.removeSkillSet(actor);
        }

        await this.applySkillSetToActor(actor, skillSet);
    },

    /**
     * Remove the given skillset and skills provided by it from the given actor.
     * 
     * NOTE: We don't check for the existing source skillset, as the actor most function as a
     *       stand alone local copy.
     * @param actor Actor to remove the skillset from
     * @param skillsetUuid UUID of the skillset to remove. Use the actor's current skillset if not provided.
     */
    async removeSkillSet(actor: SR5Actor, skillsetUuid?: string) {
        if (!actor.system.skillset) return;
        if (!skillsetUuid) skillsetUuid = actor.system.skillset;

        const items = actor.items.filter(item => item.type === 'skill')
            .filter(item => item.system.source.uuid === skillsetUuid)
            .map(item => item.id) ?? [];
        await actor.deleteEmbeddedDocuments('Item', items);
        await actor.update({ system: { skillset: '' } });
    },

    /**
     * Apply a given skillset to the given actor, adding all skills provided by the skillset. If the skillset is already applied, this will do nothing.
     * 
     * NOTE: This method is both used for existing and newly created actors. Newly created actors don't have embedded collections, yet.
     *       In that case use options.useSource.
     * NOTE: When an existing actor is used, other skillset skills will've been removed before hand. However, there still might be local custom items interfering.
     * 
     * @param actor Actor to apply the skillset to
     * @param skillSet Skillset to apply onto actor
     * @param options.useSource Define if the actor source data should be updated instead of actors item collection.
     */
    async applySkillSetToActor(actor: SR5Actor, skillSet: SR5Item<'skill'>, options: { useSource?: boolean } = {}) {
        if (!skillSet.isType('skill') || skillSet.system.type !== 'set') return;

        let skills = await PackItemFlow.prepareSkillsForSkillSet(skillSet);
        const groups = await PackItemFlow.prepareSkillGroupsForSkillSet(skillSet) as Item.CreateData[];

        const newSkillKeys = new Set<string>();
        
        skills = skills.filter(item => {
            if (!item.name) return false;

            const skillCategory = foundry.utils.getProperty(item, 'system.skill.category') as string;
            const skillNameByCategoryKey = SkillItemFlow.skillNameByCategoryKey(item.name, skillCategory);
            if (newSkillKeys.has(skillNameByCategoryKey) || ActorSkillFlow.hasSkillOfSameNameAndCategory(actor, item.name, skillCategory)) {
                return false;
            }
            newSkillKeys.add(skillNameByCategoryKey);
            return true;
        });

        const items = [...skills, ...groups];

        // Support document creation flow.
        if (options.useSource) {
            actor.updateSource({ items, system: { skillset: skillSet.uuid } });
            return;
        }

        // Support adding skillset onto existing actor flow.
        await actor.createEmbeddedDocuments('Item', items);
        await actor.update({ system: { skillset: skillSet.uuid } });
        console.log(`Shadowrun 5e | Added ${skills.length} skills and ${groups.length} skill groups from pack to actor ${actor.name}`);
    },
};
