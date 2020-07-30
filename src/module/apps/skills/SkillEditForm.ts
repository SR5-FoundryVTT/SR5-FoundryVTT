import SkillEditFormData = Shadowrun.SkillEditFormData;

export class SkillEditForm extends BaseEntitySheet {
    skillId: string;

    constructor(actor, options, skillId) {
        super(actor, options);
        this.skillId = skillId;
    }

    _updateString() {
        return `data.skills.active.${this.skillId}`;
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
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
        const data = this.getData().data;
        return `${game.i18n.localize('SR5.EditSkill')} - ${data?.label ? game.i18n.localize(data.label) : ''}`;
    }

    _onUpdateObject(event, formData, updateData) {
        // get base value
        const base = formData['data.base'];

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
        };
    }

    /** @override */
    async _updateObject(event, formData) {
        const updateData = {};
        this._onUpdateObject(event, formData, updateData);
        console.log(formData);
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

    getData(): SkillEditFormData {
        const data = super.getData();
        const actor = super.getData().entity;
        data['data'] = actor ? getProperty(actor, this._updateString()) : {};
        return data;
    }
}
