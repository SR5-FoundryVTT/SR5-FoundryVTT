import { LanguageSkillEditForm } from './LanguageSkillEditForm';
import KnowledgeSkillCategory = Shadowrun.KnowledgeSkillCategory;

export class KnowledgeSkillEditForm extends LanguageSkillEditForm {
    category: KnowledgeSkillCategory;
    constructor(actor, options, skillId, category) {
        super(actor, options, skillId);
        this.category = category;
    }
    _updateString() {
        return `data.skills.knowledge.${this.category}.value.${this.skillId}`;
    }
}
