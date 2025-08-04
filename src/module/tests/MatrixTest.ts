import { SR5Actor } from '../actor/SR5Actor';
import { SR5Item } from '../item/SR5Item';
import { SuccessTest, SuccessTestData, TestOptions } from './SuccessTest';
import { OpposedTestData } from './OpposedTest';
import { MatrixTestDataFlow } from './flows/MatrixTestDataFlow';

export interface MatrixTestData extends SuccessTestData {
    // If decker and target reside on different Grids
    sameGrid: boolean
    // If decker has a direct connection to the target
    directConnection: boolean
    // The persona uuid. This would be the user main persona icon, not necessarily the device.
    personaUuid: string | undefined
    // The icon uuid. This would be the actual mark placement target. Can be a device, a persona device, a host or actor.
    iconUuid: string | undefined
    // Should the mark be placed on the main icon / persona or icons connected to it?
    targetMainIcon: boolean
}

export interface OpposedMatrixTestData extends OpposedTestData {
    against: MatrixTestData
    personaUuid: string
    iconUuid: string
    targetMainIcon: boolean
    directConnection: boolean
}

/**
 * Matrix Tests are the base Test type used to create Matrix Tests
 * - TODO possibly move these things to be done with hooks but that may be a bit difficult with needing the extra Icon and Token data
 *
 * See MarkPlacementFlow for more details on the test flow.
 */
export class MatrixTest<T extends MatrixTestData = MatrixTestData> extends SuccessTest<T> {
    declare actor: SR5Actor;

    // The icon targeted by the action.
    // If an actor was selected, this will point to either the persona device or the actor itself, if no persona device is used.
    declare icon: SR5Actor | SR5Item;
    // The persona matrix actor. If in use, icon will either point to the actor, if no persona device is used, or the persona device.
    declare persona: SR5Actor|null;
    // The devices connected to the main icon persona / host.
    declare devices: (SR5Actor | SR5Item)[];
    // Started ic on selected host.
    declare ic: SR5Actor[];
    // Host used as main icon.
    declare host: SR5Item|null;
    // Grid used as main icon.
    declare grid: SR5Item|null;

    override _prepareData(data: MatrixTestData, options: TestOptions = {}): any {
        data = super._prepareData(data, options);
        return MatrixTestDataFlow._prepareData(data);
    }

    /**
     * Brute Force is a matrix action.
     */
    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['matrix'];
    }

    /**
     * Any matrix action gets the noise modifier.
     */
    override get testModifiers(): Shadowrun.ModifierTypes[] {
        const modifiers = super.testModifiers;
        modifiers.push('noise');
        return modifiers;
    }

    override get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/matrix-test-dialog.hbs';
    }

    override get _chatMessageTemplate() {
        return 'systems/shadowrun5e/dist/templates/chat/matrix-test-message.hbs';
    }

    override prepareBaseValues() {
        super.prepareBaseValues();
        MatrixTestDataFlow.prepareBaseValues(this);
    }

    override async populateDocuments() {
        await super.populateDocuments();
        MatrixTestDataFlow.populateDocuments(this);
    }

    override prepareTestModifiers() {
        super.prepareTestModifiers();
        MatrixTestDataFlow.prepareTestModifiers(this);
    }

    override async addTarget(document: SR5Actor | SR5Item) {
        await MatrixTestDataFlow.addTarget(this, document);
    }

    /**
     * Clean up faulty test data after dialog has been shown.
     */
    override async _cleanUpAfterDialog() {
        await super._cleanUpAfterDialog();
        await MatrixTestDataFlow.setIconUuidBasedOnPlacementSelection(this);
    }
}
