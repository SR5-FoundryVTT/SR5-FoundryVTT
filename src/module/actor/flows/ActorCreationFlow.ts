import { PackItemFlow } from "@/module/item/flows/PackItemFlow";
import { SR5Actor } from "../SR5Actor";
import { SR5 } from "@/module/config";

/**
 * All behavior related to actor creation.
 */
export const ActorCreationFlow = {

    /**
     * Add default skill items to the given actor, based on their type.
     * 
     * This can be called anytime, however it's primarily used during actor creation.
     * 
     * @param actor Actor to add skill items to.
     * @param data Creation data containing the actor type, used to determine which skill items to add.
     */
    async addDefaultSkillSetSkills(actor: SR5Actor, data: Actor.CreateData) {
        switch(data.type) {
            case 'character':
                return await this.addCharacterSkillSetSkills(actor, data);
        }
    },

    /**
     * Retrieve skill set skills based on actor type.
     * @param actor Actor to add skill items to.
     * @param data Creation data containing the actor type, used to determine which skill items to add.
     */
    async addActorSkillSetSkills(actor: SR5Actor, data: Actor.CreateData) {
        const skillSet = SR5.defaultSkillPacks[data.type];
        if (!skillSet) return;

        const skills = await PackItemFlow.getSkillsForSkillSet(skillSet);
        if (!skills) return;

        actor.updateSource({ items: skills });
        console.log(`Shadowrun 5e | Added ${skills.length} skills from pack to source data`);
    },

    async addCharacterSkillSetSkills(actor: SR5Actor, data: Actor.CreateData) {
        // Use try-catch to not disturb actor creation in general...
        try {
            const skills = await PackItemFlow.getPackSkills();
            if (!skills) return;

            const items = skills.map(skill => skill.toObject());
            actor.updateSource({ items });
            console.log(`Shadowrun 5e | Added ${items.length} skills from pack to source data`);
        } catch (error) {
            console.error('Shadowrun 5e | Failed to add skills from pack:', error);
        }
    }
}