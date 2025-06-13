import { FLAGS, SYSTEM_NAME } from "../constants";
import { SocketMessage } from "../sockets";

/**
 * Handle the global storage setting for the system.
 * 
 * This allows you to store data globally, without a FoundryVTT document, and retrieve it later.
 * Since it's stored within a world setting, this will handle the GM socket updates for you.
 * 
 * NOTE: Foundry doesn´t do it's typical differential merge on updates, nor does it handle unset / delete.
 * 
 * Usage:
 * > const mydata = game.shadowrun5e.storage.get('key1.key2');
 * > mydata.subValue = 'new value';
 * > await game.shadowrun5e.storage.set('key1.key2', mydata);
 */
export const DataStorage = {
    /**
     * Assure a usable data storage, even if data is lost.
     */
    validate: async function () {
        console.debug('Shadowrun 5e | Validating global data storage.');
        const storage = DataStorage.storage();
        if (!storage || typeof storage !== 'object') {
            ui.notifications?.error('Shadowrun 5e | Global data storage has been reset. Please check the console (F12) for more information.');
            console.error('Shadowrun 5e | Global data storage could not be loaded. Resetting to empty object. This might cause some game information to be deleted.', storage);
            await game.settings.set(SYSTEM_NAME, FLAGS.GlobalDataStorage, {});
        }
    },

    /**
     * Retrieve the top level storage object.
     * 
     * @returns object
     */
    storage: function(): any {
        return game.settings.get(SYSTEM_NAME, FLAGS.GlobalDataStorage);
    },

    /**
     * Overwrite the global data storage with a new object.
     * 
     * @param storage The complete global storage. This will fully overwrite the current storage.
     */
    save: async function(storage: any) {
        await game.settings.set(SYSTEM_NAME, FLAGS.GlobalDataStorage, storage);
    },

    /**
     * Retrieve a storage key from the global data storage in a FoundryVTT typical way.
     * @param key A object property string 'key1.key2'
     * @returns any or undefined if not found
     */
    get: function (key: string): any {
        return foundry.utils.getProperty(this.storage(), key);
    },

    /**
     * Store a value in the global data storage.
     * 
     * @param key A object property string 'key1.key2'
     * @param value Any value to store. Take care to not overwrite complete objects, if unwanted.
     */
    set: async function (key: string, value: any) {
        if (game.user?.isGM) await this._setAsGM(key, value);
        else await this._setAsPlayer(key, value);
    },

    /**
     * Store a value in the global data storage as GM, as players lack the permission for it.
     */
    _setAsGM: async function (key: string, value: any) {
        const storage = this.storage();
        console.debug('Shadowrun 5e | Setting a value in global data storage.', key, value, storage);
        foundry.utils.setProperty(storage, key, value);
        await DataStorage.save(storage);
        console.debug('Shadowrun 5e | Value set in global data storage.', storage);
    },

    /**
     * Store a value in the global data storage as a player, by requesting the GM to do it.
     */
    _setAsPlayer: async function (key: string, value: any) {
        console.debug('Shadowrun 5e | Requesting GM to set a value in global data storage.', key, value);
        await SocketMessage.emitForGM(FLAGS.SetDataStorage, {key, value});
    },

    /**
     * Handle socket messages around setting data storage as GM only.
     * @param message.data.key The set method key param
     * @param message.data.value The set method value param
     */
    _handleSetDataStorageSocketMessage: async function (message: Shadowrun.SocketMessageData) {
        if (!game.user?.isGM) return;
        await DataStorage._setAsGM(message.data.key, message.data.value);
    }
}
