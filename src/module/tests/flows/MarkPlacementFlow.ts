import { SR5Actor } from '../../actor/SR5Actor';
import { SR5Item } from '../../item/SR5Item';
import { PartsList } from '../../parts/PartsList';
import { MatrixRules } from '../../rules/MatrixRules';
import { HackOnTheFlyTest } from '../HackOnTheFlyTest';
import { OpposedBruteForceTest } from '../OpposedBruteForceTest';
import { OpposedHackOnTheFlyTest } from '../OpposedHackOnTheFlyTest';
import { OpposedTestData } from '../OpposedTest';
import { SuccessTestData, TestOptions } from '../SuccessTest';
import { BruteForceTest } from './../BruteForceTest';

export interface MatrixPlacementData extends SuccessTestData {
    // Amount of marks to be placed
    marks: number
    // If decker and target reside on different Grids
    sameGrid: boolean
    // If decker has a direct connection to the target
    directConnection: boolean
    // The persona uuid. This would be the user main persona icon, not necessarily the device.
    personaUuid: string|undefined
    // The icon uuid. This would be the actual mark placement target. Can be a device, a persona device, a host or actor.
    iconUuid: string|undefined
    // Should the mark be placed on the main icon / persona or icons connected to it?
    placeOnMainIcon: boolean
}

export interface OpposeMarkPlacementData extends OpposedTestData {
    against: MatrixPlacementData
    personaUuid: string
    iconUuid: string
}

type MarkPlacementTests = BruteForceTest | HackOnTheFlyTest;
/**
 * Handle test flows for placing marks between different tests / actions.
 * 
 * This assumes that:
 * - A persona will be selected BEFORE testing starts and won't be changeable during.
 */
