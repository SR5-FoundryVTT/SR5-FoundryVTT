
declare namespace Shadowrun {
    export interface SocketMessageData {
        type: string,
        data: any,
        userId?: string
    }

    export interface SocketAddMasterMessageData extends SocketMessageData {
        data: {
            masterLink: string,
            slaveLink: string
        }
    }

    export interface SocketRemoveMasterSocketMessageData extends SocketMessageData {
        data: {
            slaveLink: string
        }
    }

    export type SocketMessageHooks = Record<string, Function[]>
}