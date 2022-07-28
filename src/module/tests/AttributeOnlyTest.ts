import {SuccessTest, SuccessTestData} from "./SuccessTest";
import {PartsList} from "../parts/PartsList";

export interface AttributeOnlyTestData extends SuccessTestData {
    // Selection for attributes used. attribute1 will be preselected.
    attribute1: string
    attribute2: string
}


/**
 * Handle custom attribute-only tests as defined in SR5#152.
 *
 * Attribute-Only Tests don't alter default SuccessTests rule wise but only Foundry behaviour wise.
 * Main difference is the user ability to change attributes before rolling dice.
 */
export class AttributeOnlyTest extends SuccessTest {
    data: AttributeOnlyTestData

    get _dialogTemplate() {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/attribute-only-test-dialog.html';
    }
    _prepareData(data, options): any {
        data = super._prepareData(data, options);

        // Preset attribute selection with action attributes.
        data.attribute1 = data.action.attribute;
        data.attribute2 = data.action.attribute2;

        return data;
    }

    prepareBaseValues() {
        this.prepareAttributeSelection();

        super.prepareBaseValues();
    }

    prepareAttributeSelection() {
        if (!this.actor) return;

        // Clear everything. This way we don't have to track previous / current attributes and remove accordingly.
        this.data.pool.mod = [];
        const pool = new PartsList(this.pool.mod);

        const attribute1 = this.actor.getAttribute(this.data.attribute1);
        const attribute2 = this.actor.getAttribute(this.data.attribute2);

        // Re-build base pool values first. Other modifiers will be added within prepareBaseValues
        if (attribute1) pool.addPart(attribute1.label, attribute1.value);
        if (attribute2) pool.addPart(attribute2.label, attribute2.value);

        // Rebuild attribute specific modifiers previously added in TestCreate#_prepareTestDataWithAction
        if (attribute1 && this.actor._isMatrixAttribute(this.data.attribute1)) this.actor._addMatrixParts(pool, true);
        if (attribute2 && this.actor._isMatrixAttribute(this.data.attribute2)) this.actor._addMatrixParts(pool, true);
    }
}