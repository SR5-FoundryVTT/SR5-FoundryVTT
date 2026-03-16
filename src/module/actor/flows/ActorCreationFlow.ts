/**
 * Actor creation flow helpers used while initializing newly created actors.
 */
import { PackItemFlow } from "@/module/item/flows/PackItemFlow";
import { SR5Actor } from "../SR5Actor";
import { SkillSetFlow } from './SkillSetFlow';

/**
 * All behavior related to actor creation and updating.
 */
export const ActorCreationFlow = {
    /**
     * Retrieve skill set skills based on actor type.
     * @param actor Actor to add skill items to.
     * @param data Creation data containing the actor type, used to determine which skill items to add.
     */
    async addDefaultActorSkillset(actor: SR5Actor, data: Actor.CreateData) {
        // Find first default skillset for this actor type.
        const skillSets = await PackItemFlow.getAllPackSkillSets();
        const skillSet = skillSets.find(skillSet => {
            if (!skillSet.system.set.default.type) return false;
            return skillSet.system.set.default.type.includes(data.type as string);
        });

        if (!skillSet) {
            console.debug(`Shadowrun 5e | No default skill set found for actor type ${data.type}, skipping default skill set application`);
            return;
        }

        await SkillSetFlow.applySkillSetToActor(actor, skillSet, { useSource: true });

        console.debug(`Shadowrun 5e | Added skill set ${skillSet.name} to actor source data`);
    }
}