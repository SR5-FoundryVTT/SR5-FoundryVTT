declare namespace Shadowrun {
    export interface SocketMessageData {
        type: string,
        data: any,
        userId?: string
    }

    export type SocketMessageHooks = Record<string, Function[]>
}