import {SuccessTest, SuccessTestData} from "./SuccessTest";
import {SpellCastingTest, SpellCastingTestData} from "./SpellCastingTest";
import {DefaultValues} from "../data/DataDefaults";
import {DrainRules} from "../rules/DrainRules";
import DamageData = Shadowrun.DamageData;
import MinimalActionData = Shadowrun.MinimalActionData;
import {Helpers} from "../helpers";

export interface DrainTestData extends SuccessTestData {
    incomingDrain: DamageData
    modifiedDrain: DamageData

    against: SpellCastingTestData
}


export class DrainTest extends SuccessTest {
    data: DrainTestData

    _prepareData(data, options): any {
        data = super._prepareData(data, options);

        data.against = data.against || new SpellCastingTest({}, {}, options).data;

        data.incomingDrain = foundry.utils.duplicate(data.against.drainDamage);
        data.modifiedDrain = foundry.utils.duplicate(data.incomingDrain);

        return data;
    }

    get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/drain-test-dialog.html';
    }

    get _chatMessageTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/rolls/drain-test-message.html';
    }

    static _getDefaultTestAction(): Partial<MinimalActionData> {
        return {
            'attribute2': 'willpower'
        };
    }

    /**
     * This test type can't be extended.
     */
    get canBeExtended() {
        return false;
    }

    get testModifiers() {
        return ['global', 'drain']
    }

    static async _getDocumentTestAction(item, actor) {
        const documentAction = await super._getDocumentTestAction(item, actor);

        if (!actor.isAwakened) {
            console.error(`Shadowrun 5e | A ${this.name} expected an awakened actor but got this`, actor);
            return documentAction;
        }

        // Get magic school attribute.
        const attribute = actor.data.data.magic.attribute;
        foundry.utils.mergeObject(documentAction, {attribute});

        // Return the school attribute based on actor configuration.
        return documentAction;
    }

    /**
     * Re-calculate incomingDrain in case of user input
     */
    calculateBaseValues() {
        super.calculateBaseValues();

        // Avoid using a user defined value override.
        this.data.modifiedDrain.base = Helpers.calcTotal(this.data.incomingDrain, {min: 0});
    }

    /**
     * A drain test is successful whenever it has more hits than drain damage
     */
    get success(): boolean {
        return this.data.modifiedDrain.value <= 0;
    }

    get successLabel(): string {
        return 'SR5.ResistedAllDamage';
    }

    get failureLabel(): string {
        return 'SR5.ResistedSomeDamage'
    }

    async processResults() {
        // Don't use incomingDrain as it might have a user value override applied.
        this.data.modifiedDrain = DrainRules.modifyDrainDamage(this.data.modifiedDrain, this.hits.value);

        await super.processResults();
    }
}