import { DeepPartial } from 'fvtt-types/utils';
import { SR5Actor } from '@/module/actor/SR5Actor';
import { SheetFlow } from '@/module/flows/SheetFlow';
import { SR5_APPV2_CSS_CLASS } from '@/module/constants';
import { SR5ApplicationMixin, SR5ApplicationMixinTypes } from '@/module/handlebars/SR5ApplicationMixin';
import { SR5Item } from '@/module/item/SR5Item';
import { MatrixNetworkFlow } from '@/module/item/flows/MatrixNetworkFlow';
import { Helpers } from '@/module/helpers';
import { PackActionFlow } from '@/module/item/flows/PackActionFlow';
import { SR5 } from '@/module/config';
import { TestCreator } from '@/module/tests/TestCreator';

const { ApplicationV2 } = foundry.applications.api;
const { fromUuid, fromUuidSync } = foundry.utils;

// Types for NetworkManager context data
export interface NetworkManagerData extends SR5ApplicationMixinTypes.RenderContext {
    selectable_networks: SR5Item[];
    grids: SR5Item<'grid'>[];
    hosts: SR5Item<'host'>[];
    connected_network: SR5Item | null;
    actor: SR5Actor;
    driver?: SR5Actor;
}

export class NetworkManager extends SR5ApplicationMixin(ApplicationV2)<NetworkManagerData> {
    declare document: SR5Actor;

    static override PARTS = {
        details: {
            template: SheetFlow.templateBase('matrix/network-manager/details')
        },
        footer: {
            template: SheetFlow.templateBase('matrix/network-manager/footer')
        },
    }

    static override DEFAULT_OPTIONS = {
        classes: [SR5_APPV2_CSS_CLASS, 'network-manager'],
        form: {
            submitOnChange: false,
            closeOnSubmit: false,
        },
        position: {
            width: 500,
            height: 300,
        },
        window: {
            resizable: true,
        },
        actions: {
            connectToNetwork: NetworkManager.#connectToNetwork,
            inviteMark: NetworkManager.#handleMarkInvite,
            hackOnTheFly: NetworkManager.#handleHackOnTheFly,
            bruteForce: NetworkManager.#handleBruteForce,
            connectToDriver: NetworkManager.#connectToDriver,
        }
    }

    constructor(private readonly actor: SR5Actor, options = {}) {
        super(options);
        this.document = actor;
    }

    override get title() {
        return game.i18n.localize("SR5.NetworkManager.Title");
    }

    override async _prepareContext(options: DeepPartial<SR5ApplicationMixinTypes.RenderOptions> & { isFirstRender: boolean }) {
        const context = await super._prepareContext(options) as NetworkManagerData;

        context.selectable_networks = NetworkManager.selectableNetworks(this.actor);

        // prepare all the grids and hosts that are visible, except for public grids
        context.grids = MatrixNetworkFlow.visibleGrids().filter(item => !item.isPublicGrid());
        context.hosts = MatrixNetworkFlow.visibleHosts();

        context.connected_network = this.actor.network;

        context.actor = this.actor;

        // driver data is used as a shortcut for connecting to the driver's PAN
        context.driver = this.actor.getVehicleDriver();

        return context;
    }

    /**
     * Load a sorted list of matrix networks.
     */
    static selectableNetworks(character: SR5Actor) {
        let networks: SR5Item[] = [];
        if (game.user?.isGM) {
            networks = MatrixNetworkFlow.getNetworks();
        } else {
            networks = MatrixNetworkFlow.getNetworksForCharacter(character);
        }
        return networks.sort(Helpers.sortByName.bind(this));
    }

    /**
     * Execute the chosen mark placement action test.
     */
    async executeMarkPlacementActionTest(targetUuid: string, category: string) {
        const target = await fromUuid(targetUuid) as SR5Actor | SR5Item;
        if (!target) {
            console.error('Shadowrun 5e | Could not find target with uuid', targetUuid);
            return;
        }

        const matrixActions = await PackActionFlow.getActorMatrixActions(this.actor);
        const actions = matrixActions.filter(action => action.system.action.categories.includes(category));
        if (actions.length !== 1) {
            ui.notifications?.error(game.i18n.format('SR5.Errors.TooManyActionsWithCategory', {category: game.i18n.localize(SR5.actionCategories[category]) }));
            return;
        }
        const action = actions[0];
        const test = await TestCreator.fromItem(action, this.actor);
        if (!test) return;

        await this.actor.sheet?.render();
        await this.close();

        await test.addTarget(target);
        await test.execute();
    }

    /**
     * User triggered placing mark by Brute Force. Execute the matching test action.
     *
     * @param event User clicked on something.
     */
    static async #handleBruteForce(this: NetworkManager, event: PointerEvent) {
        event.preventDefault();
        event.stopPropagation();
        if (!(event.target instanceof HTMLElement)) return;

        const targetUuid = SheetFlow.closestUuid(event.target);
        if (!targetUuid) return;
        await this.executeMarkPlacementActionTest(targetUuid, 'brute_force');
    }

    /**
     * User triggered placing mark by Hack on The Fly. Execute the matching test action.
     *
     * @param event User clicked on something.
     */
    static async #handleHackOnTheFly(this: NetworkManager, event: PointerEvent) {
        event.preventDefault();
        event.stopPropagation();
        if (!(event.target instanceof HTMLElement)) return;

        const targetUuid = SheetFlow.closestUuid(event.target);
        if (!targetUuid) return;
        await this.executeMarkPlacementActionTest(targetUuid, 'hack_on_the_fly');
    }

    /**
     * User asks network for an voluntary mark.
     *
     * @param event User triggered event.
     */
    static async #handleMarkInvite(this: NetworkManager, event: PointerEvent) {
        event.preventDefault();
        event.stopPropagation();
        if (!(event.target instanceof HTMLElement)) return;

        const uuid = SheetFlow.closestUuid(event.target);
        if(!uuid) return;

        const network = fromUuidSync(uuid) as SR5Item | null;
        if (!network) return;

        await MatrixNetworkFlow.AskForNetworkMarkInvite(this.actor, network);

        await this.close();
    }

    static async #connectToNetwork(this: NetworkManager, event: PointerEvent) {
        event.preventDefault();
        event.stopPropagation();
        if (!(event.target instanceof HTMLElement)) return;

        const uuid = SheetFlow.closestUuid(event.target);
        if(!uuid) return;

        const network = fromUuidSync(uuid) as SR5Item | null;
        if (!network) return;

        await this.actor.connectNetwork(network);
        await this.actor.sheet?.render();

        await this.close();
    }

    /**
     * Connect to the PAN of the Driver
     * @param event
     */
    static async #connectToDriver(this: NetworkManager, event: PointerEvent) {
        event.preventDefault();
        if (!(event.target instanceof HTMLElement)) return;
        const driver = this.actor.getVehicleDriver();
        if (driver) {
            const device = driver.getMatrixDevice();
            if (device) {
                await device.addSlave(this.actor);
                await this.close();
            } else {
                ui.notifications.error("No Device found on Driver")
            }
        } else {
            ui.notifications.error("No Driver found")
        }
    }
}
