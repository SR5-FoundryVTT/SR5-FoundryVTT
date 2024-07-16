import { SR5Actor } from "../actor/SR5Actor";
import { SR5Item } from "../item/SR5Item";
import { NetworkDevice } from "../item/flows/MatrixNetworkFlow";
import { SuccessTest, TestOptions } from "./SuccessTest";
import { MarkPlacementFlow, MatrixPlacementData } from "./flows/MarkPlacementFlow";


/**
 * Brute force tests implement the Brute Force action on SR5#238
 * 
 * See MarkPlacementFlow for more details on the test flow.
 */
export class BruteForceTest extends SuccessTest<MatrixPlacementData> {
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
    // All available hosts.
    hosts: (SR5Item)[];
    // All available gitters.
    // TODO: gitters aren't implemented yet.
    gitters: any;

    override _prepareData(data: MatrixPlacementData, options: TestOptions={}): any {
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
     * Prepare icon and persona based on given uuid or user selection.
     * 
     */
    override async populateDocuments() {
        await super.populateDocuments();

        // Handle icons around targeting.
        this._prepareIcon();
        this._prepareTokenTargetIcon();

        // Target is a persona or a persona device.
        this._prepareActorDevices();

        // Target is a host or a host device.
        this._prepareHosts();
        this._prepareHostDevices();
    }

    /**
     * Prepare Icon and Persona for this test based on data.
     * 
     */
    _prepareIcon() {
        if (!this.data.iconUuid) return;

        // Fetch the icon as selected or given.
        this.icon = fromUuidSync(this.data.iconUuid) as NetworkDevice;

        if (this.icon instanceof SR5Actor) this.persona = this.icon;

        if (!this.data.personaUuid) return;
        this.persona = fromUuidSync(this.data.personaUuid) as SR5Actor;
    }
    /**
     * Prepare a icon based on token targeting.
     */
    _prepareTokenTargetIcon() {
        // If a persona has been loaded via uuid already, don't determine it anymore via token targeting.
        if (this.persona || !this.hasTargets) return;
        if (this.targets.length !== 1) {
            console.error('Shadowrun 5e | Multiple targets for mark placement', this.targets);
            return;
        }

        const target = this.targets[0];
        const actor = target.actor as SR5Actor;
        
        this.persona = actor;
        // Retrieve the target icon document.
        this.icon = actor.hasDevicePersona ? 
            actor.getMatrixDevice() as SR5Item : 
            actor;

        this.data.iconUuid = this.icon.uuid;
        this.data.personaUuid = this.persona.uuid;
    }

    /**
     * Retrieve all devices connected with the persona actor.
     */
    _prepareActorDevices() {
        this.devices = [];
        if (!this.persona) return;
        if (!this.persona.isCharacter || !this.persona.isCritter || !this.persona.isVehicle) return;

        // Collect network devices
        this.devices = this.persona.wirelessDevices;
    }

    /**
     * Retrieve all hosts available for a decker to hack, if no persona has been selected.
     */
    _prepareHosts() {
        if (this.persona) return;

        this.hosts = game.items?.filter(item => item.isHost) as SR5Item[];
    }

    /**
     * Retrieve all devices connected to the host.
     */
    _prepareHostDevices() {
        if (this.icon instanceof SR5Item && !this.icon.isHost) return;

        // Whatever is connected to a host, is always 'wireless'.
        this.devices = this.icon.items.filter(item => item.isMatrixDevice);
    }

    /**
     * Retrieve all started IC connected to the host.
     */
    _prepareHostIC() {
        if (this.icon instanceof SR5Actor) return;
        const host = this.icon.asHost;
        if (!host) return;

        // Whatever is connected to a host, is always 'wireless'.
        this.ic = host.system.ic.map(uuid => fromUuidSync(uuid) as SR5Actor);
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
