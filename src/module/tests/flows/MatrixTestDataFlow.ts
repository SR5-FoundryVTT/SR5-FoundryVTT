import { SR5Actor } from "../../actor/SR5Actor";
import { SR5 } from "../../config";
import { Helpers } from "../../helpers";
import { SR5Item } from "../../item/SR5Item";
import { PartsList } from "../../parts/PartsList";
import { SuccessTest, TestOptions } from "../SuccessTest";
import { MatrixTest, MatrixTestData, OpposedMatrixTestData } from "../MatrixTest";
import { MatrixRules } from "../../rules/MatrixRules";
import { MatrixDefenseTest } from "../MatrixDefenseTest";
import { MatrixResistTest, MatrixResistTestData } from "../MatrixResistTest";
import { OpposedBruteForceTest } from "../OpposedBruteForceTest";
import { OpposedHackOnTheFlyTest } from "../OpposedHackOnTheFlyTest";
import { BiofeedbackResistTest } from "../BiofeedbackResistTest";

/**
 * Apply Matrix Rules to Success Test Data relating to matrix.
 */
export const MatrixTestDataFlow = {
    addMatrixModifiers: function(test: SuccessTest) {
        if (test.source instanceof SR5Item) return;
        // do not add matrix modifier for resist tests
        if (test.data.action.test === 'MatrixResistTest') return;
        if (test.data.action.test === 'BiofeedbackResistTest') return;

        MatrixTestDataFlow.removeMatrixModifiers(test);

        const pool = new PartsList<number>(test.data.pool.mod);
        const action = test.data.action;
        const actor = test.source;

        if (!action) return;
        if (!actor) return;

        const directConnection = (test.data as MatrixTestData).directConnection ?? false;

        if (action.attribute && MatrixTestDataFlow.isMatrixAttribute(action.attribute))
            MatrixTestDataFlow.addMatrixModifiersToPool(actor, pool, true, directConnection);

        if (action.attribute2 && MatrixTestDataFlow.isMatrixAttribute(action.attribute2))
            MatrixTestDataFlow.addMatrixModifiersToPool(actor, pool, true, directConnection);

        if (action.limit.attribute && MatrixTestDataFlow.isMatrixAttribute(action.limit.attribute))
            MatrixTestDataFlow.addMatrixModifiersToPool(actor, pool, true, directConnection);
    },

    /**
     * Is the given attribute id a matrix attribute
     * @param attribute
     */
    isMatrixAttribute(attribute: string): boolean {
        return SR5.matrixAttributes.hasOwnProperty(attribute);
    },

    /**
     * Remove matrix modifier values to the given modifier part
     *
     * @param test A Value.mod field as a PartsList
     */
    removeMatrixModifiers(test: SuccessTest) {
        const pool = new PartsList<number>(test.data.pool.mod);
        ['SR5.HotSim', 'SR5.RunningSilent', 'SR5.PublicGrid'].forEach(part => pool.removePart(part));
    },

    /**
     * Wrapping legacy implementation of SR5Actor._addMatrixParts.
     *
     * Will add modifiers based on actor data to test pool
     * @param actor
     * @param pool
     * @param atts
     * @param directConnection
     * @returns
     */
    addMatrixModifiersToPool(actor: SR5Actor, pool: PartsList<number>, atts: any, directConnection = false) {
        if (Helpers.isMatrix(atts)) {
            if (!("matrix" in actor.system)) return;

            // Apply general matrix modifiers based on commlink/cyberdeck status.
            const matrix = actor.system.matrix!;
            if (matrix.hot_sim) pool.addUniquePart('SR5.HotSim', 2);
            if (matrix.running_silent) pool.addUniquePart('SR5.RunningSilent', -2);

            if (!directConnection && actor.network?.isPublicGrid()) {
                pool.addUniquePart('SR5.PublicGrid', actor.getPublicGridModifier());
            }
        }
    },

    /**
     * Add Matrix damage to a Test that is a Matrix Attack and will do extra damage based on the number of marks
     * @param test
     */
    addMatrixDamageForTargetMarks(test: SuccessTest) {
        if (!test.opposed || !test.hasDamage) return;
        if (!test.hasTestCategory('attack_matrix')) return;
        const actor = test.actor;
        if (!actor) return;

        const icon = (test as MatrixTest).icon;

        if (icon) {
            // get the target's persona if the target itself is not an item
            const targetItem = (icon instanceof SR5Item)
                ? icon : icon instanceof SR5Actor ? icon.hasPersona
                    ? icon.getMatrixDevice() : undefined : undefined;
            if (targetItem) {
                const marks = actor.getMarksPlaced(targetItem.uuid);
                if (marks > 0) {
                    // add damage per mark on the target item
                    test.data.damage.mod = PartsList.AddUniquePart(test.data.damage.mod,
                        "SR5.Marks", marks * (targetItem.actor?.getExtraMarkDamageModifier() ?? MatrixRules.getExtraMarkDamageModifier()));
                    test.data.damage.value = Helpers.calcTotal(test.data.damage, { min: 0 })
                }
                // if there wasn't a matrix device, see if we have marks placed on the actor itself
            } else if (icon instanceof SR5Actor) {
                const marks = actor.getMarksPlaced(icon.uuid);
                if (marks > 0) {
                    // add damage per mark on the target item
                    test.data.damage.mod = PartsList.AddUniquePart(test.data.damage.mod,
                        "SR5.Marks", marks * icon.getExtraMarkDamageModifier());
                    test.data.damage.value = Helpers.calcTotal(test.data.damage, { min: 0 })
                }
            }
        }
    },

    /**
     * Prepare data for Resisting matrix damage
     *
     * @param data
     * @param options
     * @returns
     */
    _prepareDataResist(data: MatrixResistTestData): any {
        // Allow for token targeting to be used to target the main icon.
        if (!data.iconUuid) data.iconUuid = data.targetUuids.length === 1 ? data.targetUuids[0] : undefined;

        data.personaUuid = data.personaUuid ?? undefined;
        data.iconUuid = data.iconUuid ?? undefined;

        return data;
    },

    /**
     * Prepare data for the initial mark placement test.
     *
     * @param data
     * @param options
     * @returns
     */
    _prepareData(data: MatrixTestData): any {
        // Allow for token targeting to be used to target the main icon.
        if (!data.iconUuid) data.iconUuid = data.targetUuids.length === 1 ? data.targetUuids[0] : undefined;

        // Assume decker and target reside on the same Grid
        data.sameGrid = data.sameGrid ?? true;
        // Assume no direct connection
        data.directConnection = data.directConnection ?? false;
        data.personaUuid = data.personaUuid ?? undefined;
        data.iconUuid = data.iconUuid ?? undefined;
        // assume we are targeting the persona
        data.targetMainIcon = data.targetMainIcon ?? true;

        return data;
    },

    /**
     * Prepare data for the opposing mark placement test.
     * @param data
     * @returns
     */
    _prepareOpposedData(data: OpposedMatrixTestData): any {
        data.personaUuid = data.personaUuid ?? data.against.personaUuid;
        data.iconUuid = data.iconUuid ?? data.against.iconUuid;
        data.targetMainIcon = data.targetMainIcon ?? data.against.targetMainIcon;
        data.directConnection = data.directConnection ?? data.against.directConnection;
        return data;
    },

    /**
     * Prepare data for matrix resist data from following test data
     * @param data
     * @returns
     */
    _prepareFollowingData(data: MatrixResistTestData): any {
        data.personaUuid = data.personaUuid ?? data.following?.personaUuid;
        data.iconUuid = data.iconUuid ?? data.following?.iconUuid;
        return data;
    },

    /**
     * Prepare all test modifiers for the mark placement test based on user selection.
     *
     * @param test The initial test to modify.
     */
    prepareTestModifiers(test: MatrixTest) {

        const modifiers = new PartsList<number>(test.data.modifiers.mod);

        // Check for grid modifiers.
        if (!test.data.sameGrid) {
            modifiers.addUniquePart('SR5.ModifierTypes.DifferentGrid', MatrixRules.differentGridModifier());
        } else {
            modifiers.addUniquePart('SR5.ModifierTypes.DifferentGrid', 0);
        }

        // Check for direct connection modifiers.
        if (test.data.directConnection) {
            // Grid modifiers don't apply when directly connected.
            modifiers.addUniquePart('SR5.ModifierTypes.DifferentGrid', 0);
            modifiers.addUniquePart('SR5.ModifierTypes.Noise', 0);
        } else {
            modifiers.addUniquePart('SR5.ModifierTypes.Noise', test.actor.modifiers.totalFor('noise'));
        }
    },

    /**
     * Prepare base values for a mark placement test.
     *
     * @param test The test placing any mark.
     */
    prepareBaseValues(test: MatrixTest) {
        // Host devices always use direct connections. // TODO: add rule reference
        if (test.host) test.data.directConnection = true;
        // If a device has been pre-targeted before dialog, show this on the first render.
        if (test.icon instanceof SR5Item && !test.icon.isType('host')) test.data.targetMainIcon = false;
        // Grid items don´t show any devices for now.
        if (test.icon instanceof SR5Item && test.icon.isType('grid')) test.data.targetMainIcon = true;
        // Cross grid placement between source and target.
        if (test.source instanceof SR5Actor && test.icon instanceof SR5Actor) MatrixTestDataFlow._crossGridConnectionForActors(test);
        if (test.source instanceof SR5Actor && test.icon instanceof SR5Item) MatrixTestDataFlow._crossGridConnectionForActorAndItem(test);
    },

    /**
     * Compare actor grid networks.
     * @param test The test placing any mark.
     */
    _crossGridConnectionForActors(test: MatrixTest) {
        const sourceActor = test.source as SR5Actor;
        const sourceNetwork = sourceActor.network;
        if (!sourceNetwork?.isType('grid')) return;

        const targetActor = test.icon as SR5Actor;
        const targetNetwork = targetActor.network;
        if (!targetNetwork?.isType('grid')) return;

        test.data.sameGrid = sourceNetwork.uuid === targetNetwork.uuid;
    },

    /**
     * Compare actor and item grid networks.
     * @param test The test placing any mark.
     */
    _crossGridConnectionForActorAndItem(test: MatrixTest) {
        const sourceActor = test.source as SR5Actor;
        const sourceNetwork = sourceActor.network;
        if (!sourceNetwork?.isType('grid')) return;

        const targetActor = test.icon as SR5Actor;
        const targetNetwork = targetActor.master;
        if (!targetNetwork?.isType('grid')) return;

        test.data.sameGrid = sourceNetwork.uuid === targetNetwork.uuid;
    },

    /**
     * Prepare icon and persona based on given uuid or user selection.
     *
     * @param test
     */
    populateDocuments(test: MatrixTest) {
        // Handle icons around targeting.
        MatrixTestDataFlow._prepareIcon(test);
        MatrixTestDataFlow._prepareTokenTargetIcon(test);

        // Target is a persona or a persona device.
        MatrixTestDataFlow._prepareActorDevices(test);

        // Target is a host or a host device.
        MatrixTestDataFlow._prepareHostDevices(test);
    },

    /**
     * Prepare icon and persona within a an opposing test context.
     *
     * The icon targeted by initial mark placement is either a persona or a device.
     * Devices might be related to a persona, in which case a persona will be present.
     * @param test The test to populate with documents.
     */
    async populateResistDocuments(test: MatrixResistTest | BiofeedbackResistTest) {
        if (test.data.iconUuid) {
            test.icon = await fromUuid(test.data.iconUuid) as SR5Item;
        }
        if (test.data.personaUuid) {
            test.persona = await fromUuid(test.data.personaUuid) as SR5Actor;
        }
        if (test.icon instanceof SR5Item) {
            test.device = test.icon;
        }
    },

    /**
     * Prepare icon and persona within a an opposing test context.
     *
     * The icon targeted by initial mark placement is either a persona or a device.
     * Devices might be related to a persona, in which case a persona will be present.
     * @param test The test to populate with documents.
     */
    async populateOpposedDocuments(test: MatrixDefenseTest | OpposedBruteForceTest | OpposedHackOnTheFlyTest) {
        if (test.against?.data.iconUuid) {
            test.icon = await fromUuid(test.against.data.iconUuid) as SR5Item;
        }
        if (test.against?.data.personaUuid) {
            test.persona = await fromUuid(test.against.data.personaUuid) as SR5Actor;
        }
        if (test.icon instanceof SR5Item) {
            test.device = test.icon;
        }
    },

    /**
     * Prepare Icon and Persona for this test based on data.
     *
     */
    _prepareIcon(test: MatrixTest) {
        // When given an icon uuid, load it.
        if (!test.data.iconUuid) return;
        test.icon = fromUuidSync(test.data.iconUuid) as SR5Item | SR5Actor;

        // Depending on icon type, categorize targets for display and device selection.
        if (test.icon instanceof SR5Actor) {
            test.data.personaUuid = test.icon.uuid;
        }

        // Store network type icons for easy access.
        if (test.icon instanceof SR5Item && test.icon.isType('host')) test.host = test.icon;
        if (test.icon instanceof SR5Item && test.icon.isType('grid')) test.grid = test.icon;

        // When given a persona uuid, load it.
        if (test.data.personaUuid) test.persona = fromUuidSync(test.data.personaUuid) as SR5Actor;

        // If a device icon is targeted, it will not have a persona or host.
        // TODO: Maybe we should show the persona for visibility and to make it the same as when targeting the persona first and selecting the device
        if (test.icon instanceof SR5Item && !test.persona && !test.host && !test.grid) {
            test.data.personaUuid = test.icon.persona?.uuid;
            test.devices = [test.icon];
        }
    },

    /**
     * Prepare a icon based on token targeting.
     */
    _prepareTokenTargetIcon(test: MatrixTest) {
        // If a persona has been loaded via uuid already, don't determine it anymore via token targeting.
        if (test.persona || !test.hasTargets) return;
        if (test.targets.length !== 1) {
            console.error('Shadowrun 5e | Multiple targets for mark placement', test.targets);
            return;
        }

        // taM check this
        const target = test.targets[0] as TokenDocument;
        const actor = target.actor!;

        test.persona = actor;
        // Retrieve the target icon document.
        test.icon = actor.hasDevicePersona ?
            actor.getMatrixDevice() as SR5Item :
            actor;

        test.data.iconUuid = test.icon.uuid;
        test.data.personaUuid = test.persona.uuid;
    },

    /**
     * Retrieve all devices connected with the persona actor.
     */
    _prepareActorDevices(test: MatrixTest) {
        test.devices = [];
        if (!test.persona) return;
        if (!test.persona.isType('character', 'critter', 'vehicle')) return;

        // Collect network devices
        test.devices = test.persona.wirelessDevices;
    },

    /**
     * Retrieve all devices connected to the host.
     */
    _prepareHostDevices(test: MatrixTest) {
        if (!(test.icon instanceof SR5Item)) return;
        const host = test.icon.asType('host');
        if (!host) return;

        // Whatever is connected to a host, is always 'wireless'.
        test.devices = host.system.slaves.map(uuid => fromUuidSync(uuid) as SR5Item);
    },

    /**
     * Retrieve all started IC connected to the host.
     */
    _prepareHostIC(test: MatrixTest) {
        if (test.icon instanceof SR5Actor) return;
        const host = test.icon.asType('host');
        if (!host) return;

        // Whatever is connected to a host, is always 'wireless'.
        test.ic = host.system.ic.map(uuid => fromUuidSync(uuid) as SR5Actor);
    },

    /**
     * TestDialog has issues when show / hiding elements, here the iconUuid device selection, with cleaning up data set
     * by previous render cycles.
     *
     * Here:
     * - First place mark on main icon
     * - Then select a device to place the mark on
     * - Reverse and place mark on main icon again
     * - iconUuid is still set to the device, as the render flow of the TestDialog doesn't clean up the data set by the
     *
     * @param test
     */
    async setIconUuidBasedOnPlacementSelection(test: MatrixTest) {
        // Assure main icon selection is set as the target icon.
        if (test.data.targetMainIcon) test.data.iconUuid = this._getMainIconUuid(test);
        // Document might have changed in between initial preparation and dialog selections.
        test.icon = fromUuidSync(test.data.iconUuid!) as SR5Item | SR5Actor;
    },

    /**
     * Based on targeted main icon type, return the uuid of the main icon.
     */
    _getMainIconUuid(test: MatrixTest): string|undefined {
        if (test.persona) return test.persona.uuid;
        if (test.host) return test.host.uuid;
        if (test.grid) return test.grid.uuid;
        return undefined;
    },

    /**
     * Provide easy way to set a target for mark placement tests.
     *
     * @param test
     * @param document
     */
    async addTarget(test: MatrixTest, document: SR5Actor | SR5Item) {
        if (test.targets.length > 1) {
            console.error(`Shadowrun 5e | ${this.constructor.name} only supports a single target`);
            return;
        }

        test.data.iconUuid = document.uuid;
        await test.populateDocuments();
    },

    /**
     * Handle target selection flow for matrix mark placement actions.
     *
     * NOTE: This method is bound to the calling class and should be called after .bind(s.this) by the caller.
     *
     * @param againstData
     * @param messageId
     * @param options
     */
    async executeMessageAction(testCls: any, againstData: MatrixTestData, messageId: string, options: TestOptions): Promise<void> {
        let document: any | null;
        if (againstData.iconUuid) {
            document = await fromUuid(againstData.iconUuid)
        }
        // if (!(document instanceof SR5Item)) return;
        if (!document) {
            const actor = Helpers.getSelectedActorsOrCharacter()[0];
            document = actor;
            againstData.iconUuid = actor.uuid;
        }
        if (!document) {
            document = game.user?.character;
            againstData.iconUuid = game.user?.character?.uuid;
        }
        if (!document) return;

        const data = await testCls._getOpposedActionTestData(againstData, document, messageId);
        if (!data) return;

        const documents = { source: document };
        const test = new testCls(data, documents, options);

        await test.execute();
    },
}
