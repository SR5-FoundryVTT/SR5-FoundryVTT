import { SR5Item } from "@/module/item/SR5Item";
import { SR5Actor } from "../SR5Actor";
import { SkillItemFlow } from "@/module/item/flows/SkillItemFlow";

type SkillType = SR5Item<'skill'>['system']['type'];

/**
 * Actor specific handling around SkillFields.
 */
export const ActorSkillFlow = {
    /**
     * Add a new skill item onto the given actor, ensuring that there are no duplicates by name, category and skill type.
     * @param actor Actor to add the skill to
     * @param item Skill item data
     * @param options.defaultName Define the default name for the skill item. If not provided, the item's current name will be used.
     * @param options.warnOnDuplicate Define if a warning should be shown if the actor already has a skill with the same name and category. Default is false.
     * @returns The created skill items
     */
    async addSkill(actor: SR5Actor, item: Item.CreateData<'skill'>, options: { defaultName?: string, warnOnDuplicate?: boolean } = {}) {
        const name = options.defaultName ?? item.name;
        const category = foundry.utils.getProperty(item, 'system.skill.category') as string;
        const type = foundry.utils.getProperty(item, 'system.type') as SkillType | undefined;

        if (ActorSkillFlow.hasSkillOfSameNameAndCategory(actor, name, category, type)) {
            if (options.warnOnDuplicate) {
                const message = game.i18n.format('SR5.Warnings.SkillAlreadyExists', { name: item.name, actorName: actor.name, actorUuid: actor.uuid! });
                ui.notifications?.warn(message);
            }
            return;
        };

        return await actor.createEmbeddedDocuments('Item', [item]) as SR5Item<'skill'>[];
    },

    /**
     * Determine if a skill item of the same skill type, name and category already exists on the given actor.
     * This is necessary as the SkillFields system.skills can only contain a single entry for each.
     * @param actor Actor to check for existing skills
     * @param name Skill name to check against
     * @param category Skill category to check against
     * @param type Skill type (skill, group or set) to check against
     */
    hasSkillOfSameNameAndCategory(actor: SR5Actor, name: string, category: string, type: SkillType = 'skill') {
        const skillKey = SkillItemFlow.skillNameByCategoryKey(name, category);
        return actor.items.some(item => {
            return item.isType('skill') && item.system.type === type
                && SkillItemFlow.skillNameByCategoryKey(item.name, item.system.skill.category) === skillKey;
        });
    },
}
