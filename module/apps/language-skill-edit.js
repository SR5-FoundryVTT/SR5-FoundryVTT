import {SkillEditForm} from "./skill-edit.js";

export class LanguageSkillEditForm extends SkillEditForm {
    _updateString() {
        return `data.skills.language.value.${this.skillId}`;
    }

    get title() {
        return `Edit Skill - ${game.i18n.localize(this.getData().data.name)}`;
    }

    getData() {
        return mergeObject(super.getData(), {
            editable_name: true
        });
    }

    /** @override */
    _onUpdateObject(event, formData, updateData) {
        super._onUpdateObject(event, formData, updateData);
        const name = formData['data.name'];
        const currentData = updateData[this._updateString()] || {};
        updateData[this._updateString()] = {
            ...currentData,
            name
        };
    }
}
