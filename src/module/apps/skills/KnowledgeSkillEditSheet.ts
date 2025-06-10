import { KnowledgeSkillCategory } from 'src/module/types/template/SkillsModel';
import { LanguageSkillEditSheet } from './LanguageSkillEditSheet';

export class KnowledgeSkillEditSheet extends LanguageSkillEditSheet {
    category: KnowledgeSkillCategory;
    constructor(actor, options, skillId, category) {
        super(actor, options, skillId);
        this.category = category;
    }

    override _updateString() {
        return `system.skills.knowledge.${this.category}.value.${this.skillId}`;
    }
}
