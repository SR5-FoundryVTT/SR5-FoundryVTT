import {SR5Actor} from "../SR5Actor";
import { SR5Item } from '../../item/SR5Item';
import { MatrixNetworkFlow } from "@/module/item/flows/MatrixNetworkFlow";
import { MatrixActorSheetData, SR5MatrixActorSheet } from '@/module/actor/sheets/SR5MatrixActorSheet';
import { Helpers } from '@/module/helpers';
import { MatrixRules } from '@/module/rules/MatrixRules';
import { PackActionFlow } from "@/module/item/flows/PackActionFlow";
import { SheetFlow } from '@/module/flows/SheetFlow';

interface VehicleSheetDataFields extends MatrixActorSheetData {
    isVehicle: boolean;
    vehicle: {
        driver: SR5Actor|undefined,
        master: SR5Item | undefined
    }
}

export class SR5VehicleActorSheet extends SR5MatrixActorSheet<VehicleSheetDataFields> {
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

    static override DEFAULT_OPTIONS: any = {
        actions: {
            pickDriver: SR5VehicleActorSheet.#pickDriver,
            connectToDriver: SR5VehicleActorSheet.#connectToDriver,
            removeMaster: SR5VehicleActorSheet.#removeMaster,
            removeVehicleDriver: SR5VehicleActorSheet.#removeVehicleDriver,
            toggleChaseEnvironment: SR5VehicleActorSheet.#toggleChaseEnvironment,
            toggleOffRoad: SR5VehicleActorSheet.#toggleOffRoad,
        }
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

    override async _prepareContext(options) {
        const data = await super._prepareContext(options);

        // Vehicle actor type specific fields.
        data.vehicle = this._prepareVehicleFields();

        data.isVehicle = true;

        return data;
    }

    protected override async _getMatrixPackActions() {
        const matrixPackName = PackActionFlow.getMatrixActionsPackName();

        // filter out illegal actions from the matrix actions
        return (await PackActionFlow.getPackActions(matrixPackName)).filter((action) => {
            return !MatrixRules.isIllegalAction(
                        action.getAction()?.attribute as any,
                        action.getAction()?.attribute2 as any,
                        action.getAction()?.limit?.attribute as any);
        });
    }

    override async _onDropActor(event, actor) {
        await this.actor.addVehicleDriver(actor.uuid);
    }

    async _onDropItem(event, item) {
        if (item.canBeMaster) {
            return await this.actor.connectNetwork(item);
        }
        // @ts-expect-error I swear it exists
        await super._onDropItem(event, item);
    }

    _prepareVehicleFields() {
        const driver = this.actor.getVehicleDriver();

        const master = this.actor.master || undefined;

        return {
            driver,
            master,
        };
    }

    static override TABS = {
        ...super.TABS,
        primary: {
            initial: 'skills',
            tabs: [
                { id: 'actions', label: 'Actions', cssClass: '' },
                { id: 'skills', label: 'Vehicle', cssClass: '' },
                { id: 'inventory', label: 'Inventory', cssClass: '' },
                { id: 'matrix', label: 'Matrix', cssClass: '' },
                { id: 'effects', label: 'Effects', cssClass: '' },
                { id: 'description', label: 'Description', cssClass: '' },
                { id: 'misc', label: 'Misc', cssClass: '' },
            ]
        },
    }

    static override PARTS = {
        ...super.PARTS,
        matrix: {
            template: SheetFlow.templateBase('actor/tabs/matrix'),
            scrollable: [
                '#matrix-actions-scroll',
                '#marked-icons-scroll' ,
                '#owned-icons-scroll',
                '#network-icons-scroll',
                '#programs-scroll',
            ]
        },
        skills: {
            template: SheetFlow.templateBase('actor/tabs/vehicle-skills'),
            templates: [...SheetFlow.templateActorSystemParts(
                'active-skills', 'vehicle-attributes'
            ), ...SheetFlow.templateListItem('skill')],
            scrollable: ['#active-skills-scroll']
        },
        description: {
            template: SheetFlow.templateBase('actor/tabs/description'),
            scrollable: ['.scrollable']
        },
        inventory: {
            template: SheetFlow.templateBase('actor/tabs/inventory'),
            templates: SheetFlow.templateListItem('ammo', 'armor', 'bioware', 'cyberware', 'device', 'equipment', 'modification', 'weapon'),
            scrollable: ['.scrollable']
        },
    }


    /**
     * Connect to the PAN of the Driver
     * @param event
     */
    static async #connectToDriver(this: SR5VehicleActorSheet, event) {
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

    static async #pickDriver(this: SR5VehicleActorSheet, event) {
        event.preventDefault();
        const actors = Helpers.getControlledTokenActors();
        if (actors.length > 0) {
            // pick the first controlled actor
            const actor = actors[0];
            await this.actor.addVehicleDriver(actor.uuid);
            this.render();
        }

    }

    static async #removeVehicleDriver(this: SR5VehicleActorSheet, event) {
        event.preventDefault();
        await this.actor.removeVehicleDriver();
        this.render();
    }

    static async #toggleChaseEnvironment(this: SR5VehicleActorSheet, event) {
        event.preventDefault();
        const environment = this.actor.system.environment === 'handling' ? 'speed' : 'handling';
        await this.actor.update({system: { environment }});
    }

    static async #toggleOffRoad(this: SR5VehicleActorSheet, event) {
        event.preventDefault();
        const isOffRoad = !this.actor.system.isOffRoad;
        await this.actor.update({system: { isOffRoad }});
    }

    static async #removeMaster(this: SR5VehicleActorSheet, event) {
        event.preventDefault();

        await MatrixNetworkFlow.removeSlaveFromMaster(this.actor);
        await this.render();
    }
}
