var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
            template: 'systems/shadowrun5e/dist/templates/apps/skill-edit.html',
            width: 300,
            submitOnClose: true,
            submitOnChange: true,
            closeOnSubmit: false,
            resizable: true,
        });
    }
    get title() {
        const data = this.getData().data;
        return `Edit Skill - ${(data === null || data === void 0 ? void 0 : data.label) ? game.i18n.localize(data.label) : ''}`;
    }
    _onUpdateObject(event, formData, updateData) {
        const base = formData['data.base'];
        const regex = /data\.specs\.(\d+)/;
        const specs = Object.entries(formData).reduce((running, [key, val]) => {
            const found = key.match(regex);
            if (found && found[0]) {
                running.push(val);
            }
            return running;
        }, []);
        const currentData = updateData[this._updateString()] || {};
        updateData[this._updateString()] = Object.assign(Object.assign({}, currentData), { base,
            specs });
    }
    /** @override */
    _updateObject(event, formData) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateData = {};
            this._onUpdateObject(event, formData, updateData);
            this.entity.update(updateData);
        });
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
        if (data === null || data === void 0 ? void 0 : data.specs) {
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
        if (data === null || data === void 0 ? void 0 : data.specs) {
            const { specs } = data;
            const index = event.currentTarget.dataset.spec;
            if (index >= 0) {
                specs.splice(index, 1);
                updateData[`${this._updateString()}.specs`] = specs;
                this.entity.update(updateData);
            }
        }
    }
    getData() {
        const data = super.getData();
        const actor = super.getData().entity;
        data['data'] = actor ? getProperty(actor, this._updateString()) : {};
        return data;
    }
}
