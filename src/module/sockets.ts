import {SYSTEM_SOCKET} from "./constants";

/**
 * Simple handling of creating and emitting socket messages
 * Use emit for messages meant for all users
 * > SocketMessage.emit(FLAGS.<yourFlag>, {yourDataField: 'yourData'})
 *
 * Use emitForGM for messages meant only for ONE gm
 * > SocketMessage.emitGM(FLAGS.<yourFlag>, {yourDataField: 'yourData'})
 * 
 * To listen to these socket messages see Hooks#registerSocketListeners
 */
export class SocketMessage {
    static _createMessage(type, data, userId?): Shadowrun.SocketMessageData {
        return {type, data, userId}
    }

    static async emit(type, data) {
        if (!game.socket) return;

        const message = SocketMessage._createMessage(type, data);
        console.trace('Shadowrun 5e | Emitting Shadowrun5e system socket message', message);
        await game.socket.emit(SYSTEM_SOCKET, message);
    }

    static async emitForGM(type, data) {
        if (!game.socket || !game.user || !game.users) return;
        if (game.user.isGM) return console.error('Active user is GM! Aborting socket message...');

        const gmUser = game.users.find(user => user.isGM);
        if (!gmUser) return console.error('No active GM user! One GM must be active for this action to work.');

        const message = SocketMessage._createMessage(type, data, gmUser.id);
        console.trace('Shadowrun 5e | Emitting Shadowrun5e system socket message', message);
        await game.socket.emit(SYSTEM_SOCKET, message);
    }
}