import {SR5Actor} from "../SR5Actor";
import { SR5Item } from '../../item/SR5Item';
import { MatrixNetworkFlow } from "@/module/item/flows/MatrixNetworkFlow";
import { SR5MatrixActorSheet } from '@/module/actor/sheets/SR5MatrixActorSheet';
import { Helpers } from '@/module/helpers';
import { MatrixRules } from '@/module/rules/MatrixRules';

interface VehicleSheetDataFields {
    driver: SR5Actor|undefined
    master: SR5Item | undefined
}

export class SR5VehicleActorSheet extends SR5MatrixActorSheet {
    /**
     * Vehicle actors will handle these item types specifically.
     *
     * All others will be collected within the gear tab.
     *
     * @returns An array of item types from the template.json Item section.
     */
    override getHandledItemTypes(): string[] {
        let itemTypes = super.getHandledItemTypes();

        return [
            ...itemTypes,
            'program',
        ];
    }

    /**
     * Vehicle actors will always show these item types.
     *
     * For more info see into super.getInventoryItemTypes jsdoc.
     *
     * @returns An array of item types from the template.json Item section.
     */
    override getInventoryItemTypes(): string[] {
        const itemTypes = super.getInventoryItemTypes();

        return [
            ...itemTypes,
            'weapon',
            'ammo',
            'armor',
            'bioware',
            'cyberware',
            'device',
            'equipment',
            'modification'
        ];
    }

    override async getData(options) {
        const data = await super.getData(options);

        // Vehicle actor type specific fields.
        data.vehicle = this._prepareVehicleFields();

        return data;
    }

    protected override async _getMatrixPackActions() {
        const matrixPackName = Helpers.getMatrixActionsPackName();

        // filter out illegal actions from the matrix actions
        return (await Helpers.getPackActions(matrixPackName)).filter((action) => {
            return !MatrixRules.isIllegalAction(
                        action.getAction()?.attribute as any,
                        action.getAction()?.attribute2 as any,
                        action.getAction()?.limit?.attribute as any);
        });
    }

    override activateListeners(html: JQuery) {
        super.activateListeners(html);

        // Vehicle Sheet related handlers...
        html.find('.driver-remove').on('click', this._handleRemoveVehicleDriver.bind(this));

        // PAN/WAN
        html.find('.origin-link').on('click', this._onOpenOriginLink.bind(this));
        html.find('.controller-remove').on('click', this._onControllerRemove.bind(this));

        html.find('.connect-to-driver').on('click', this._onConnectToDriver.bind(this));
    }

    /**
     * Vehicle specific drop events
     * @param event A DataTransferEvent containing some form of FoundryVTT Document / Data
     */
    override async _onDrop(event) {
        event.preventDefault();
        event.stopPropagation();

        if (!event.dataTransfer) return;

        const dropData = JSON.parse(event.dataTransfer.getData('text/plain'));

        if (dropData.type === 'Actor') {
            return this.actor.addVehicleDriver(dropData.uuid)
        } else if (dropData.type === 'Item') {
            // if an item is dropped on us that can be a Master, connect to it
            const item = await fromUuid(dropData.uuid) as SR5Item | undefined;
            if (item && item.canBeMaster) {
                return await this.actor.connectNetwork(item);
            }
        }

        // Handle none specific drop events.
        return super._onDrop(event);
    }

    _prepareVehicleFields(): VehicleSheetDataFields {
        const driver = this.actor.getVehicleDriver();

        const master = this.actor.master || undefined;

        return {
            driver,
            master,
        };
    }

    /**
     * Connect to the PAN of the Driver
     * @param event
     */
    async _onConnectToDriver(event) {
        event.preventDefault();
        const driver = this.actor.getVehicleDriver();
        if (driver) {
            const device = driver.getMatrixDevice();
            if (device) {
                await device.addSlave(this.actor);
                this.render(false);
            } else {
                ui.notifications.error("No Device found on Driver")
            }
        } else {
            ui.notifications.error("No Driver found")
        }
    }

    async _handleRemoveVehicleDriver(event) {
        event.preventDefault();
        await this.actor.removeVehicleDriver();
        this.render();
    }

    async _onOpenOriginLink(event) {
        event.preventDefault();

        console.log('Shadowrun 5e | Opening PAN/WAN network controller');

        const originLink = event.currentTarget.dataset.originLink;
        const device = await fromUuid(originLink);
        if (!device) return;

        if (device instanceof SR5Item || device instanceof SR5Actor)
            device?.sheet?.render(true);
    }

    async _onControllerRemove(event) {
        event.preventDefault();

        await MatrixNetworkFlow.removeSlaveFromMaster(this.actor);
        this.render();
    }
}
