
declare namespace Shadowrun {
    export interface SocketMessageData {
        type: string,
        data: any,
        userId?: string
    }

    export interface SocketAddNetworkControllerMessageData extends SocketMessageData {
        data: {
            controllerLink: string,
            networkDeviceLink: string
        }
    }

    export type SocketMessageHooks = Record<string, Function[]>
}