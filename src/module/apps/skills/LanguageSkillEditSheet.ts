import { SkillEditSheet } from './SkillEditSheet';

export class LanguageSkillEditSheet extends SkillEditSheet {
    override readonly canBeNative: boolean = true;

    override _updateString() {
        return `system.skills.language.value.${this.skillId}`;
    }

    override _getSkillFields(systemFields) {
        return systemFields.skills.fields.language.fields.value.element.fields;
    }

    override async _prepareContext(options: Parameters<SkillEditSheet["_prepareContext"]>[0]) {
        const data = super._prepareContext(options);
        console.log('preparing language skill');
        return foundry.utils.mergeObject(data, {
            editable_name: true,
            editable_canDefault: false,
            editable_attribute: false,
        });
    }
}
