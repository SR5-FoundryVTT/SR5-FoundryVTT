import SkillEditFormData = Shadowrun.SkillEditFormData;

export class SkillEditForm extends BaseEntitySheet {
    skillId: string;

    constructor(actor, skillId, options) {
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
            template: 'systems/shadowrun5e/templates/apps/skill-edit.html',
            width: 300,
            submitOnClose: true,
            submitOnChange: true,
            closeOnSubmit: false,
            resizable: true,
        });
    }

    get title() {
        const data = this.getData().data;
        return `Edit Skill - ${data?.label ? game.i18n.localize(data.label) : ''}`;
    }

    _onUpdateObject(event, formData, updateData) {
        const base = formData['data.base'];
        const regex = /data\.specs\.(\d+)/;
        const specs = Object.entries(formData).reduce((running, [key, val]: [string, any]) => {
            const found = key.match(regex);
            if (found && found[0]) {
                running.push(val);
            }
            return running;
        }, [] as any[]);

        const currentData = updateData[this._updateString()] || {};
        updateData[this._updateString()] = {
            ...currentData,
            base,
            specs,
        };
    }

    /** @override */
    async _updateObject(event, formData) {
        const updateData = {};
        this._onUpdateObject(event, formData, updateData);
        this.entity.update(updateData);
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('.add-spec').click(this._addNewSpec.bind(this));
        html.find('.remove-spec').click(this._removeSpec.bind(this));
    }

    _addNewSpec(event) {
        event.preventDefault();
        const updateData = {};
        const data = this.getData().data;
        if (data?.specs) {
            // add a blank line to specs
            const { specs } = data;
            updateData[`${this._updateString()}.specs`] = [...specs, ''];
        }
        this.entity.update(updateData);
    }

    _removeSpec(event) {
        event.preventDefault();
        const updateData = {};
        const data = this.getData().data;
        if (data?.specs) {
            const { specs } = data;
            const index = event.currentTarget.dataset.spec;
            if (index >= 0) {
                specs.splice(index, 1);
                updateData[`${this._updateString()}.specs`] = specs;
                this.entity.update(updateData);
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
