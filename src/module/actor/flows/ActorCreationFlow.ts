import { PackItemFlow } from "@/module/item/flows/PackItemFlow";
import { SR5Actor } from "../SR5Actor";
import { SR5 } from "@/module/config";

/**
 * All behavior related to actor creation.
 */
export const ActorCreationFlow = {
    /**
     * Retrieve skill set skills based on actor type.
     * @param actor Actor to add skill items to.
     * @param data Creation data containing the actor type, used to determine which skill items to add.
     */
    async addActorSkillSetSkills(actor: SR5Actor, data: Actor.CreateData) {
        const skillSetName = SR5.defaultSkillPacks[data.type];
        if (!skillSetName) return;

        const skillSet = await PackItemFlow.getPackSkillSet(skillSetName);
        if (!skillSet) return;
        const skills = await PackItemFlow.getSkillsForSkillSet(skillSetName);
        if (!skills) return;

        actor.updateSource({ items: skills, system: { skillset: skillSet.uuid } });
        console.log(`Shadowrun 5e | Added ${skills.length} skills from pack to source data`);
    }
}