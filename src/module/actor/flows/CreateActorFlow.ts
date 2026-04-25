import { PackItemFlow } from '@/module/item/flows/PackItemFlow';
import { SR5Actor } from '../SR5Actor';
import { SkillSetFlow } from './SkillSetFlow';

/**
 * Handles actor initialization concerns that only apply during document creation.
 *
 * This flow is intentionally narrow: it prepares newly created actors with any
 * default embedded data that should exist but can't be part of DataModel schema initials.
 */
export const CreateActorFlow = {
    /**
     * Applies the first matching default skill set for the actor type being created.
     *
     * This runs during actor creation so the initial actor state already contains
     * the configured baseline skills instead of relying on a later migration or
     * manual setup step.
     *
     * @param actor Actor to add skill items to.
     * @param data Creation data containing the actor type used for skill set selection.
     */
    async addDefaultActorSkillset(actor: SR5Actor, data: Actor.CreateData) {
        //@ts-expect-error asd
        if (window.doNotPopulateDefaultSkills) return console.warn(`Shadowrun 5e | Skipping default skill set application for actor ${actor.name} due to doNotPopulateDefaultSkills flag`);

        const skillSets = await PackItemFlow.getAllPackSkillSets();
        const skillSet = skillSets.find(skillSet => {
            if (!skillSet.system.set.default.type) return false;
            return skillSet.system.set.default.type === data.type;
        });

        if (!skillSet) {
            console.debug(`Shadowrun 5e | No default skill set found for actor type ${data.type}, skipping default skill set application`);
            return;
        }

        await SkillSetFlow.applySkillSetToActor(actor, skillSet, { useSource: true });

        console.debug(`Shadowrun 5e | Added skill set ${skillSet.name} to actor source data`);
    }
};