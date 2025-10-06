import { SkillEditSheet } from './SkillEditSheet';

export class LanguageSkillEditSheet extends SkillEditSheet {
    override _updateString() {
        return `system.skills.language.value.${this.skillId}`;
    }

    override _getSkillFields(systemFields) {
        return systemFields.skills.fields.language.fields.value.element.fields;
    }

    override _prepareContext(options) {
        const data = super._prepareContext(options);
        return foundry.utils.mergeObject(data, {
            editable_name: true,
            editable_canDefault: false,
            editable_attribute: false
        });
    }
}
