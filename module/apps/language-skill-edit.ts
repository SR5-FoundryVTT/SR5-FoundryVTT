import { SkillEditForm } from './skill-edit.js';

export class LanguageSkillEditForm extends SkillEditForm {
    skillId: string;
    _updateString() {
        return `data.skills.language.value.${this.skillId}`;
    }

    getData() {
        return mergeObject(super.getData(), {
            editable_name: true,
        });
    }

    /** @override */
    _onUpdateObject(event, formData, updateData) {
        super._onUpdateObject(event, formData, updateData);
        const name = formData['data.name'];
        const currentData = updateData[this._updateString()] || {};
        updateData[this._updateString()] = {
            ...currentData,
            name,
        };
    }
}
