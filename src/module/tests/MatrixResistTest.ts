import { Helpers } from '../helpers';
import { Translation } from '../utils/strings';
import { MatrixTestDataFlow } from './flows/MatrixTestDataFlow';
import { SuccessTest, TestOptions } from './SuccessTest';
import { SR5Actor } from '../actor/SR5Actor';
import { SR5Item } from '../item/SR5Item';
import { MatrixDefenseTestData } from './MatrixDefenseTest';
import { ResistTestData, ResistTestDataFlow } from './flows/ResistTestDataFlow';
import { BiofeedbackResistTest } from './BiofeedbackResistTest';
import { MinimalActionType } from '../types/item/Action';

// matrix resist data is a mix of a bunch of data
// maybe we make a "Resist" base Test class?
export type MatrixResistTestData = ResistTestData<MatrixDefenseTestData> & {
    // The persona uuid. This would be the user main persona icon, not necessarily the device.
    personaUuid: string | undefined
    // The icon uuid. This would be the actual mark placement target. Can be a device, a persona device, a host or actor.
    iconUuid: string | undefined
}

/**
 * Handle Matrix Damage Resist as defined on SR5#228.
 * 
 * These test flows exist:
 * - Brute Force and other Matrix Attacks will trigger this test through their Opposed or Defense test.
 */
export class MatrixResistTest extends SuccessTest<MatrixResistTestData> {
    // icon of the target
    declare icon: SR5Actor | SR5Item;
    // The target icon, if it's representing a device.
    declare device: SR5Item;
    // The target icon, if it's representing a persona.
    declare persona: SR5Actor;

    override _prepareData(data: MatrixResistTestData, options: any): any {
        data = super._prepareData(data, options);
        if (data.following) {
            data = MatrixTestDataFlow._prepareFollowingData(data);
        } else {
            data = MatrixTestDataFlow._prepareDataResist(data);
        }
        data = ResistTestDataFlow._prepareData(data);

        return data;
    }

    /**
     * This test type can't be extended.
     */
    override get canBeExtended() {
        return false;
    }

    override get _chatMessageTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/chat/matrix-defense-test-message.hbs';
    }

    override get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/matrix-resist-test-dialog.hbs';
    }

    override get successLabel(): Translation {
        return 'SR5.TestResults.ResistedAllDamage';
    }
    override get failureLabel(): Translation {
        return 'SR5.TestResults.ResistedSomeDamage';
    }

    override get _resistTestClass(): any {
        // check if we can even take biofeedback damage
        const biofeedback = (this.persona?.canTakeBiofeedbackDamage ?? false);
        if (biofeedback && this.data.modifiedDamage.biofeedback !== 'none'
                && this.data.iconUuid === this.persona.uuid && this.data.modifiedDamage.value > 0) {
            return BiofeedbackResistTest;
        }
        return super._resistTestClass;
    }

    /**
     * After the test completes, check to see if a BiofeedbackResistTest is needed
     */
    override async afterTestComplete(): Promise<void> {
        await super.afterTestComplete();

        const testCls = this._resistTestClass;
        if (testCls) {
            // create a resist class if we fail to resist biofeedback
            if (this.data && this.data.messageUuid) {
                const data = await testCls._getResistActionTestData(this.data, this.persona, this.data.messageUuid)
                const test = new testCls(data, {actor: this.persona}, this.data.options);
                await test.execute();
            }
        }
    }

    static override _getDefaultTestAction(): Partial<MinimalActionType> {
        return {
            'attribute': 'rating',
            'attribute2': 'firewall'
        }
    }

    override get testModifiers(): Shadowrun.ModifierTypes[] {
        // override to remove wounds and global modifiers
        return [];
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['resist', 'resist_matrix']
    }

    /**
     * Reduce the damage dealt by the number of hits we got
     */
    override async processResults() {
        await super.processResults();

        const {modified} = Helpers.reduceDamageByHits(this.data.incomingDamage, this.hits.value, 'SR5.Tests.MatrixResistTest');
        this.data.modifiedDamage = modified;
    }

    override calculateBaseValues() {
        super.calculateBaseValues();
        ResistTestDataFlow.calculateBaseValues(this.data)
    }

    /**
     * Prepare any ResistTest from given test data. This should come from a MatrixDefenseTest
     *
     */
    static override async _getResistActionTestData(opposedData: MatrixDefenseTestData, document: SR5Actor|SR5Item, previousMessageId: string): Promise<MatrixResistTestData | undefined> {
        if (!opposedData.against?.opposed.resist) {
            console.error(`Shadowrun 5e | Supplied test data doesn't contain a resist action`, opposedData, this);
            return;
        }
        if (!document) {
            console.error(`Shadowrun 5e | Can't resolve resist test values due to missing actor`, this);
            return;
        }

        // get most of our resist data from the ResistTestDataFlow test data
        const data = {
            ...ResistTestDataFlow._getResistTestData(opposedData, 'SR5.Tests.MatrixResistTest', previousMessageId),
            // add icon and persona for the matrix handling
            iconUuid: opposedData.iconUuid,
            personaUuid: opposedData.personaUuid,
        };

        const action = await ResistTestDataFlow._getResistActionData(this, opposedData, 'MatrixResistTest');

        return this._prepareActionTestData(action, document, data) as MatrixResistTestData;
    }

    override async populateDocuments() {
        await super.populateDocuments();
        await MatrixTestDataFlow.populateResistDocuments(this);
    }

    /**
     * Execute actions triggered by a tests chat message.
     *
     * This can be used to trigger resist tests.
     */
    static override async executeMessageAction(againstData: MatrixDefenseTestData, messageId: string, options: TestOptions) {
        // Determine documents to roll test with.
        const documents = await Helpers.getMatrixTestTargetDocuments(againstData)
        await ResistTestDataFlow.executeMessageAction(this, againstData, messageId, documents, options);
    }
}
