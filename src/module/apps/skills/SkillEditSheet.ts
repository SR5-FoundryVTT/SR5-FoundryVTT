import SkillEditFormData = Shadowrun.SkillEditFormData;
import {SR5Actor} from "../../actor/SR5Actor";
import {SR5} from "../../config";
import { LinksHelpers } from "../../utils/links";
import { Translation } from '../../utils/strings';

export class SkillEditSheet extends DocumentSheet {
    skillId: string;

    override get document(): SR5Actor {
        return super.document as SR5Actor;
    }

    constructor(actor, options, skillId) {
        super(actor, options);
        this.skillId = skillId;
    }

    _updateString() {
        return `system.skills.active.${this.skillId}`;
    }

    static override get defaultOptions() {
        const options = super.defaultOptions;
        return foundry.utils.mergeObject(options, {
            id: 'skill-editor',
            classes: ['sr5', 'sheet', 'skill-edit-window'],
            template: 'systems/shadowrun5e/dist/templates/apps/skill-edit.html',
            width: 300,
            height: 'auto',
            submitOnClose: true,
            submitOnChange: true,
            closeOnSubmit: false,
            resizable: true,
        });
    }

    override get title(): string {
        const label = this.document.getSkillLabel(this.skillId);
        return `${game.i18n.localize('SR5.EditSkill')} - ${game.i18n.localize(label as Translation)}`;
    }

    _onUpdateObject(event, formData, updateData) {
        // get skill name.
        // NOTE: This differs from the skill id, which is used to identify the skill internally.
        const name = formData['skill.name'];

        const link = formData['skill.link'];

        // get attribute name
        const attribute = formData['skill.attribute'];

        // get base value
        const base = formData['skill.base'];

        // get can default
        const canDefault = formData['skill.canDefault'];

        // process specializations
        const specsRegex = /skill\.specs\.(\d+)/;
        const specs = Object.entries(formData).reduce<any[]>((running, [key, val]: [string, any]) => {
            const found = key.match(specsRegex);
            if (found?.[0]) {
                running.push(val);
            }
            return running;
        }, []);

        // process bonuses
        const bonusKeyRegex = /skill\.bonus\.(\d+).key/;
        const bonusValueRegex = /skill\.bonus\.(\d+).value/;
        const bonus = Object.entries(formData).reduce<any[]>((running, [key, value]: [string, any]) => {
            const foundKey = key.match(bonusKeyRegex);
            const foundVal = key.match(bonusValueRegex);
            if (foundKey?.[0] && foundKey?.[1]) {
                const index = foundKey[1];
                if (running[index] === undefined) running[index] = {};
                running[index].key = value;
            } else if (foundVal?.[0] && foundVal[1]) {
                const index = foundVal[1];
                if (running[index] === undefined) running[index] = {};
                running[index].value = value;
            }

            return running;
        }, []);

        updateData[this._updateString()] = {
            specs,
            bonus,
            name,
            attribute,
            canDefault,
            link
        };

        // Avoid re-applying active effects without actual base level changes.
        // An actual base level change will come without an active effect, since it's user input.
        if (event.currentTarget.name === 'skill.base') updateData[this._updateString()].base = base;
    }


    /** @override */
    // @ts-expect-error // SkillEditSheet vs DocumentSheet typing, I don't quite get it...
    async _updateObject(event, formData) {
        // Without an actual input field used, avoid a unneeded update...
        // ...the update would happen due to how _onUpdateObject works.
        if (event.currentTarget) {
            const updateData = {};
            this._onUpdateObject(event, formData, updateData);
            await this.document.update(updateData);
        }
    }

    override activateListeners(html) {
        super.activateListeners(html);
        $(html).find('.open-source').on('click', this._onOpenSource.bind(this));
        $(html).find('.add-spec').on('click', this._addNewSpec.bind(this));
        $(html).find('.remove-spec').on('click', this._removeSpec.bind(this));
        $(html).find('.add-bonus').on('click', this._addNewBonus.bind(this));
        $(html).find('.remove-bonus').on('click', this._removeBonus.bind(this));
    }

    async _addNewBonus(event) {
        event.preventDefault();
        const updateData = {};
        const skill = this.getData().skill;
        if (!skill) return;
        const { bonus = [] } = skill;
        // add blank line for new bonus
        updateData[`${this._updateString()}.bonus`] = [...bonus, { key: '', value: 0 }];
        await this.document.update(updateData);
    }

    async _removeBonus(event) {
        event.preventDefault();
        const updateData = {};
        const data = this.getData().skill;
        if (data?.bonus) {
            const { bonus } = data;
            const index = event.currentTarget.dataset.spec;
            if (index >= 0) {
                bonus.splice(index, 1);
                updateData[`${this._updateString()}.bonus`] = bonus;
                await this.document.update(updateData);
            }
        }
    }

    /**
     * Open a source document connected to this skill.
     */
    async _onOpenSource(event) {
        event.preventDefault();
        LinksHelpers.openSource(this.getData().skill.link);
    }

    async _addNewSpec(event) {
        event.preventDefault();
        const updateData = {};
        const data = this.getData().skill;
        if (data?.specs) {
            // add a blank line to specs
            const { specs } = data;
            updateData[`${this._updateString()}.specs`] = [...specs, ''];
        }
        await this.document.update(updateData);
    }

    async _removeSpec(event) {
        event.preventDefault();
        const updateData = {};
        const data = this.getData().skill;
        if (data?.specs) {
            const { specs } = data;
            const index = event.currentTarget.dataset.spec;
            if (index >= 0) {
                specs.splice(index, 1);
                updateData[`${this._updateString()}.specs`] = specs;
                await this.document.update(updateData);
            }
        }
    }

    /** Enhance attribute selection by an empty option to allow newly created skills to have no attribute selected.
     */
    _getSkillAttributesForSelect() {
        return {...SR5.attributes, '': ''};
    }

    _allowSkillNameEditing(): boolean {
        const skill = this.document.getSkill(this.skillId);
        // Typescript sees string here? Double negate for boolean type cast...
        return !!((!skill?.name && !skill?.label) || (skill?.name && !skill?.label));
    }

    // @ts-expect-error // Missing DocumentSheetData typing
    getData(): SkillEditFormData {
        const data = super.getData();

        //@ts-expect-error TODO: foundry-vtt-types v10'
        // skill property will hold a direct skill reference
        data['skill'] = foundry.utils.getProperty(data.data, this._updateString());
        data['editable_name'] = this._allowSkillNameEditing();
        data['editable_canDefault'] = true;
        data['editable_attribute'] = true;
        data['attributes'] = this._getSkillAttributesForSelect();
        return data as unknown as SkillEditFormData;
    }
}
