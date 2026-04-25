import { SR5 } from '../../config';
import { SkillRules } from '@/module/rules/SkillRules';
import { SR5Item } from '../SR5Item';

/**
 * Handles item create/update normalization for skill item data.
 */
export const UpdateSkillFlow = {
    /**
     * Applies category-specific skill defaults before the document change is stored.
     *
     * Knowledge and language skills derive their attribute from category metadata
     * and do not allow defaulting, so both values are enforced here for create and
     * update lifecycles.
     *
     * @param changeData The pending create or update payload.
     * @param item The skill item providing existing context for omitted fields.
     */
    injectSkillCategoryDefaults(changeData: Item.UpdateData, item: SR5Item) {
        if (!item.isType('skill')) return;

        const category = foundry.utils.getProperty(changeData, 'system.skill.category') ?? item.system.skill.category;
        if (!category || category === 'active') return;

        const knowledgeType = (foundry.utils.getProperty(changeData, 'system.skill.knowledgeType') ?? item.system.skill.knowledgeType) as keyof typeof SR5.knowledgeAttributes | undefined;

        switch (category) {
            case 'knowledge':
                changeData['system.skill.attribute'] = knowledgeType ? (SkillRules.knowledgeSkillAttribute(knowledgeType) ?? '') : '';
                break;
            case 'language':
                changeData['system.skill.attribute'] = SkillRules.languageSkillAttribute();
                break;
        }

        changeData['system.skill.defaulting'] = false;
    },
};