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
    lastUsedAttribute: string;

    constructor(data, documents, options) {
        super(data, documents, options);

        this.lastUsedAttribute = this.data.attribute;
    }

    get _dialogTemplate() {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/skill-test-dialog.html';
    }

    /**
     * Show skill label as title instead of the generic success test label.
     */
    get title() {
        if (!this.actor) return super.title;
        return `${game.i18n.localize(this.actor.getSkillLabel(this.data.action.skill))} ${game.i18n.localize('SR5.Test')}`;
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
     * Only add selected attribute values to the pool
     * 
     */
    prepareAttributeSelection() {
        if (!this.actor) return;

        // Remove last used attribute and it's modifiers and replace with new selection.
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

        this.data.limit.mod = [];
        const limitMod = new PartsList(this.limit.mod);
        const poolMod = new PartsList(this.pool.mod);

        const limit = this.actor.getLimit(this.data.limitSelection);
        if (limit) limitMod.addUniquePart(limit.label, limit.value);
        if (limit && this.actor._isMatrixAttribute(this.data.limitSelection)) this.actor._addMatrixParts(poolMod, true);
    }
}