import { SkillEditSheet } from './SkillEditSheet';

export class LanguageSkillEditSheet extends SkillEditSheet {
    override _updateString() {
        return `system.skills.language.value.${this.skillId}`;
    }

    override getData() {
        return foundry.utils.mergeObject(super.getData(), {
            editable_name: true,
            editable_canDefault: false,
            editable_attribute: false
        });
    }

    /** @override */
    override _onUpdateObject(event, formData, updateData) {
        super._onUpdateObject(event, formData, updateData);
        const name = formData['skill.name'];
        const currentData = updateData[this._updateString()] || {};
        updateData[this._updateString()] = {
            ...currentData,
            name,
        };
    }
}
