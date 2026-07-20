import { FLAGS, SYSTEM_NAME } from "../constants";
import { SocketMessage } from "../sockets";

/**
 * Serialized top level storage sections of the last seen storage state.
 *
 * Used to tell which sections a storage update actually touched, as the setting onChange
 * only ever hands over the complete storage.
 */
let lastSeenSections: Record<string, string> = {};

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
     * Determine which top level storage keys changed compared to the last check.
     *
     * Each call consumes the diff and becomes the baseline for the next one, so this is
     * meant to be called once per storage change, from the setting onChange. Call it once
     * during startup (see validate) to seed the baseline with the loaded storage.
     *
     * @param storage The current complete storage.
     * @returns The changed (added, removed or modified) top level keys.
     */
    changedKeys: function (storage: object | undefined): string[] {
        const sections: Record<string, string> = {};
        for (const [key, value] of Object.entries(storage ?? {})) {
            sections[key] = JSON.stringify(value);
        }

        const keys = new Set([...Object.keys(sections), ...Object.keys(lastSeenSections)]);
        const changed = [...keys].filter(key => sections[key] !== lastSeenSections[key]);

        lastSeenSections = sections;
        return changed;
    },

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

        // Take the loaded storage as the baseline, so the first update after startup only
        // reports the sections it actually changed instead of all of them.
        DataStorage.changedKeys(DataStorage.storage());
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
     * Players lack the permission to write world settings, so they hand the write over to
     * an active GM instead.
     *
     * @param key A object property string 'key1.key2'
     * @param value Any value to store. Take care to not overwrite complete objects, if unwanted.
     */
    set: async function (key: string, value: any) {
        if (!game.user?.isGM) {
            console.debug('Shadowrun 5e | Requesting GM to set a value in global data storage.', key, value);
            return SocketMessage.emitForGM(FLAGS.SetDataStorage, { key, value });
        }

        const storage = this.storage();
        console.debug('Shadowrun 5e | Setting a value in global data storage.', key, value, storage);
        foundry.utils.setProperty(storage, key, value);
        await DataStorage.save(storage);
        console.debug('Shadowrun 5e | Value set in global data storage.', storage);
    },

    /**
     * Remove a key from the global data storage.
     *
     * Foundry doesn't handle unset on settings, so the containing object is rewritten.
     * As with set, players hand the write over to an active GM.
     *
     * @param key A object property string 'key1.key2'
     */
    unset: async function (key: string) {
        if (!game.user?.isGM) {
            console.debug('Shadowrun 5e | Requesting GM to unset a value in global data storage.', key);
            return SocketMessage.emitForGM(FLAGS.UnsetDataStorage, { key });
        }

        const storage = this.storage();

        const path = key.split('.');
        const property = path.pop();
        if (!property) return;

        const parent = path.length ? foundry.utils.getProperty(storage, path.join('.')) : storage;
        if (!parent || typeof parent !== 'object') return;

        console.debug('Shadowrun 5e | Unsetting a value in global data storage.', key, storage);
        delete (parent as Record<string, unknown>)[property];
        await DataStorage.save(storage);
    },

    /**
     * Handle socket messages around setting data storage as GM only.
     * @param message.data.key The set method key param
     * @param message.data.value The set method value param
     */
    _handleSetDataStorageSocketMessage: async function (message: Shadowrun.SocketMessageData) {
        if (!game.user?.isGM) return;

        await DataStorage.set(message.data.key, message.data.value);
    },

    /**
     * Handle socket messages around unsetting data storage as GM only.
     * @param message.data.key The unset method key param
     */
    _handleUnsetDataStorageSocketMessage: async function (message: Shadowrun.SocketMessageData) {
        if (!game.user?.isGM) return;

        await DataStorage.unset(message.data.key);
    }
}
