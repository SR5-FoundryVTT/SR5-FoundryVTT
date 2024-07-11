import { SR5Actor } from "../actor/SR5Actor";
import { SR5Item } from "../item/SR5Item";
import { NetworkDevice } from "../item/flows/MatrixNetworkFlow";
import { SuccessTest } from "./SuccessTest";
import { MarkPlacementFlow, MatrixPlacementData } from "./flows/MarkPlacementFlow";


/**
 * Brute force tests implement the Brute Force action on SR5#238
 */
export class BruteForceTest extends SuccessTest<MatrixPlacementData> {
    override actor: SR5Actor;
    
    // The icon to place a mark on.
    // This can be the actor itself or a device connected to it.
    icon: NetworkDevice;
    // The devices connected to the main icon persona / host.
    devices: (SR5Item)[];
    // All available hosts.
    hosts: (SR5Item)[];

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
     * Helper to determine if the targeted icon is an actor or not.
     * @returns true, for actor. false, for anything else.
     */
    get iconIsActor(): boolean {
        return this.icon instanceof SR5Actor;
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
    }

    /**
     * TODO: What am I even thinking here? Add an actual documentation of the test flow making these cases necessary
     * 
     * Icon can be both the hacking device and the target device? What even?!
     * 
     * @returns 
     */
    override async populateDocuments() {
        await super.populateDocuments();

        this._prepareIcon();
        this._prepareTargetIcon();
        this._prepareActorDevices();

        this._prepareHosts();
    }

    /**
     * Prepare a icon based on test data.
     * 
     * This can be these cases:
     * - an icon has been given into the test by outside sources
     * - an icon has been selected by the user
     * @returns 
     */
    _prepareIcon() {
        if (!this.data.iconUuid) return;

        // Fetch the icon as selected or given.
        this.icon = fromUuidSync(this.data.iconUuid) as NetworkDevice;

        // Switch to main icon if user selected it.
        if (this.data.placeOnMainIcon) this.icon = this.icon.parent as SR5Actor;
    }
    /**
     * Prepare a icon based on token targeting.
     * 
     */
    _prepareTargetIcon() {
        if (this.data.iconUuid || !this.hasTargets) return;
        if (this.targets.length !== 1) return console.error('Shadowrun 5e | Multiple targets for mark placement', this.targets);

        const target = this.targets[0];
        const actor = target.actor as SR5Actor;

        // Retrieve the target icon document.
        this.icon = fromUuidSync(actor.uuid) as NetworkDevice;
    }

    /**
     * Retrieve all devices connected with the persona actor.
     */
    _prepareActorDevices() {
        this.devices = [];
        if (!this.icon) return;
        const actor = this.iconIsActor ? this.icon as SR5Actor : this.icon.parent as SR5Actor;
        if (!actor.isCharacter || !actor.isCritter) return;

        // Collect network devices
        this.devices = actor.wirelessDevices;
    }

    /**
     * Retrieve all hosts available for a decker to hack.
     * 
     * If any token is selected, don't retrieve hosts.
     */
    _prepareHosts() {
        if (this.hasTargets) return;

        this.hosts = game.items?.filter(item => item.isHost) as SR5Item[];
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
