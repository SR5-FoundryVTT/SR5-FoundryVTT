import { SR5Actor } from "../actor/SR5Actor";
import { SR5Item } from "../item/SR5Item";
import { NetworkDevice } from "../item/flows/MatrixNetworkFlow";
import { SuccessTest, TestOptions } from "./SuccessTest";
import { MarkPlacementFlow, MatrixPlacementData } from "./flows/MarkPlacementFlow";


/**
 * Hack on the Fly tests implement the Hack on the Fly action on SR5#240
 */
export class HackOnTheFlyTest extends SuccessTest<MatrixPlacementData> {
    override actor: SR5Actor;

    // The icon to place a mark on.
    // If an actor was selected, this will point to either the persona device or the actor itself, if no persona device is used.
    icon: NetworkDevice;
    // The persona matrix actor. If in use, icon will either point to the actor, if no persona device is used, or the persona device.
    persona: SR5Actor;
    // The devices connected to the main icon persona / host.
    devices: (NetworkDevice)[];
    // Started ic on selected host.
    ic: SR5Actor[];

    host: SR5Item|null;
    grid: SR5Item|null;

    override _prepareData(data: MatrixPlacementData, options): any {
        data = super._prepareData(data, options);
        return MarkPlacementFlow._prepareData(data);
    }

    /**
     * Brute Force is a matrix action.
     */
    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['matrix', 'hack_on_the_fly'];
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
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/brute-force-test-dialog.html';
    }

    override async populateDocuments() {
        await super.populateDocuments();
        MarkPlacementFlow.populateDocuments(this);
    }

    override prepareTestModifiers() {
        super.prepareTestModifiers();

        MarkPlacementFlow.prepareTestModifiers(this);
    }

    override validateBaseValues() {
        super.validateBaseValues();

        MarkPlacementFlow.validateBaseValues(this);
    }
}