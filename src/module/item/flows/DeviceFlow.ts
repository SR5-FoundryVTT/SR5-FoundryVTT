import {SR5Actor} from "../../actor/SR5Actor";
import {SR5Item} from "../SR5Item";
import {SocketMessage} from "../../sockets";
import {FLAGS} from "../../constants";
import NetworkDeviceType = Shadowrun.NetworkDeviceType;
import NetworkDeviceLink = Shadowrun.NetworkDeviceLink;
import SocketMessageData = Shadowrun.SocketMessageData;


export class DeviceFlow {
    static networkDeviceType(target: SR5Item|SR5Actor): NetworkDeviceType|undefined {
        if (target instanceof SR5Item && target.isHost()) return 'Host';
        if (target instanceof SR5Item && target.actor.token) return 'Token'
        if (target instanceof SR5Item && !target.actor.token) return 'Actor';

        console.error(`The given networking device doesn't fit any allowed category of networkable matrix device / actor`, target);
        return;
    }

    static buildNetworkDeviceLink(target: SR5Item|SR5Actor): NetworkDeviceLink|undefined {
        const type =  DeviceFlow.networkDeviceType(target);
        const actor = target instanceof SR5Actor ? target : target.actor;

        switch (type) {
            case 'Actor':
                return {
                    sceneId: undefined,
                    ownerId: actor.id as string,
                    targetId: target.id as string,
                    type
                }
            case 'Token':
                return {
                    // @ts-ignore
                    sceneId: actor.token.parent.id,
                    ownerId: actor.token?.id as string,
                    targetId: target.id as string,
                    type
                }
        }

        return;
    }

    static documentByNetworkDeviceLink(link: NetworkDeviceLink): SR5Actor|SR5Item|undefined {
        if (!game.actors || !game.scenes) return;

        switch (link.type) {
            case 'Actor': {
                const actor = game.actors.get(link.ownerId as string);
                if (!actor) return;
                return actor.items.get(link.targetId) as SR5Item;
            }

            case 'Token': {
                const scene = game.scenes.get(link.sceneId as string);
                if (!scene) return;
                 // @ts-ignore // TODO: foundry-vtt-types 0.8
                const token = scene.tokens.get(link.ownerId);
                if (!token || !token.actor) return;
                return token.actor.items.get(link.targetId) as SR5Item;
            }
        }
    }

    static async emitAddControllerSocketMessage(controller, device) {
        const controllerLink = DeviceFlow.buildNetworkDeviceLink(controller);
        const deviceLink = DeviceFlow.buildNetworkDeviceLink(device);
        await SocketMessage.emitForGM(FLAGS.addNetworkController, {controllerLink, deviceLink});
    }

    static async handleAddNetworkControllerSocketMessage(message: SocketMessageData) {
        const {controllerLink, deviceLink} = message.data;
        const controller = DeviceFlow.documentByNetworkDeviceLink(controllerLink);
        const device = DeviceFlow.documentByNetworkDeviceLink(deviceLink);

        await DeviceFlow.addNetworkController(controller, device);
    }

    static async addNetworkController(controller, device) {
        const controllerLink = DeviceFlow.buildNetworkDeviceLink(controller);
        if (device instanceof SR5Item) {
            await device.update({'data.technology.networkController': controllerLink});
        }
        if (device instanceof SR5Actor) {
            console.error('implement');
        }
    }

    static invalidNetworkDevice(controller: SR5Item, target: SR5Item|SR5Actor): boolean {
        if (controller.isHost() && target instanceof SR5Actor) {
            // A host only accepts IC as actor network devices.
            return !target.isIC();
        }

        // Assume all technological items can be added to a PAN or WAN, not only devices.
        if (target instanceof SR5Item) {
            // Both hosts and devices accept all technology items as network devices.
            return target.getTechnology() === undefined;
        }

        // Assume all other target types are invalid as a network device.
        return true;
    }

    // TODO: Test with host controller.
    static connectedNetworkDevice(controller: SR5Item, unclearLink: NetworkDeviceLink): boolean {
         if (!controller.isHost() && !controller.isDevice()) return false;

         const controllerData = controller.asControllerData();

         return DeviceFlow.findNetworkDeviceLink(controller, unclearLink) >= 0;
    }

    static findNetworkDeviceLink(controller: SR5Item, needleLink: NetworkDeviceLink): number {
        if (!controller.isHost() && !controller.isDevice()) return -1;

        const controllerData = controller.asControllerData();
        if (!controllerData) return -1;
         return controllerData.data.networkDevices.findIndex(connectedLink =>
             connectedLink.type === needleLink.type &&
             connectedLink.ownerId === needleLink.ownerId &&
             connectedLink.sceneId === needleLink.sceneId &&
             connectedLink.targetId === needleLink.targetId
         )
    }
}