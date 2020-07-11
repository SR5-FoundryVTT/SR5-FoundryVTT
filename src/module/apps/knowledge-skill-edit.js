import { LanguageSkillEditForm } from './language-skill-edit';
export class KnowledgeSkillEditForm extends LanguageSkillEditForm {
    constructor(actor, skillId, category, options) {
        super(actor, skillId, options);
        this.category = category;
    }
    _updateString() {
        return `data.skills.knowledge.${this.category}.value.${this.skillId}`;
    }
}
