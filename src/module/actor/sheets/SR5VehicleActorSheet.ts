import {SR5Actor} from "../SR5Actor";
import { SR5Item } from '../../item/SR5Item';
import { MatrixNetworkFlow } from "@/module/item/flows/MatrixNetworkFlow";
import { MatrixActorSheetData, SR5MatrixActorSheet } from '@/module/actor/sheets/SR5MatrixActorSheet';
import { Helpers } from '@/module/helpers';
import { MatrixRules } from '@/module/rules/MatrixRules';
import { PackItemFlow } from "@/module/item/flows/PackItemFlow";
import { SheetFlow } from '@/module/flows/SheetFlow';

interface VehicleSheetDataFields extends MatrixActorSheetData {
    isVehicle: boolean;
    vehicle: {
        driver: SR5Actor|undefined,
        master: SR5Item | undefined
    }
    modifications: SR5Item<'modification'>[];
}

export class SR5VehicleActorSheet extends SR5MatrixActorSheet<VehicleSheetDataFields> {
    /**
     * Vehicle actors will handle these item types specifically.
     *
     * All others will be collected within the gear tab.
     *
     * @returns An array of item types from the template.json Item section.
     */
    override getHandledItemTypes(): Item.ConfiguredSubType[] {
        const itemTypes = super.getHandledItemTypes();

        return [
            ...itemTypes,
            'program',
        ];
    }

    static override DEFAULT_OPTIONS = {
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
    override getInventoryItemTypes(): Item.ConfiguredSubType[] {
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

    override async _prepareContext(options: Parameters<SR5MatrixActorSheet["_prepareContext"]>[0]) {
        const data = await super._prepareContext(options);

        // Vehicle actor type specific fields.
        data.vehicle = this._prepareVehicleFields();
        data.modifications = this._prepareEquippedModifications();
        data.isVehicle = true;

        return data;
    }

    protected override async _getMatrixPackActions() {
        const matrixPackName = PackItemFlow.getMatrixActionsPackName();

        // filter out illegal actions from the matrix actions
        return (await PackItemFlow.getPackActions(matrixPackName)).filter((action) => {
            return !MatrixRules.isIllegalAction(
                        action.getAction()?.attribute as any,
                        action.getAction()?.attribute2 as any,
                        action.getAction()?.limit?.attribute as any);
        });
    }

    override async _onDropActor(event: DragEvent, actor: SR5Actor) {
        await this.actor.addVehicleDriver(actor.uuid);
        return null
    }

    override async _onDropItem(event: DragEvent, item: SR5Item) {
        if (item.canBeMaster) {
            await this.actor.connectNetwork(item);
            return null;
        }

        return super._onDropItem(event, item);
    }

    _prepareVehicleFields() {
        const driver = this.actor.getVehicleDriver();

        const master = this.actor.master || undefined;

        return {
            driver,
            master,
        };
    }

    /**
     * Allow gear (vehicle) modification to lie around in inventory while still allowing calculations around equipped modifications.
     */
    _prepareEquippedModifications() {
        return this.actor.itemsForType.get('modification')?.filter(item => item.isEquipped()) as SR5Item<'modification'>[] || [];
    }

    static override TABS = {
        ...super.TABS,
        primary: {
            initial: 'skills',
            labelPrefix: 'SR5.Tabs.Actor',
            tabs: [
                { id: 'actions', label: 'SR5.Tabs.Actor.Actions', cssClass: '' },
                { id: 'skills', label: 'SR5.Tabs.Actor.Vehicle', cssClass: '' },
                { id: 'inventory', label: 'SR5.Tabs.Actor.Inventory', cssClass: '' },
                { id: 'matrix', label: 'SR5.Tabs.Actor.Matrix', cssClass: '' },
                { id: 'effects', label: 'SR5.Tabs.Actor.Effects', cssClass: '' },
                { id: 'description', label: '', icon: 'far fa-info', tooltip: 'SR5.Tooltips.Actor.Description', cssClass: 'skinny' },
                { id: 'misc', label: '', icon: 'fas fa-gear', tooltip: 'SR5.Tooltips.Actor.MiscConfig', cssClass: 'skinny' },
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
        inventory: {
            template: SheetFlow.templateBase('actor/tabs/inventory'),
            scrollable: ['.scrollable']
        },
    }


    /**
     * Connect to the PAN of the Driver
     * @param event
     */
    static async #connectToDriver(this: SR5VehicleActorSheet, event: PointerEvent) {
        event.preventDefault();
        if (!(event.target instanceof HTMLElement)) return;
        const driver = this.actor.getVehicleDriver();
        if (driver) {
            const device = driver.getMatrixDevice();
            if (device) {
                await device.addSlave(this.actor);
                void this.render(false);
            } else {
                ui.notifications.error("No Device found on Driver")
            }
        } else {
            ui.notifications.error("No Driver found")
        }
    }

    static async #pickDriver(this: SR5VehicleActorSheet, event: Event) {
        event.preventDefault();
        const actors = Helpers.getControlledTokenActors();
        if (actors.length > 0) {
            // pick the first controlled actor
            const actor = actors[0];
            await this.actor.addVehicleDriver(actor.uuid);
            void this.render();
        }

    }

    static async #removeVehicleDriver(this: SR5VehicleActorSheet, event: Event) {
        event.preventDefault();
        await this.actor.removeVehicleDriver();
        void this.render();
    }

    static async #toggleChaseEnvironment(this: SR5VehicleActorSheet, event: Event) {
        event.preventDefault();
        const environment = this.actor.system.environment === 'handling' ? 'speed' : 'handling';
        await this.actor.update({system: { environment }});
    }

    static async #toggleOffRoad(this: SR5VehicleActorSheet, event: Event) {
        event.preventDefault();
        const isOffRoad = !this.actor.system.isOffRoad;
        await this.actor.update({system: { isOffRoad }});
    }

    static async #removeMaster(this: SR5VehicleActorSheet, event: Event) {
        event.preventDefault();

        await MatrixNetworkFlow.removeSlaveFromMaster(this.actor);
        await this.render();
    }
}
