import { LanguageSkillEditSheet } from './LanguageSkillEditSheet';
import KnowledgeSkillCategory = Shadowrun.KnowledgeSkillCategory;

export class KnowledgeSkillEditSheet extends LanguageSkillEditSheet {
    category: KnowledgeSkillCategory;
    constructor(actor, options, skillId, category) {
        super(actor, options, skillId);
        this.category = category;
    }
    _updateString() {
        return `system.skills.knowledge.${this.category}.value.${this.skillId}`;
    }
}
