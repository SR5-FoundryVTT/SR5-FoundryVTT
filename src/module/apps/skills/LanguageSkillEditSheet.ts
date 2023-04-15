import { SkillEditSheet } from './SkillEditSheet';
import SkillEditFormData = Shadowrun.SkillEditFormData;

export class LanguageSkillEditSheet extends SkillEditSheet {
    override _updateString() {
        return `system.skills.language.value.${this.skillId}`;
    }

    override getData() {
        return mergeObject(super.getData(), {
            editable_name: true,
            editable_canDefault: false,
            editable_attribute: false
        } as SkillEditFormData);
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
