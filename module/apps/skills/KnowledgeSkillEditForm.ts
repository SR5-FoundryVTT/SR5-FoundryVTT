import { LanguageSkillEditForm } from './LanguageSkillEditForm';
import KnowledgeSkillCategory = Shadowrun.KnowledgeSkillCategory;

export class KnowledgeSkillEditForm extends LanguageSkillEditForm {
    category: KnowledgeSkillCategory;
    _updateString() {
        return `data.skills.knowledge.${this.category}.value.${this.skillId}`;
    }

    constructor(actor, skillId, category, options) {
        super(actor, skillId, options);
        this.category = category;
    }
}
