/**
 * Special functionality around creating new items.
 */
export const CreateItemFlow = {
    /**
     * Inject minimum required data for skill items.
     * 
     * NOTE: This is mostly a fail safe, as Skill DataModel should already provide default values.
     *       However, if ever left empty this will cause created / dropped skill items to not be shown on the sheet
     *       as the skill list is reliant on category and knowledge type.
     */
    injectMinimumSkillData: (itemData: Item.CreateData, skillType: string, skillCategory: string, skillKnowledgeType: string) => {
        itemData['system.type'] = skillType;

        if (skillType === 'group') {
            return;
        }

        if (!skillCategory) console.error(`Shadowrun 5e | Tried to create a Skill item without a skill-category context!`);
        itemData['system.skill.category'] = skillCategory;
        if (skillKnowledgeType) itemData['system.skill.knowledgeType'] = skillKnowledgeType;
    }
}