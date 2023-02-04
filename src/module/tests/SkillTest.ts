import { PartsList } from '../parts/PartsList';
import { SR5Actor } from './../actor/SR5Actor';
import { SuccessTest, SuccessTestData, TestOptions } from './SuccessTest';


export interface SkillTestData extends SuccessTestData {
    attribute: string
    limitSelection: string
    sepcialization: boolean
}


/**
 * Handle skill test allowing for alterting the attribtue used for that skill away from the
 * pre configuration.
 * 
 * Rule wise a skill test doesn't alter a default success test.
 */
export class SkillTest extends SuccessTest {
    data: SkillTestData

    get _dialogTemplate() {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/skill-test-dialog.html';
    }

    get title() {
        const skill = this.actor?.getSkill(this.data.action.skill);
        if (!skill) return super.title;
        return `${game.i18n.localize(skill.label)} ${game.i18n.localize('SR5.Test')}`;
    }

    _prepareData(data: any, options: TestOptions) {
        data = super._prepareData(data, options);

        // Preselect attribute based on action.
        data.attribute = data.action.attribute;
        data.limitSelection = data.action.limit.attribute;

        return data;
    }

    prepareBaseValues() {
        this.prepareAttributeSelection();
        this.prepareLimitSelection();

        super.prepareBaseValues();
    }

    /**
     * TODO:
     * @returns 
     */
    prepareAttributeSelection() {
        if (!this.actor) return;

        this.data.pool.mod = [];
        const pool = new PartsList(this.pool.mod);

        const skill = this.actor.getSkill(this.data.action.skill);
        const attribute = this.actor.getAttribute(this.data.attribute);

        if (skill) pool.addPart(skill.label, skill.value);
        if (attribute) pool.addPart(attribute.label, attribute.value);

        if (attribute && this.actor._isMatrixAttribute(this.data.attribute)) this.actor._addMatrixParts(pool, true);
    }

    prepareLimitSelection() {
        if (!this.actor) return;

        this.data.limit.mod = [];
        const limitMod = new PartsList(this.limit.mod);
        const poolMod = new PartsList(this.pool.mod);

        const limit = this.actor.getLimit(this.data.limitSelection);
        if (limit) limitMod.addUniquePart(limit.label, limit.value);
        if (limit && this.actor._isMatrixAttribute(this.data.limitSelection)) this.actor._addMatrixParts(poolMod, true);
    }
}