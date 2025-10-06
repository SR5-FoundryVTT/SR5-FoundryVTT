import { KnowledgeSkillCategory } from 'src/module/types/template/Skills';
import { LanguageSkillEditSheet } from './LanguageSkillEditSheet';

export class KnowledgeSkillEditSheet extends LanguageSkillEditSheet {
    category: KnowledgeSkillCategory;
    constructor(options, skillId, category) {
        super(options, skillId);
        this.category = category;
    }

    override _getSkillFields(systemFields) {
        return systemFields.skills.fields.knowledge.fields[this.category].fields.value.element.fields;
    }

    override _updateString() {
        return `system.skills.knowledge.${this.category}.value.${this.skillId}`;
    }
}
