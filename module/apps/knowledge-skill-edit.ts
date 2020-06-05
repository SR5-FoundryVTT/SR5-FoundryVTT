import { LanguageSkillEditForm } from './language-skill-edit';
import KnowledgeSkillCategory = Shadowrun.KnowledgeSkillCategory;

export class KnowledgeSkillEditForm extends LanguageSkillEditForm {
    category: KnowledgeSkillCategory;
    skillId: string;
    _updateString() {
        return `data.skills.knowledge.${this.category}.value.${this.skillId}`;
    }

    constructor(actor, skillId, category, options) {
        super(actor, skillId, options);
        this.category = category;
    }
}
