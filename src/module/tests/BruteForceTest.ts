import { SR5Actor } from "../actor/SR5Actor";
import { SR5Item } from "../item/SR5Item";
import { SuccessTest } from "./SuccessTest";
import { MarkPlacementFlow, MatrixPlacementData } from "./flows/MarkPlacementFlow";


/**
 * Brute force tests implement the Brute Force action on SR5#238
 */
export class BruteForceTest extends SuccessTest<MatrixPlacementData> {
    override actor: SR5Actor;
    controller: SR5Actor|SR5Item;
    icons: (SR5Actor|SR5Item)[];

    override _prepareData(data: MatrixPlacementData, options): any {
        data = super._prepareData(data, options);
        return MarkPlacementFlow._prepareData(data, options);
    }

    /**
     * Brute Force is a matrix action.
     */
    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['matrix', 'brute_force'];
    }

    /**
     * Set a target for this test.
     * 
     * @param uuid The uuid to target for. This can point to an actor or item.
     */
    setTarget(uuid: string) {
        this.data.iconUuid = uuid;
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

    override async prepareDocumentData() {
        await super.prepareDocumentData();

        await this._prepareNetworkIcons();
    }

    /**
     * When placing a mark the actual target might not be a token or actor. Instead of the default targeting 
     * use a specific way for matrix targets.
     * 
     * @returns 
     */
    override async populateDocuments() {
        await super.populateDocuments();

        // If not iconUuid has been given, try to use a token target.
        if (!this.data.iconUuid && this.hasTargets) {
            if (this.targets.length !== 1) {
                console.error('Shadowrun 5e | Multiple targets for mark placement', this.targets);
            } else {
                const target = this.targets[0];
                const actor = target.actor as SR5Actor;
                const controller = await actor.getController();
                this.data.controllerUuid = controller?.uuid as string;
                this.data.iconUuid = controller?.uuid ?? target.uuid;
            }
        }

        if (this.data.controllerUuid) {
            const controller = await fromUuid(this.data.controllerUuid);
            if (!(controller instanceof SR5Item)) {
                console.error('Shadowrun 5e | Invalid controller for mark placement', controller);
                return;
            }

            this.controller = controller;
        }
    }

    /**
     * Retrieve all icons connected to the controller network
     */
    async _prepareNetworkIcons() {
        // An actor controller can't have a network.
        if (this.controller instanceof SR5Actor) {
            return;
        }
        // Collect network devices
        this.icons = await this.controller.networkDevices();

        // Remove possible persona icon from list or pre-select.
        if (this.data.placeOnController) {
            this.data.iconUuid = this.data.controllerUuid;
        } else {
            this.icons = this.icons.filter((icon) => icon.uuid !== this.data.controllerUuid);
        }
    }

    /**
     * Base on test dialog selection, different modifiers apply.
     */
    override prepareTestModifiers() {
        super.prepareTestModifiers();

        MarkPlacementFlow.prepareTestModifiers(this);
    }

    override validateBaseValues() {
        super.validateBaseValues();

        MarkPlacementFlow.validateBaseValues(this);
    }
}
