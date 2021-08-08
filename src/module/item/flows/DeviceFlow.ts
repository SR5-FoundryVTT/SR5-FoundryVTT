import {SR5Actor} from "../../actor/SR5Actor";
import {SR5Item} from "../SR5Item";
import {SocketMessage} from "../../sockets";
import {FLAGS} from "../../constants";
import NetworkDeviceType = Shadowrun.NetworkDeviceType;
import NetworkDeviceLink = Shadowrun.NetworkDeviceLink;
import SocketMessageData = Shadowrun.SocketMessageData;

export class DeviceFlow {
    static networkDeviceType(target: SR5Item|SR5Actor, scene?: Scene): NetworkDeviceType {
        if (target instanceof SR5Item && target.isHost()) return 'Host';
        // Decker token with a decking device.
        if (target instanceof SR5Item && scene) return 'Token';
        // Technomancer / Sprite token with any device.
        if (target instanceof SR5Actor && scene) return 'Token';
        // Decker sidebar actor with a decking device.
        if (target instanceof SR5Item && !scene && target.actor) return 'Actor';

        if (target instanceof SR5Actor && !scene) return 'Actor';

        console.error(`The given networking device doesn't fit any allowed category of networkable matrix device / actor`, target);
    }

    static buildNetworkDeviceLink(target: SR5Item|SR5Actor, scene?: Scene): NetworkDeviceLink {
        return {
            sceneId: scene?.id,
            // @ts-ignore // TODO: foundry-vtt-type 0.8
            ownerId: target?.actor.id,
            targetId: target.id,
            type: DeviceFlow.networkDeviceType(target, scene)
        }
    }

    static documentByNetworkDeviceLink(link: NetworkDeviceLink): SR5Actor|SR5Item {
        if (link.type === 'Actor') {
            const actor = game.actors.get(link.ownerId);
            return actor.items.get(link.targetId) as SR5Item;
        }
    }

    static async emitAddControllerSocketMessage(controller, device, scene) {
        const controllerLink = DeviceFlow.buildNetworkDeviceLink(controller, scene);
        const deviceLink = DeviceFlow.buildNetworkDeviceLink(device, scene);
        await SocketMessage.emitForGM(FLAGS.addNetworkController, {controllerLink, deviceLink, sceneId: scene?.id});
    }

    static async handleAddNetworkControllerSocketMessage(message: SocketMessageData) {
        const {controllerLink, deviceLink, sceneId} = message.data;
        const controller = DeviceFlow.documentByNetworkDeviceLink(controllerLink);
        const device = DeviceFlow.documentByNetworkDeviceLink(deviceLink);
        const scene = game.scenes.get(sceneId);

        await DeviceFlow.addNetworkController(controller, device, scene);
    }

    static async addNetworkController(controller, device, scene) {
        const controllerLink = DeviceFlow.buildNetworkDeviceLink(controller)
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

         return controllerData.data.networkDevices.some(connectedLink =>
             connectedLink.type === unclearLink.type &&
             connectedLink.ownerId === unclearLink.ownerId &&
             connectedLink.sceneId === unclearLink.sceneId &&
             connectedLink.targetId === unclearLink.targetId
         )
    }
}