import SkillEditFormData = Shadowrun.SkillEditFormData;
import {SR5Actor} from "../../actor/SR5Actor";

export class SkillEditForm extends BaseEntitySheet {
    skillId: string;

    get entity(): SR5Actor {
        //@ts-ignore
        return super.entity;
    }

    constructor(actor, options, skillId) {
        super(actor, options);
        this.skillId = skillId;
    }

    _updateString() {
        return `data.skills.active.${this.skillId}`;
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        // @ts-ignore
        return mergeObject(options, {
            id: 'skill-editor',
            classes: ['sr5', 'sheet', 'skill-edit-window'],
            template: 'systems/shadowrun5e/dist/templates/apps/skill-edit.html',
            width: 300,
            submitOnClose: true,
            submitOnChange: true,
            closeOnSubmit: false,
            resizable: true,
        });
    }

    get title(): string {
        const label = this.entity.getSkillLabel(this.skillId);
        return `${game.i18n.localize('SR5.EditSkill')} - ${game.i18n.localize(label)}`;
    }

    _onUpdateObject(event, formData, updateData) {
        // get skill name.
        // NOTE: This differs from the skill id, which is used to identify the skill internally.
        const name = formData['data.name'];

        // get attribute name
        const attribute = formData['data.attribute'];

        // get base value
        const base = formData['data.base'];

        // get can default
        const canDefault = formData['data.canDefault'];

        // process specializations
        const specsRegex = /data\.specs\.(\d+)/;
        const specs = Object.entries(formData).reduce((running, [key, val]: [string, any]) => {
            const found = key.match(specsRegex);
            if (found && found[0]) {
                running.push(val);
            }
            return running;
        }, [] as any[]);

        // process bonuses
        const bonusKeyRegex = /data\.bonus\.(\d+).key/;
        const bonusValueRegex = /data\.bonus\.(\d+).value/;
        const bonus = Object.entries(formData).reduce((running, [key, value]: [string, any]) => {
            const foundKey = key.match(bonusKeyRegex);
            const foundVal = key.match(bonusValueRegex);
            if (foundKey && foundKey[0] && foundKey[1]) {
                const index = foundKey[1];
                if (running[index] === undefined) running[index] = {};
                running[index].key = value;
            } else if (foundVal && foundVal[0] && foundVal[1]) {
                const index = foundVal[1];
                if (running[index] === undefined) running[index] = {};
                running[index].value = value;
            }

            return running;
        }, [] as any[]);

        const currentData = updateData[this._updateString()] || {};
        updateData[this._updateString()] = {
            ...currentData,
            base,
            specs,
            bonus,
            name,
            attribute,
            canDefault
        };
    }


    /** @override */
    // @ts-ignore // TODO: TYPE: Remove this...
    async _updateObject(event: Event, formData: object) {
        const updateData = {};
        this._onUpdateObject(event, formData, updateData);
        await this.entity.update(updateData);
    }

    activateListeners(html) {
        super.activateListeners(html);
        $(html).find('.add-spec').on('click', this._addNewSpec.bind(this));
        $(html).find('.remove-spec').on('click', this._removeSpec.bind(this));
        $(html).find('.add-bonus').on('click', this._addNewBonus.bind(this));
        $(html).find('.remove-bonus').on('click', this._removeBonus.bind(this));
    }

    async _addNewBonus(event) {
        event.preventDefault();
        const updateData = {};
        const data = this.getData().data;
        if (!data) return;
        const { bonus = [] } = data;
        // add blank line for new bonus
        updateData[`${this._updateString()}.bonus`] = [...bonus, { key: '', value: 0 }];
        await this.entity.update(updateData);
    }

    async _removeBonus(event) {
        event.preventDefault();
        const updateData = {};
        const data = this.getData().data;
        if (data?.bonus) {
            const { bonus } = data;
            const index = event.currentTarget.dataset.spec;
            if (index >= 0) {
                bonus.splice(index, 1);
                updateData[`${this._updateString()}.bonus`] = bonus;
                await this.entity.update(updateData);
            }
        }
    }

    async _addNewSpec(event) {
        event.preventDefault();
        const updateData = {};
        const data = this.getData().data;
        if (data?.specs) {
            // add a blank line to specs
            const { specs } = data;
            updateData[`${this._updateString()}.specs`] = [...specs, ''];
        }
        await this.entity.update(updateData);
    }

    async _removeSpec(event) {
        event.preventDefault();
        const updateData = {};
        const data = this.getData().data;
        if (data?.specs) {
            const { specs } = data;
            const index = event.currentTarget.dataset.spec;
            if (index >= 0) {
                specs.splice(index, 1);
                updateData[`${this._updateString()}.specs`] = specs;
                await this.entity.update(updateData);
            }
        }
    }

    /** Enhance attribute selection by an empty option to allow newly created skills to have no attribute selected.
     */
    _getSkillAttributesForSelect() {
        return {...SR5CONFIG.attributes, '': ''};
    }

    _allowSkillNameEditing(): boolean {
        const skill = this.entity.getSkill(this.skillId);
        // Typescript sees string here? Double negate for boolean type cast...
        return !!((!skill?.name && !skill?.label) || (skill?.name && !skill?.label));
    }

    getData(): SkillEditFormData {
        const data = super.getData();
        // @ts-ignore
        const actor = data.entity;

        data['data'] = actor ? getProperty(actor, this._updateString()) : {};
        data['editable_name'] = this._allowSkillNameEditing();
        data['editable_canDefault'] = true;
        data['editable_attribute'] = true;
        data['attributes'] = this._getSkillAttributesForSelect();
        return data as SkillEditFormData;
    }
}
