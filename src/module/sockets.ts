import {FLAGS, SYSTEM_SOCKET} from "./constants";
import SocketMessageBody = Shadowrun.SocketMessageData;

/**
 * TODO: Add simple documentation.
 */
export class SocketMessage {
    static _createMessage(type, data, userId?): SocketMessageBody {
        return {type, data, userId}
    }

    static async emit(type, data) {
        const message = SocketMessage._createMessage(type, data);
        console.trace('Emiting Shadowrun5e system socket message', message);
        await game.socket.emit(SYSTEM_SOCKET, message);
    }

    static async emitForGM(type, data) {
        if (game.user.isGM) return console.error('Active user is GM! Aborting socket message...');

        const gmUser = game.users.find(user => user.isGM);
        if (!gmUser) return console.error('No active GM user! One GM must be active for this action to work.');

        const message = SocketMessage._createMessage(type, data, gmUser.id);
        console.trace('Emiting Shadowrun5e system socket message', message);
        await game.socket.emit(SYSTEM_SOCKET, message);
    }
}