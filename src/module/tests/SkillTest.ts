import { DataDefaults } from '../data/DataDefaults';
import { ModifiableValue } from '../mods/ModifiableValue';
import { SuccessTest, SuccessTestData, TestDocuments, TestOptions } from './SuccessTest';
import { DeepPartial } from "fvtt-types/utils";
import { TestCreator } from './TestCreator';
import { SkillNamingFlow } from '../flows/SkillNamingFlow';

export interface SkillTestData extends SuccessTestData {
    attribute: SuccessTestData['action']['attribute'];
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

    constructor(data: DeepPartial<SkillTestData>, documents?: TestDocuments, options?: Partial<TestOptions>) {
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

        const skillLabel = this.actor.getSkill(this.data.action.skill)?.label ?? SkillNamingFlow.localizeSkillName(this.data.action.skill);
        return `${skillLabel} ${game.i18n.localize('SR5.Test')}`;
    }

    /**
     * A SkillTest has the need to store attribute and limit selections
     */
    override _prepareData(data: DeepPartial<SkillTestData>, options: Partial<TestOptions>): SkillTestData {
        const prepared = super._prepareData(data, options) as SkillTestData;

        prepared.action ||= DataDefaults.createData('action_roll');

        // Preselect based on action.
        prepared.attribute = prepared.action.attribute;
        prepared.limitSelection = prepared.action.limit.attribute;

        return prepared;
    }

    /**
     * Skill test provides a selection for attribute and limit during TestDialog.
     */
    override prepareBaseValues() {
        this.prepareAttributeSelection();
        this.prepareLimitSelection();

        super.prepareBaseValues();
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

        if (!usedAttribute || !lastUsedAttribute || usedAttribute.label === lastUsedAttribute.label) return;

        const pool = new ModifiableValue(this.pool);

        // Replace previous attribute with new one, without changing other modifiers
        pool.remove(lastUsedAttribute.label);
        pool.addBase(usedAttribute.label, usedAttribute.value);
        TestCreator.addCodeTermTrace(this.data, usedAttribute);

        this.lastUsedAttribute = selectedAttribute;
        this.data.action.attribute = selectedAttribute;
    }

    /**
     * Change out previous limit with new selection.
     */
    prepareLimitSelection() {
        if (!this.actor) return;

        // Remove last used limit and its modifiers and replace with new selection.
        const useSelection = this.data.limitSelection !== this.data.action.limit.attribute;
        const selectedLimit = useSelection ? this.data.limitSelection : this.data.action.limit.attribute;
        const usedLimit = this.actor.getLimit(selectedLimit);
        const lastUsedLimit = this.actor.getLimit(this.lastUsedLimit);

        if (!usedLimit || !lastUsedLimit || usedLimit.label === lastUsedLimit.label) return;

        const limit = new ModifiableValue(this.limit);

        // Replace previous limit with new one, without changing other modifiers.
        limit.remove(lastUsedLimit.label);
        limit.addBase(usedLimit.label, usedLimit.value);
        TestCreator.addCodeTermTrace(this.data, usedLimit);

        this.lastUsedLimit = selectedLimit;
        this.data.action.limit.attribute = selectedLimit as Shadowrun.ActorAttribute;
    }
}
