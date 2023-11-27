import { PartsList } from '../parts/PartsList';
import { SuccessTest, SuccessTestData, TestOptions } from './SuccessTest';


export interface SkillTestData extends SuccessTestData {
    attribute: string
    limitSelection: string
    sepcialization: boolean
}


/**
 * Skill tests allow users to change the connected attribute and limit.
 * 
 * Rule wise a skill test doesn't alter a default success test.
 */
export class SkillTest extends SuccessTest {
    override data: SkillTestData
    // temporary selection information.
    lastUsedAttribute: string;
    lastUsedLimit: string;

    constructor(data, documents, options) {
        super(data, documents, options);

        this.lastUsedAttribute = this.data.attribute;
        this.lastUsedLimit = this.data.limitSelection;
    }

    override get _dialogTemplate() {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/skill-test-dialog.html';
    }

    /**
     * Show skill label as title instead of the generic success test label.
     */
    override get title() {
        if (!this.actor) return super.title;
        return `${game.i18n.localize(this.actor.getSkillLabel(this.data.action.skill))} ${game.i18n.localize('SR5.Test')}`;
    }

    override _prepareData(data: any, options: TestOptions) {
        data = super._prepareData(data, options);

        // Preselect based on action.
        data.attribute = data.action.attribute;
        data.limitSelection = data.action.limit.attribute;

        return data;
    }

    override async prepareDocumentData() {
        await super.prepareDocumentData();
    }

    override prepareTestSelectionData() {
        this.prepareAttributeSelection();
        this.prepareLimitSelection();
    }

    /**
     * Only add selected attribute values to the pool
     * 
     */
    prepareAttributeSelection() {
        if (!this.actor) return;

        // Remove last used attribute and its modifiers and replace with new selection.
        const useSelection = this.data.attribute !== this.data.action.attribute;
        const usedAttribute = useSelection ? this.data.attribute : this.data.action.attribute;
        const attribute = this.actor.getAttribute(usedAttribute);
        const lastUsedAttribute = this.actor.getAttribute(this.lastUsedAttribute);

        if (!attribute || !lastUsedAttribute) return console.error('Shadowrun 5e | An attribute was used that does not exist on', this.actor, attribute, lastUsedAttribute);


        const pool = new PartsList(this.pool.mod);

        // Remove both original action and .
        pool.removePart(lastUsedAttribute.label);
        this.actor._removeMatrixParts(pool);

        // Add pool values related to either selected or action attribute
        pool.addPart(attribute.label, attribute.value);
        if (this.actor._isMatrixAttribute(usedAttribute)) this.actor._addMatrixParts(pool, true);

        // Save this attribtue selection as last used for next selection cycle
        this.lastUsedAttribute = usedAttribute;
    }

    /**
     * Rebuild limit after limit selection.
     */
    prepareLimitSelection() {
        if (!this.actor) return;

        // Remove last used limit and its modifiers and replace with new selection.
        const useSelection = this.data.limitSelection !== this.data.action.limit.attribute;
        const selectedLimit = useSelection ? this.data.limitSelection : this.data.action.limit.attribute;
        const usedLimit = this.actor.getLimit(selectedLimit);
        const lastUsedLimit = this.actor.getLimit(this.lastUsedLimit);

        if (!usedLimit || !lastUsedLimit) return console.error('Shadowrun 5e | A limit was used that does not exist on', this.actor, usedLimit, lastUsedLimit);

        const limit = new PartsList(this.limit.mod);
        const pool = new PartsList(this.pool.mod);

        // Replace previous limit with new one, without changing other modifiers.
        limit.removePart(lastUsedLimit.label);
        limit.addPart(usedLimit.label, usedLimit.value);
        this.actor._removeMatrixParts(pool);

        if (limit && this.actor._isMatrixAttribute(this.data.limitSelection)) this.actor._addMatrixParts(pool, true);

        // this.data.limit.mod = [];
        // const limitMod = new PartsList(this.limit.mod);
        // const poolMod = new PartsList(this.pool.mod);

        // const limit = this.actor.getLimit(this.data.limitSelection);
        // if (limit) limitMod.addUniquePart(limit.label, limit.value);
        // if (limit && this.actor._isMatrixAttribute(this.data.limitSelection)) this.actor._addMatrixParts(poolMod, true);
    }
}