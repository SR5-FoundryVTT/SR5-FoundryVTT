import {SR5Actor} from "../../actor/SR5Actor";
import {SR5Item} from "../SR5Item";
import SocketAddNetworkControllerMessageData = Shadowrun.SocketAddNetworkControllerMessageData;
import {SocketMessage} from "../../sockets";
import {FLAGS} from "../../constants";

export class NetworkDeviceFlow {
    // static networkDeviceType(target: SR5Item|SR5Actor): NetworkDeviceType|undefined {
    //     if (target instanceof SR5Item && target.isHost()) return 'Host';
    //     if (target instanceof SR5Item && target.actor.token) return 'Token'
    //     if (target instanceof SR5Item && !target.actor.token) return 'Actor';
    //
    //     console.error(`The given networking device doesn't fit any allowed category of networkable matrix device / actor`, target);
    //     return;
    // }
    static buildLink(target: SR5Item|SR5Actor|TokenDocument) {
        return target.uuid;
        // const type =  DeviceFlow.networkDeviceType(target);
        // const actor = target instanceof SR5Actor ? target : target.actor;
        //
        // switch (type) {
        //     case 'Actor':
        //         return {
        //             sceneId: undefined,
        //             ownerId: actor.id as string,
        //             targetId: target.id as string,
        //             type
        //         }
        //     case 'Token':
        //         return {
        //             // @ts-ignore
        //             sceneId: actor.token.parent.id,
        //             ownerId: actor.token?.id as string,
        //             targetId: target.id as string,
        //             type
        //         }
        // }
        //
        // return;
    }

    static async resolveLink(link: string) {
        return await fromUuid(link) as unknown as SR5Item;
    }

    static async emitAddNetworkControllerSocketMessage(controller: SR5Item, networkDevice: SR5Item) {
        const controllerLink = NetworkDeviceFlow.buildLink(controller);
        const networkDeviceLink = NetworkDeviceFlow.buildLink(networkDevice);

        await SocketMessage.emitForGM(FLAGS.addNetworkController, {controllerLink, networkDeviceLink});
    }

    static async _handleAddNetworkControllerSocketMessage(message: SocketAddNetworkControllerMessageData) {
        const controller = await NetworkDeviceFlow.resolveLink(message.data.controllerLink);
        const device = await NetworkDeviceFlow.resolveLink(message.data.networkDeviceLink);

        await NetworkDeviceFlow.addNetworkDevice(controller, device);
    }

    /**
     * Connect a device to a network controller.
     *
     * @param controller
     * @param device
     */
    static async addController(controller: SR5Item, device: SR5Item) {
        if (!(device.isOwner || game.user?.isGM)) return console.error(`User isn't owner or GM of this device`, device);
        if (!controller.isDevice() && !controller.isHost()) return;

        const controllerLink = NetworkDeviceFlow.buildLink(controller);
        await device.update({'data.technology.networkController': controllerLink});

        if (game.user?.isGM)
            await NetworkDeviceFlow.addNetworkDevice(controller, device);
        else
            await NetworkDeviceFlow.emitAddNetworkControllerSocketMessage(controller, device);
    }

    static async addNetworkDevice(controller: SR5Item, device: SR5Item) {
        if (!(controller.isOwner || game.user?.isGM)) return console.error(`User isn't owner or GM of this device`, controller);

        const controllerData = controller.asDeviceData() || controller.asHostData();
        const networkDeviceLink = NetworkDeviceFlow.buildLink(device);

        if (!controllerData) return console.error(`Device isn't capable of accepting network devices`, controller);

        const networkDevices = controllerData.data.networkDevices;
        if (networkDevices.includes(networkDeviceLink)) return;

        await controller.update({'data.networkDevices': [...networkDevices, networkDeviceLink]});
    }

    //
    // static connectedNetworkDevice(controller: SR5Item, unclearLink: NetworkDeviceLink): boolean {
    //      if (!controller.isHost() && !controller.isDevice()) return false;
    //
    //      return DeviceFlow.findNetworkDeviceLink(controller, unclearLink) >= 0;
    // }
    //
    // static findNetworkDeviceLink(controller: SR5Item, needleLink: NetworkDeviceLink): number {
    //     if (!controller.isHost() && !controller.isDevice()) return -1;
    //
    //     const controllerData = controller.asControllerData();
    //     if (!controllerData) return -1;
    //      return controllerData.data.networkDevices.findIndex(connectedLink =>
    //          connectedLink.type === needleLink.type &&
    //          connectedLink.ownerId === needleLink.ownerId &&
    //          connectedLink.sceneId === needleLink.sceneId &&
    //          connectedLink.targetId === needleLink.targetId
    //      )
    // }
}