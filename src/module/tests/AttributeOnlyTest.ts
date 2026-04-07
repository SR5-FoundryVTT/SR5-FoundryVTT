import {SuccessTest, SuccessTestData} from "./SuccessTest";
import {ModifiableValue} from "../mods/ModifiableValue";

export interface AttributeOnlyTestData extends SuccessTestData {
    // Selection for attributes used. attribute1 will be preselected.
    attribute1: Shadowrun.ActorAttribute
    attribute2: Shadowrun.ActorAttribute
}


/**
 * Handle custom attribute-only tests as defined in SR5#152.
 *
 * Attribute-Only Tests don't alter default SuccessTests rule wise but only Foundry behavior wise.
 * Main difference is the user ability to change attributes before rolling dice.
 */
export class AttributeOnlyTest extends SuccessTest {
    declare data: AttributeOnlyTestData;

    override get _dialogTemplate() {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/attribute-only-test-dialog.hbs';
    }
    override _prepareData(data, options): any {
        data = super._prepareData(data, options);

        // Preset attribute selection with action attributes.
        data.attribute1 = data.action.attribute;
        data.attribute2 = data.action.attribute2;

        return data;
    }

    override prepareBaseValues() {
        this.prepareAttributeSelection();
        super.prepareBaseValues();
    }

    prepareAttributeSelection() {
        if (!this.actor) return;

        const previousAttribute1 = this.data.action.attribute;
        const previousAttribute2 = this.data.action.attribute2;

        // Only alter pool parts when users changed their attribute selection.
        if (previousAttribute1 === this.data.attribute1 && previousAttribute2 === this.data.attribute2) return;

        const pool = new ModifiableValue(this.pool);

        const oldAttribute1 = this.actor.getAttribute(previousAttribute1);
        const oldAttribute2 = this.actor.getAttribute(previousAttribute2);

        // Remove previous base attribute contributions while preserving all other modifiers and their applied state.
        if (oldAttribute1) pool.remove(oldAttribute1.label);
        if (oldAttribute2 && oldAttribute2.label !== oldAttribute1?.label) pool.remove(oldAttribute2.label);

        const attribute1 = this.actor.getAttribute(this.data.attribute1);
        const attribute2 = this.actor.getAttribute(this.data.attribute2);

        // Rebuild base pool values first. Other modifiers will be added within prepareBaseValues.
        if (attribute1) pool.addBase(attribute1.label, attribute1.value);
        if (attribute2) pool.addBase(attribute2.label, attribute2.value);

        // Rebuild attribute specific modifiers previously added in TestCreate#_prepareTestDataWithAction.
        this.data.action.attribute = this.data.attribute1;
        this.data.action.attribute2 = this.data.attribute2;
    }
}
