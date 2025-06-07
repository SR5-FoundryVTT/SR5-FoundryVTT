
declare namespace Shadowrun {
    export interface SocketMessageData {
        type: string,
        data: any,
        userId?: string
    }

    export interface SocketAddNetworkControllerMessageData extends SocketMessageData {
        data: {
            controllerLink: `Actor.${string}` | `Item.${string}` | `Token.${string}`,
            networkDeviceLink: `Actor.${string}` | `Item.${string}` | `Token.${string}`
        }
    }

    export interface SocketRemoveControllerFromDeviceSocketMessageData extends SocketMessageData {
        data: {
            networkDeviceLink: string
        }
    }

    export type SocketMessageHooks = Record<string, Function[]>
}