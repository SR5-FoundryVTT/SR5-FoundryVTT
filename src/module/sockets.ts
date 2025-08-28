import {SYSTEM_SOCKET} from "./constants";
import SocketMessageBody = Shadowrun.SocketMessageData;

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
    static _createMessage(type, data, userId?): SocketMessageBody {
        return {type, data, userId}
    }

    static emit(type, data) {
        if (!game.socket) return;

        const message = SocketMessage._createMessage(type, data);
        console.trace('Shadowrun 5e | Emitting Shadowrun5e system socket message', message);
        game.socket.emit(SYSTEM_SOCKET, message);
    }

    /**
     * Execute this message in the context of an active GM user.
     * This will be assured before the registered handleres are executed in a pre-call check.
     * Only the GM user matching the id given in the message will receive the message.
     * 
     * @param type 
     * @param data 
     * @returns 
     */
    static emitForGM(type, data) {
        if (!game.socket || !game.user || !game.users) return;
        if (game.user.isGM) return console.error('Active user is GM! Aborting socket message...');

        SocketMessage._assertActiveGMUser();

        const gmUser = game.users.find(user => user.isGM);
        if (!gmUser) return console.error('No active GM user! One GM must be active for this action to work.');

        const message = SocketMessage._createMessage(type, data, gmUser.id);
        console.trace('Shadowrun 5e | Emitting Shadowrun5e system socket message', message);
        game.socket.emit(SYSTEM_SOCKET, message);
    }

    /**
     * Assert at least one active GM user to avoid confusing bugs when none is present and gm socket message
     * aren´t handeled.
     * 
     * If that's the case, also inform users to avoid confusion.
     */
    static _assertActiveGMUser() {
        if (!game.users) return;
        for (const user of game.users) {
            if (user.active && user.isGM) return;
        }
        ui.notifications?.error('There is no active GM user to perform this action. Please ask your GM to logon.');
        throw new Error('Shadowrun 5e | No active GM user found.');
    }
}
