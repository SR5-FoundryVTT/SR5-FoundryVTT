import { SR5Item } from "@/module/item/SR5Item";
import { SR5Actor } from "../SR5Actor";
import { SkillItemFlow } from "@/module/item/flows/SkillItemFlow";

/**
 * Actor specific handling around SkillFields.
 */
export const ActorSkillFlow = {
    /**
     * Add a new skill item onto the given actor, ensuring that there are no duplicates by name and category.
     * @param actor Actor to add the skill to
     * @param item Skill item data
     * @param options.defaultName Define the default name for the skill item. If not provided, the item's current name will be used.
     * @param options.warnOnDuplicate Define if a warning should be shown if the actor already has a skill with the same name and category. Default is false.
     * @returns The created skill items
     */
    async addSkill(actor: SR5Actor, item: Item.CreateData<'skill'>, options: { defaultName?: string, warnOnDuplicate?: boolean } = {}) {
        const name = options.defaultName ?? item.name;
        const category = foundry.utils.getProperty(item, 'system.skill.category') as string;

        if (ActorSkillFlow.hasSkillOfSameNameAndCategory(actor, name, category)) {
            if (options.warnOnDuplicate) {
                const message = game.i18n.format('SR5.Errors.SkillAlreadyExists', { name: item.name, actorName: actor.name, actorUuid: actor.uuid });
                ui.notifications?.warn(message);
            }
            return;
        };

        return await actor.createEmbeddedDocuments('Item', [item]) as SR5Item<'skill'>[];
    },

    /**
     * Determine if a skill with the same name and category already exists on the given actor.
     * This is necessary as the SkillFields system.skills can only contain a single entry for each.
     * @param actor Actor to check for existing skills
     * @param name Skill name to check against
     * @param category Skill category to check against
     */
    hasSkillOfSameNameAndCategory(actor: SR5Actor, name: string, category: string) {
        const skillKey = SkillItemFlow.skillNameByCategoryKey(name, category);
        const skills = actor.items.filter(item => item.type === 'skill');
        return skills?.some(skill => {
            return SkillItemFlow.skillNameByCategoryKey(skill.name, skill.system.skill.category) === skillKey;
        }) ?? false;
    },
}