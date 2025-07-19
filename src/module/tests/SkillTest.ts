import { DataDefaults } from '../data/DataDefaults';
import { PartsList } from '../parts/PartsList';
import { SuccessTest, SuccessTestData, TestOptions } from './SuccessTest';
import { Translation } from '../utils/strings';

export interface SkillTestData extends SuccessTestData {
    attribute: string
    limitSelection: string
}


/**
 * Skill tests allow users to change the connected attribute and limit.
 * 
 * Rule wise a skill test doesn't alter a default success test.
 */
export class SkillTest extends SuccessTest<SkillTestData> {
    // temporary selection information.
    lastUsedAttribute: string;
    lastUsedLimit: string;

    constructor(data, documents, options) {
        super(data, documents, options);

        this.lastUsedAttribute = this.data.attribute;
        this.lastUsedLimit = this.data.limitSelection;
    }

    /**
     * Allow users to alter detailed skill values.
     */
    override get _dialogTemplate() {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/skill-test-dialog.hbs';
    }

    /**
     * Show skill label as title instead of the generic success test label.
     */
    override get title() {
        if (!this.actor) return super.title;
        return `${game.i18n.localize(this.actor.getSkillLabel(this.data.action.skill) as Translation)} ${game.i18n.localize('SR5.Test')}`;
    }

    /**
     * A SkillTest has the need to store attribute and limit selections
     */
    override _prepareData(data: any, options: TestOptions) {
        data = super._prepareData(data, options);

        data.action = data.action || DataDefaults.createData('action_roll');

        // Preselect based on action.
        data.attribute = data.action.attribute;
        data.limitSelection = data.action.limit.attribute;

        return data;
    }

    /**
     * Skill test provides a selection for attribute and limit during TestDialog.
     */
    override prepareBaseValues() {
        super.prepareBaseValues();
        this.prepareAttributeSelection();
        this.prepareLimitSelection();
    }

    /**
     * Change out previous attribute with new selection.
     */
    prepareAttributeSelection() {
        if (!this.actor) return;

        // Remove last used attribute and its modifiers and replace with new selection.
        const useSelection = this.data.attribute !== this.data.action.attribute;
        const selectedAttribute = useSelection ? this.data.attribute : this.data.action.attribute;
        const usedAttribute = this.actor.getAttribute(selectedAttribute);
        const lastUsedAttribute = this.actor.getAttribute(this.lastUsedAttribute);

        if (!usedAttribute || !lastUsedAttribute) return; 


        const pool = new PartsList<number>(this.pool.mod);

        // Replace previous attribute with new one, without changing other modifiers
        pool.removePart(lastUsedAttribute.label);
        this.actor._removeMatrixParts(pool);
        pool.addPart(usedAttribute.label, usedAttribute.value);

        if (this.actor._isMatrixAttribute(selectedAttribute)) this.actor._addMatrixParts(pool, true);

        this.lastUsedAttribute = selectedAttribute;
    }

    /**
     * Change out previous limit with new selection.
     */
    prepareLimitSelection() {
        if (!this.actor) return;

        // Remove last used limit and its modifiers and replace with new selection.
        const useSelection = this.data.limitSelection !== this.data.action.limit.attribute;
        const selectedLimit = useSelection ? this.data.limitSelection : this.data.action.limit.attribute!;
        const usedLimit = this.actor.getLimit(selectedLimit);
        const lastUsedLimit = this.actor.getLimit(this.lastUsedLimit);

        if (!usedLimit || !lastUsedLimit) return;

        const limit = new PartsList<number>(this.limit.mod);
        const pool = new PartsList<number>(this.pool.mod);

        // Replace previous limit with new one, without changing other modifiers.
        limit.removePart(lastUsedLimit.label);
        limit.addPart(usedLimit.label, usedLimit.value);
        this.actor._removeMatrixParts(pool);

        if (limit && this.actor._isMatrixAttribute(selectedLimit)) this.actor._addMatrixParts(pool, true);

        this.lastUsedLimit = selectedLimit;
    }
}