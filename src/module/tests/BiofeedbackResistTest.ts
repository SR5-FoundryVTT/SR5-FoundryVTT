import { Helpers } from '../helpers';
import { Translation } from '../utils/strings';
import { SuccessTest, TestOptions } from './SuccessTest';
import { SR5Actor } from '../actor/SR5Actor';
import { SR5Item } from '../item/SR5Item';
import { ResistTestData, ResistTestDataFlow } from './flows/ResistTestDataFlow';
import { MatrixTestDataFlow } from './flows/MatrixTestDataFlow';
import { DataDefaults } from '../data/DataDefaults';
import ModifierTypes = Shadowrun.ModifierTypes;
import { MinimalActionType } from '../types/item/Action';

// biofeedback is often caused by the results of another ResistTest
export type BiofeedbackResistTestData = ResistTestData<ResistTestData> & {
    // The persona uuid. This would be the user main persona icon, not necessarily the device.
    personaUuid: string | undefined
    // The icon uuid. This would be the actual mark placement target. Can be a device, a persona device, a host or actor.
    iconUuid: string | undefined
}

/**
 * Handle Biofeedback Resist as defined on SR5 pg245
 *
 * Biofeedback is often used after a matrix damage resist or when a rigger is jumped in and the vehicle takes damage
 * - When feeding damage to this test, set the damage to be Matrix if it should be decided by the state of the actor
 * - if you want specifically stun or physical, pass in the data wit that type
 */
export class BiofeedbackResistTest extends SuccessTest<BiofeedbackResistTestData> {
    // icon of the target
    declare icon: SR5Actor | SR5Item;
    // The target icon, if it's representing a device.
    declare device: SR5Item;
    // The target icon, if it's representing a persona.
    declare persona: SR5Actor;

    override _prepareData(data: BiofeedbackResistTestData, options: any): any {
        data = super._prepareData(data, options);
        data = ResistTestDataFlow._prepareData(data);

        return data;
    }

    /**
     * Get the damage type for biofeedback based on if the target is using hotsim or coldsim
     */
    _getBiofeedbackDamageType(): Item.SystemOfType<'action'>['action']['damage']['type']['base'] {
        const actor = this.actor ?? this.persona ?? this.device?.actorOwner ?? this.device?.actor;
        if (!actor) return 'stun'
        return actor.isUsingHotSim ? 'physical': 'stun';
    }

    /**
     * This test type can't be extended.
     */
    override get canBeExtended() {
        return false;
    }

    override get _chatMessageTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/rolls/defense-test-message.html';
    }

    override get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/biofeedback-resist-test-dialog.hbs';
    }

    override get successLabel(): Translation {
        return 'SR5.TestResults.ResistedAllDamage';
    }
    override get failureLabel(): Translation {
        return 'SR5.TestResults.ResistedSomeDamage';
    }

    // SR5 pg 229, resisted with willpower + firewall
    static override _getDefaultTestAction(): Partial<MinimalActionType> {
        return {
            'attribute': 'willpower',
            'attribute2': 'firewall'
        }
    }

    // don't add 'matrix' category because we don't want things like noise
    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['resist', 'resist_biofeedback']
    }

    // override to remove wounds and global modifiers
    override get testModifiers(): ModifierTypes[] {
        return [];
    }

    override async processResults() {
        await super.processResults();

        const {modified} = Helpers.reduceDamageByHits(this.data.incomingDamage, this.hits.value, 'SR5.Tests.BiofeedbackResistTest');
        this.data.modifiedDamage = modified;
    }

    override calculateBaseValues() {
        super.calculateBaseValues();
        ResistTestDataFlow.calculateBaseValues(this.data)
    }

    // do this in the validate phase so we have documents populated
    override validateBaseValues() {
        super.validateBaseValues();

        // if the damages are set to matrix or empty, use the biofeedback damage type for the actor
        if (this.data.incomingDamage.type.value === 'matrix' || this.data.incomingDamage.type.value === '') {
            this.data.incomingDamage.type.value = this._getBiofeedbackDamageType();
        }
        if (this.data.modifiedDamage.type.value === 'matrix' || this.data.modifiedDamage.type.value === '') {
            this.data.modifiedDamage.type.value = this._getBiofeedbackDamageType();
        }
    }

    override async populateDocuments(): Promise<void> {
        await super.populateDocuments();
        await MatrixTestDataFlow.populateResistDocuments(this);
    }

    /**
     * Prepare any ResistTest from given test data. This should come from a BiofeedbackDefenseTest
     *
     */
    static override async _getResistActionTestData(opposedData: ResistTestData, document: SR5Actor|SR5Item, previousMessageId: string): Promise<BiofeedbackResistTestData | undefined> {
        if (!document) {
            console.error(`Shadowrun 5e | Can't resolve resist test values due to missing actor`, this);
            return;
        }

        // get the amount of damage taken after the roll, and divide that by 2 for the amount of bio feedback we will take
        const newData = foundry.utils.duplicate(opposedData) as ResistTestData;
        const resistTotal = Math.ceil(newData.modifiedDamage.value/2);
        newData.modifiedDamage = DataDefaults.createData('damage', {
            base: resistTotal,
            value: resistTotal,
            type: {
                value: 'matrix',
                base: 'matrix'
            }
        });

        // get most of our resist data from the ResistTestDataFlow test data
        const data = ResistTestDataFlow._getResistTestData(newData, 'SR5.Tests.BiofeedbackResistTest', previousMessageId);

        const action = await ResistTestDataFlow._getResistAgainActionData(this, newData, 'BiofeedbackResistTest');

        return this._prepareActionTestData(action, document, data) as BiofeedbackResistTestData;
    }

    /**
     * Execute actions triggered by a tests chat message.
     *
     * This can be used to trigger resist tests.
     */
    static override async executeMessageAction(againstData: ResistTestData, messageId: string, options: TestOptions) {
        // Determine documents to roll test with.
        const documents = againstData.action.test === 'MatrixResistTest'
                                            ? await Helpers.getMatrixTestTargetDocuments(againstData as any)
                                            : await Helpers.getTestTargetDocuments(againstData)
        await ResistTestDataFlow.executeMessageAction(this, againstData, messageId, documents, options);
    }
}
