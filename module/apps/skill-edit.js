export class SkillEditForm extends BaseEntitySheet {

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
        return `Edit Skill - ${game.i18n.localize(this.getData().data.label)}`;
    }

    /** @override */
    _updateObject(event, formData) {
        const updateData = {};
        const base = formData['data.base'];
        const regex = /data\.specs\.(\d+)/;
        const specs = Object.entries(formData).reduce((running, [key, val]) => {
            const found = key.match(regex);
            if (found && found[0]) {
                running.push(val);
            }
            return running;
        }, []);
        updateData[this._updateString()] = {
            base,
            specs,
        };
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
        // add a blank line to specs
        const specializations = this.getData().data.specs;
        updateData[`${this._updateString()}.specs`] = [...specializations, ''];

        this.entity.update(updateData);
    }

    _removeSpec(event) {
        event.preventDefault();
        const updateData = {};
        const specs = this.getData().data.specs;
        const index = event.currentTarget.dataset.spec;
        if (index >= 0) {
            specs.splice(index, 1);
            updateData[`${this._updateString()}.specs`] = specs;
            this.entity.update(updateData)
        }
    }

    getData() {
        const actorData = super.getData().entity;
        const activeSkill = actorData.data.skills.active[this.skillId];
        let label = '';
        let item = 0;
        let base = 0;
        let specs = [];
        if (activeSkill) {
            specs = activeSkill.specs;
            base = activeSkill.base;
            item = activeSkill.item;
            label = activeSkill.label;
        }
        const data = {
            label,
            base,
            specs,
            item,
            skill: activeSkill
        }
        return {
            data
        }
    }
}