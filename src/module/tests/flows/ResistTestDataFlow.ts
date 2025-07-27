import { Helpers } from '../../helpers';
import { SuccessTestData, TestOptions } from '../SuccessTest';
import { DataDefaults } from '../../data/DataDefaults';
import DamageData = Shadowrun.DamageData;
import { DefenseTestData } from '../DefenseTest';
import { Translation } from '../../utils/strings';
import ActionRollData = Shadowrun.ActionRollData;
import { TestCreator } from '../TestCreator';
import { SR5Item } from '../../item/SR5Item';

// Resist Test Data will have incoming and modified damage
export type ResistTestData<T extends any = any> = SuccessTestData & {
    // Damage value of the attack
    incomingDamage: DamageData
    // Modified damage value of the attack after this defense (success or failure)
    modifiedDamage: DamageData
    // any following tests - these generally occur if the resist test is part of a Flow
    following?: T
}

/**
 * Resist Tests involve a Character or Item Resisting incoming damage
 * - generally "items" are only targeted by Matrix damage
 *
 * The functions within are to be used by ResistTest classes.
 */
export const ResistTestDataFlow = {

    /**
     * Calculate the new modified damage and ap base values
     * @param data
     */
    calculateBaseValues(data: ResistTestData) {
        // Calculate damage values in case of user dialog interaction.
        Helpers.calcTotal(data.incomingDamage, {min: 0});
        Helpers.calcTotal(data.incomingDamage.ap);

        // Remove user override and resulting incoming damage as base.
        data.modifiedDamage = foundry.utils.duplicate(data.incomingDamage);
        data.modifiedDamage.base = data.incomingDamage.value;
        data.modifiedDamage.mod = [];
        delete data.modifiedDamage.override;
        data.modifiedDamage.ap.base = data.incomingDamage.ap.value;
        data.modifiedDamage.ap.mod = [];
        delete data.modifiedDamage.ap.override;

        Helpers.calcTotal(data.modifiedDamage);
        Helpers.calcTotal(data.modifiedDamage.ap);
    },

    /**
     * Update the Incoming and Modified damage objects based on the data provided
     * @param data
     */
    _prepareData(data: ResistTestData): any {
        // Is this test part of a followup test chain? defense => resist
        if (data.following) {
            data.incomingDamage = foundry.utils.duplicate(data.following?.modifiedDamage || DataDefaults.damageData());
            data.modifiedDamage = foundry.utils.duplicate(data.incomingDamage);
            // This test is part of either a standalone resist or created with its own data (i.e. edge reroll).
        } else {
            data.incomingDamage = data.incomingDamage ?? DataDefaults.damageData();
            data.modifiedDamage = foundry.utils.duplicate(data.incomingDamage);
        }
        return data;
    },

    /**
     * Get the base Resist Test Data based on the DefenseTestData
     * - inheriting classes can add to this data for any extra information it needs to provide for the test
     * @param opposedData
     * @param title
     * @param previousMessageId
     */
    _getResistTestData(opposedData: DefenseTestData | ResistTestData, title: Translation, previousMessageId: string): ResistTestData {
        return {
            title,

            previousMessageId,

            pool: DataDefaults.valueData({label: 'SR5.DicePool'}),
            limit: DataDefaults.valueData({label: 'SR5.Limit'}),
            threshold: DataDefaults.valueData({label: 'SR5.Threshold'}),
            //@ts-expect-error SuccessTest.prepareData is adding missing values, however these aren't actually optional.
            values: {},

            modifiers: DataDefaults.valueData({label: 'SR5.Labels.Action.Modifiers'}),
            incomingDamage: opposedData.incomingDamage,
            modifiedDamage: opposedData.modifiedDamage,

            targetUuids: opposedData.targetUuids,
            targetActorsUuid: opposedData.targetActorsUuid,

            sourceUuid: opposedData.sourceUuid,
            sourceActorUuid: opposedData.sourceActorUuid,
            sourceItemUuid: opposedData.sourceItemUuid,

            following: opposedData,
        }
    },

    /**
     * Create ActionData for a Rest Test, based on the provided DefenseTestData
     * @param testCls
     * @param opposedData
     * @param test
     */
    // TODO use a better type for 'test'
    async _getResistActionData(testCls: any, opposedData: DefenseTestData, test: string): Promise<ActionRollData> {
        // The original action doesn't contain a complete set of ActionData.
        // Therefore we must create an empty dummy action.
        let action = DataDefaults.actionRollData();

        // Allow the OpposedTest to overwrite action data using its class default action.
        action = TestCreator._mergeMinimalActionDataInOrder(action,
            // Use action data from the original action at first.
            opposedData.against.opposed.resist,
            // Overwrite with the OpposedTest class default action, if any.
            testCls._getDefaultTestAction()
        );

        // Allow the OpposedTest to overwrite action data dynamically based on item data.
        if (opposedData.sourceItemUuid) {
            const item = await fromUuid(opposedData.sourceItemUuid) as SR5Item;
            if (item) {
                const itemAction = await testCls._getDocumentTestAction(item, document);
                action = TestCreator._mergeMinimalActionDataInOrder(action, itemAction);
            }
        }
        action.test = test;
        return action;
    },

    async executeMessageAction(testCls: any, againstData: DefenseTestData | ResistTestData, messageId: string, documents: any[], options: TestOptions) {
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
            const data = await testCls._getResistActionTestData(againstData, document, messageId);
            if (!data) return;

            const documents = {source: document};
            const test = new testCls(data, documents, options);

            // Await test chain resolution for each actor, to avoid dialog spam.
            await test.execute();
        }
    },

    /**
     * Create ActionData for another Resist Test, based on the provided ResstTestData
     * @param testCls
     * @param opposedData
     * @param test
     */
    // TODO use a better type for 'test'
    async _getResistAgainActionData(testCls: any, opposedData: ResistTestData, test: string): Promise<ActionRollData> {
        // The original action doesn't contain a complete set of ActionData.
        // Therefore we must create an empty dummy action.
        let action = DataDefaults.actionRollData();

        // Allow the OpposedTest to overwrite action data using its class default action.
        action = TestCreator._mergeMinimalActionDataInOrder(action,
            // Use action data from the original action at first.
            opposedData.action,
            // Overwrite with the OpposedTest class default action, if any.
            testCls._getDefaultTestAction()
        );

        // Allow the OpposedTest to overwrite action data dynamically based on item data.
        if (opposedData.sourceItemUuid) {
            const item = await fromUuid(opposedData.sourceItemUuid) as SR5Item;
            if (item) {
                const itemAction = await testCls._getDocumentTestAction(item, document);
                action = TestCreator._mergeMinimalActionDataInOrder(action, itemAction);
            }
        }
        action.test = test;
        return action;
    },
}