export const MarkPlacementFlow = {
    /**
     * Prepare data for the initial mark placement test.
     * 
     * @param data 
     * @param options 
     * @returns 
     */
    _prepareData(data: MatrixPlacementData): any {
        // Place a single mark as default
        data.marks = data.marks ?? 1;
        // Assume decker and target reside on the same Grid
        data.sameGrid = data.sameGrid ?? true;
        // Assume no direct connection
        data.directConnection = data.directConnection ?? false;
        data.personaUuid = data.personaUuid ?? undefined;
        data.iconUuid = data.iconUuid ?? undefined;
        // By default a decker can place marks either on the main icon or its connected icon.
        // This can be a persona or device relationship or a host and its devices.
        data.placeOnMainIcon = data.placeOnMainIcon ?? true;

        return data;
    },

    /**
     * Prepare data for the opposing mark placement test.
     * @param data 
     * @returns 
     */
    _prepareOpposedData(data: OpposeMarkPlacementData): any {
        data.personaUuid = data.personaUuid ?? data.against.personaUuid;
        data.iconUuid = data.iconUuid ?? data.against.iconUuid;
        return data;
    },

    /**
     * Prepare all test modifiers for the mark placement test based on user selection.
     * 
     * @param test The initial test to modify.
     */
    prepareTestModifiers(test: MarkPlacementTests) {

        const modifiers = new PartsList<number>(test.data.modifiers.mod);

        // Apply mark modifier
        modifiers.addUniquePart('SR5.ModifierTypes.Marks', MatrixRules.getMarkPlacementModifier(test.data.marks));

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
    prepareBaseValues(test: MarkPlacementTests) {
        // Host devices always use direct connections. // TODO: add rule reference
        if (test.host) test.data.directConnection = true;
        // If a device has been pre-targeted before dialog, show this on the first render.
        if (test.icon instanceof SR5Item && !test.icon.isHost) test.data.placeOnMainIcon = false;
    },

    /**
     * Prepare icon and persona based on given uuid or user selection.
     * 
     * @param test 
     */
    populateDocuments(test: MarkPlacementTests) {
        // Handle icons around targeting.
        MarkPlacementFlow._prepareIcon(test);
        MarkPlacementFlow._prepareTokenTargetIcon(test);

        // Target is a persona or a persona device.
        MarkPlacementFlow._prepareActorDevices(test);

        // Target is a host or a host device.
        MarkPlacementFlow._prepareHostDevices(test);
    },

    /**
     * Prepare icon and persona within a an opposing test context.
     * 
     * The icon targeted by initial mark placement is either a persona or a device.
     * Devices might be related to a persona, in which case a persona will be present.
     * @param test The test to populate with documents.
     */
    async populateOpposedDocuments(test: OpposedBruteForceTest|OpposedHackOnTheFlyTest) {
        if (test.against.data.iconUuid) {
            test.icon = await fromUuid(test.against.data.iconUuid) as SR5Item;
        }
        if (test.against.data.personaUuid) {
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
    _prepareIcon(test: MarkPlacementTests) {
        // When given an icon uuid, load it.
        if (!test.data.iconUuid) return;
        test.icon = fromUuidSync(test.data.iconUuid) as Shadowrun.NetworkDevice;

        // Depending on icon type, categorize targets for display and device selection.
        if (test.icon instanceof SR5Actor) test.persona = test.icon;
        if (test.icon instanceof SR5Item && test.icon.isHost) test.host = test.icon;

        // When given a persona uuid, load it.
        if (test.data.personaUuid) test.persona = fromUuidSync(test.data.personaUuid) as SR5Actor;

        // If a device icon is targeted, it will not have a persona or host.
        // TODO: Maybe we should show the persona for visibility and to make it the same as when targeting the persona first and selecting the device
        if (test.icon instanceof SR5Item && !test.persona && !test.host) {
            test.data.personaUuid = test.icon.persona?.uuid;
            test.devices = [test.icon];
        }
    },

    /**
     * Prepare a icon based on token targeting.
     */
    _prepareTokenTargetIcon(test: MarkPlacementTests) {
        // If a persona has been loaded via uuid already, don't determine it anymore via token targeting.
        if (test.persona || !test.hasTargets) return;
        if (test.targets.length !== 1) {
            console.error('Shadowrun 5e | Multiple targets for mark placement', test.targets);
            return;
        }

        const target = test.targets[0];
        const actor = target.actor as SR5Actor;
        
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
    _prepareActorDevices(test: MarkPlacementTests) {
        test.devices = [];
        if (!test.persona) return;
        if (!test.persona.isCharacter || !test.persona.isCritter || !test.persona.isVehicle) return;

        // Collect network devices
        test.devices = test.persona.wirelessDevices;
    },

    /**
     * Retrieve all devices connected to the host.
     */
    _prepareHostDevices(test: MarkPlacementTests) {
        if (!(test.icon instanceof SR5Item)) return;
        const host = test.icon.asHost;
        if (!host) return;

        // Whatever is connected to a host, is always 'wireless'.
        test.devices = host.system.slaves.map(uuid => fromUuidSync(uuid) as SR5Item);
    },

    /**
     * Retrieve all started IC connected to the host.
     */
    _prepareHostIC(test: MarkPlacementTests) {
        if (test.icon instanceof SR5Actor) return;
        const host = test.icon.asHost;
        if (!host) return;

        // Whatever is connected to a host, is always 'wireless'.
        test.ic = host.system.ic.map(uuid => fromUuidSync(uuid) as SR5Actor);
    },

    /**
     * Validate all base values for the mark placement test.
     * 
     * @param test The initial test to validate.
     */
    validateBaseValues(test: MarkPlacementTests) {
        test.data.marks = MatrixRules.getValidMarksPlacementCount(test.data.marks);
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
    async executeMessageAction(testCls: any, againstData: MatrixPlacementData, messageId: string, options: TestOptions): Promise<void> {
        if (!againstData.iconUuid) return;

        // Some opposed tests only need an item, no actor...
        const document = await fromUuid(againstData.iconUuid);
        // if (!(document instanceof SR5Item)) return;
        if (!document) return;

        const data = await testCls._getOpposedActionTestData(againstData, document, messageId);
        if (!data) return;

        const documents = { source: document };
        const test = new testCls(data, documents, options);

        await test.execute();
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
    async setIconUuidBasedOnPlacementSelection(test: MarkPlacementTests) {
        if (!test.data.placeOnMainIcon) return;
        test.data.iconUuid = test.persona?.uuid ?? test.host?.uuid ?? undefined;
    },

    
    /**
     * Provide easy way to set a target for mark placement tests.
     *
     * @param document 
     */
    async addTarget(test: MarkPlacementTests, document: SR5Actor | SR5Item) {
        if (test.targets.length > 1) {
            console.error(`Shadowrun 5e | ${this.constructor.name} only supports a single target`);
            return;
        }

        test.data.iconUuid = document.uuid;
        await test.populateDocuments();
    }
}