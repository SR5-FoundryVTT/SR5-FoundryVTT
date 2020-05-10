import {LanguageSkillEditForm} from "./language-skill-edit.js";

export class KnowledgeSkillEditForm extends LanguageSkillEditForm {
    _updateString() {
        return `data.skills.knowledge.${this.category}.value.${this.skillId}`;
    }

    constructor(actor, skillId, category, options) {
        super(actor, skillId, options);
        this.category = category;
    }
}