import {SuccessTest, SuccessTestData} from "./SuccessTest";
import {SpellCastingTest, SpellCastingTestData} from "./SpellCastingTest";
import {DrainRules} from "../rules/DrainRules";
import {Helpers} from "../helpers";
import DamageData = Shadowrun.DamageData;
import MinimalActionData = Shadowrun.MinimalActionData;
import ModifierTypes = Shadowrun.ModifierTypes;
import GenericValueField = Shadowrun.GenericValueField;

export interface DrainTestData extends SuccessTestData {
    incomingDrain: DamageData
    modifiedDrain: DamageData

    against: SpellCastingTestData
}


/**
 * Implement a Drain Test as is defined in SR5#282 'Step 6 - Resist Drain'
 * 
 * Drain defines it's incoming drain and modifies it to it's modified drain,
 * both of which the user can apply.
 */
export class DrainTest extends SuccessTest {
    override data: DrainTestData

    override _prepareData(data, options): any {
        data = super._prepareData(data, options);

        data.against = data.against || new SpellCastingTest({}, {}, options).data;

        data.incomingDrain = foundry.utils.duplicate(data.against.drainDamage);
        data.modifiedDrain = foundry.utils.duplicate(data.incomingDrain);

        return data;
    }

    override get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/drain-test-dialog.html';
    }

    override get _chatMessageTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/rolls/drain-test-message.html';
    }

    static override _getDefaultTestAction(): Partial<MinimalActionData> {
        return {
            'attribute2': 'willpower'
        };
    }

    /**
     * This test type can't be extended.
     */
    override get canBeExtended() {
        return false;
    }

    override get testModifiers(): ModifierTypes[] {
        return ['global', 'drain']
    }

    static override async _getDocumentTestAction(item, actor) {
        const documentAction = await super._getDocumentTestAction(item, actor);

        if (!actor.isAwakened) {
            console.error(`Shadowrun 5e | A ${this.name} expected an awakened actor but got this`, actor);
            return documentAction;
        }

        // Get magic school attribute.
        const attribute = actor.system.magic.attribute;
        foundry.utils.mergeObject(documentAction, {attribute});

        // Return the school attribute based on actor configuration.
        return documentAction;
    }

    /**
     * Re-calculate incomingDrain in case of user input
     */
    override calculateBaseValues() {
        super.calculateBaseValues();

        Helpers.calcValue<typeof this.data.incomingDrain.type.base>(this.data.incomingDrain.type as GenericValueField);

        // Copy to get all values changed by user (override) but also remove all.
        this.data.modifiedDrain = foundry.utils.duplicate(this.data.incomingDrain);
        this.data.modifiedDrain.base = Helpers.calcTotal(this.data.incomingDrain, {min: 0});
        delete this.data.modifiedDrain.override;
    }

    /**
     * A drain test is successful whenever it has more hits than drain damage
     */
    override get success(): boolean {
        return this.data.modifiedDrain.value <= 0;
    }

    override get successLabel(): string {
        return 'SR5.ResistedAllDamage';
    }

    override get failureLabel(): string {
        return 'SR5.ResistedSomeDamage'
    }

    override async processResults() {
        // Don't use incomingDrain as it might have a user value override applied.
        this.data.modifiedDrain = DrainRules.modifyDrainDamage(this.data.modifiedDrain, this.hits.value);

        await super.processResults();
    }
}