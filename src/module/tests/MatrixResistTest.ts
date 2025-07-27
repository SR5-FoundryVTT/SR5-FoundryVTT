import { DataDefaults } from '../data/DataDefaults';
import { Helpers } from '../helpers';
import { Translation } from '../utils/strings';
import { MatrixTestDataFlow } from './flows/MatrixTestDataFlow';
import { SuccessTest, SuccessTestData, TestOptions } from './SuccessTest';
import { SR5Actor } from '../actor/SR5Actor';
import { SR5Item } from '../item/SR5Item';
import { TestCreator } from './TestCreator';
import { MatrixDefenseTestData } from './MatrixDefenseTest';
import DamageData = Shadowrun.DamageData;

// matrix resist data is a mix of a whole bunch of other data
// maybe we make a "Resist" base Test class?
export type MatrixResistTestData = SuccessTestData & {
    // The persona uuid. This would be the user main persona icon, not necessarily the device.
    personaUuid: string | undefined
    // The icon uuid. This would be the actual mark placement target. Can be a device, a persona device, a host or actor.
    iconUuid: string | undefined
    // Damage value of the attack
    incomingDamage: DamageData
    // Modified damage value of the attack after this defense (success or failure)
    modifiedDamage: DamageData
    // any following hits
    following: any
}

/**
 * Handle Matrix Damage Resist as defined on SR5#228.
 * 
 * These test flows exist:
 * - Brute Force/Hack on The Fly: Both will trigger this test using their Opposed variant.
 */
export class MatrixResistTest extends SuccessTest<MatrixResistTestData> {
    // icon of the target
    icon: Shadowrun.NetworkDevice;
    // The target icon, if it's representing a device.
    device: SR5Item;
    // The target icon, if it's representing a persona.
    persona: SR5Actor;

    override _prepareData(data: MatrixResistTestData, options: any): any {
        data = super._prepareData(data, options);

        // Is this test part of a followup test chain? defense => resist
        if (data.following) {
            data = MatrixTestDataFlow._prepareFollowingData(data);
            data.incomingDamage = foundry.utils.duplicate(data.following.modifiedDamage || DataDefaults.damageData({type: {base: 'matrix', value: 'matrix'}}));
            data.modifiedDamage = foundry.utils.duplicate(data.incomingDamage);
        // This test is part of either a standalone resist or created with its own data (i.e. edge reroll).
        } else {
            // prepare the data as opposed data since we hold data similar to an opposed matrix action
            data = MatrixTestDataFlow._prepareDataResist(data);
            data.incomingDamage = data.incomingDamage ?? DataDefaults.damageData();
            data.modifiedDamage = foundry.utils.duplicate(data.incomingDamage);
        }

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
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/matrix-resist-test-dialog.html';
    }

    override get successLabel(): Translation {
        return 'SR5.TestResults.ResistedAllDamage';
    }
    override get failureLabel(): Translation {
        return 'SR5.TestResults.ResistedSomeDamage';
    }

    static override _getDefaultTestAction(): Partial<Shadowrun.MinimalActionData> {
        return {
            'attribute': 'rating',
            'attribute2': 'firewall'
        }
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['resist_matrix']
    }

    override async processResults() {
        await super.processResults();

        const {modified} = Helpers.reduceDamageByHits(this.data.incomingDamage, this.hits.value, 'SR5.MatrixDamageResistTest');
        this.data.modifiedDamage = modified;
    }

    override calculateBaseValues() {
        super.calculateBaseValues();

        // Calculate damage values in case of user dialog interaction.
        Helpers.calcTotal(this.data.incomingDamage, {min: 0});

        // Remove user override and resulting incoming damage as base.
        this.data.modifiedDamage = foundry.utils.duplicate(this.data.incomingDamage);
        this.data.modifiedDamage.base = this.data.incomingDamage.value;
        this.data.modifiedDamage.mod = [];
        delete this.data.modifiedDamage.override;

        Helpers.calcTotal(this.data.modifiedDamage);
    }

    /**
     * Prepare any OpposedTest from given test data. This test data should origin from a original success test, that is to be opposed.
     *
     * Typically this would be as part of a test => message => oppose flow
     *
     * @param opposedData
     * @param document The actor used to oppose this original test with.
     * @param previousMessageId The chat message the original test is stored within.
     * @returns TestData for the opposed test.
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

        // Prepare testing data.
        const data: MatrixResistTestData = {
            title: opposedData.against.opposed.resist.test || undefined,
            type: 'MatrixResistTest', // TODO figure out a way to not require this to have the tests work

            previousMessageId,

            pool: DataDefaults.valueData({label: 'SR5.DicePool'}),
            limit: DataDefaults.valueData({label: 'SR5.Limit'}),
            threshold: DataDefaults.valueData({label: 'SR5.Threshold'}),
            //@ts-expect-error SuccessTest.prepareData is adding missing values, however these aren't actually optional.
            values: {},

            modifiers: DataDefaults.valueData({label: 'SR5.Labels.Action.Modifiers'}),
            incomingDamage: opposedData.incomingDamage,
            modifiedDamage: opposedData.modifiedDamage,
            iconUuid: opposedData.iconUuid,
            personaUuid: opposedData.personaUuid,

            sourceItemUuid: opposedData.against.sourceItemUuid,
            following: opposedData,
        }

        // The original action doesn't contain a complete set of ActionData.
        // Therefore we must create an empty dummy action.
        let action = DataDefaults.actionRollData();

        // Allow the OpposedTest to overwrite action data using its class default action.
        action = TestCreator._mergeMinimalActionDataInOrder(action,
            // Use action data from the original action at first.
            opposedData.against.opposed.resist,
            // Overwrite with the OpposedTest class default action, if any.
            this._getDefaultTestAction()
        );

        // Allow the OpposedTest to overwrite action data dynamically based on item data.
        if (opposedData.sourceItemUuid) {
            const item = await fromUuid(opposedData.sourceItemUuid) as SR5Item;
            if (item) {
                const itemAction = await this._getDocumentTestAction(item, document);
                action = TestCreator._mergeMinimalActionDataInOrder(action, itemAction);
            }
        }

        return this._prepareActionTestData(action, document, data) as MatrixResistTestData;
    }

    override async populateDocuments() {
        await super.populateDocuments();
        await MatrixTestDataFlow.populateResistDocuments(this);
    }

    /**
     * Execute actions triggered by a tests chat message.
     *
     * This can be used to trigger opposing tests.
     */
    static override async executeMessageAction(againstData: MatrixDefenseTestData, messageId: string, options: TestOptions) {
        // Determine documents to roll test with.
        let documents = await Helpers.getMatrixTestTargetDocuments(againstData)

        // Inform user about tokens with deleted sidebar actors.
        // This can both happen for linked tokens immediately and unlinked tokens after reloading.
        // TODO: Check when this error is relevant.
        if (documents.filter(document => !document).length > 0) {
            ui.notifications?.warn('TOKEN.WarningNoActor', {localize: true});
            return;
        }

        // filter out actors current user shouldn't be able to test with.
        documents = documents.filter(document => document.isOwner);
        // Fallback to player character.
        if (documents.length === 0 && game.user?.character) {
            documents.push(game.user.character);
        }

        console.log('Shadowrun 5e | Casting a resist test using these actors', documents, againstData);

        for (const document of documents) {
            const data = await this._getResistActionTestData(againstData, document, messageId);
            if (!data) return;

            const documents = {source: document};
            const test = new this(data, documents, options);

            // Await test chain resolution for each actor, to avoid dialog spam.
            await test.execute();
        }
    }
}
