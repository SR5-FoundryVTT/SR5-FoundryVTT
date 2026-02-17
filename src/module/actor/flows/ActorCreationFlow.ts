import { PackItemFlow } from "@/module/item/flows/PackItemFlow";
import { SR5Actor } from "../SR5Actor";
import { SR5 } from "@/module/config";
import { SR5Item } from "@/module/item/SR5Item";
import { SkillFlow } from "./SkillFlow";

/**
 * All behavior related to actor creation.
 */
export const ActorCreationFlow = {
    /**
     * Apply a skill set to an actor by adding all associated skills and groups.
     *
     * @param actor Actor to add skill items to.
     * @param skillSet Skill set item to apply.
     * @param options.useSource When true, update source data only (used during actor creation).
     */
    async applySkillSetToActor(actor: SR5Actor, skillSet: SR5Item<'skill'>, options: { useSource?: boolean } = {}) {
        if (!skillSet.isType('skill') || skillSet.system.type !== 'set') return;

        const skills = await PackItemFlow.getSkillsForSkillSet(skillSet);
        const groups = await PackItemFlow.getSkillGroupsForSkillSet(skillSet);

        const groupedSkillNames = new Map<string, string>();
        for (const group of groups) {
            if (group.type !== 'skill') continue;
            if (group.system.type !== 'group') continue;

            for (const groupedSkillName of group.system.group.skills) {
                const groupedSkillKey = SkillFlow.nameToKey(groupedSkillName);
                if (!groupedSkillKey || groupedSkillNames.has(groupedSkillKey)) continue;

                groupedSkillNames.set(groupedSkillKey, group.name);
            }
        }

        // Remove pack ids and let Foundry assign new ones.
        const items = [...skills, ...groups].map(item => {
            const itemData = foundry.utils.deepClone(item) as Item.CreateData & { _id?: string };
            delete itemData._id;

            const itemSystemType = foundry.utils.getProperty(itemData, 'system.type');
            if (itemData.type === 'skill' && (itemData as any).system.type === 'skill') {
                const skillKey = SkillFlow.nameToKey(itemData.name);
                const skillGroup = groupedSkillNames.get(skillKey) ?? '';
                foundry.utils.setProperty(itemData, 'system.skill.group', skillGroup);
            }

            return itemData;
        });

        if (options.useSource) {
            actor.updateSource({ items, system: { skillset: skillSet.uuid as string } });
            return;
        }

        await actor.createEmbeddedDocuments('Item', items);
        await actor.update({ system: { skillset: skillSet.uuid as string } });
        console.log(`Shadowrun 5e | Added ${skills.length} skills and ${groups.length} skill groups from pack to actor ${actor.name}`);
    },

    /**
     * Retrieve skill set skills based on actor type.
     * @param actor Actor to add skill items to.
     * @param data Creation data containing the actor type, used to determine which skill items to add.
     */
    async addActorSkillSetSkills(actor: SR5Actor, data: Actor.CreateData) {
        const skillSetName = SR5.defaultSkillPacks[data.type] as string;
        if (!skillSetName) return;

        const skillSet = await PackItemFlow.getPackSkillSet(skillSetName);
        if (!skillSet) return;

        await this.applySkillSetToActor(actor, skillSet, { useSource: true });
        console.log(`Shadowrun 5e | Added skill set ${skillSet.name} to actor source data`);
    }
}