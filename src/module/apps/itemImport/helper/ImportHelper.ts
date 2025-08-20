import { Constants, CompendiumKey, ChummerFile } from '../importer/Constants';

export type OneOrMany<T> = T | T[];
export type ArrayItem<T> = T extends (infer U)[] ? U : never;
export type NotEmpty<T> = T extends object ? NonNullable<T> : never;
export type RetrievedItem = Item.Source & { name_english: string };

/**
 * A utility class providing helper methods for importing and managing data in Foundry VTT.
 * Includes functionality for handling compendiums, folders, and data normalization.
 * Designed to streamline data processing and reduce the impact of structural changes in external data sources.
 */
export class ImportHelper {
    public static readonly CHAR_KEY = '_TEXT';
    private static readonly folders: Record<string, Promise<Folder>> = {};
    private static readonly categoryMap: Partial<Record<ChummerFile, Record<string, string>>> = {};
    private static readonly nameToId: Partial<Record<CompendiumKey, Record<string, string>>> = {};
    private static readonly idToName: Partial<Record<CompendiumKey, Record<string, string>>> = {};

    /**
     * Ensures the provided value is returned as an array.
     * If the value is already an array, it is returned as-is.
     * If the value is a single item, it is wrapped in an array.
     * If the value is null or undefined, an empty array is returned.
     *
     * @template T The type of the elements.
     * @param {T | T[] | undefined | null} value The input value to normalize.
     * @returns {T[]} An array containing the input value(s), or an empty array.
    */
    public static getArray<T>(value: T | T[] | undefined | null): T[] {
        if (value)
            return Array.isArray(value) ? value : [value];
        return [];
    }

    /**
     * Reformat the name or subtype name so it matches the categories in config.ts
     * @param name The item's name or subtype name to reformat
     */
    public static formatAsSlug(name: string): string {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    public static guidToId(guid: string): string {
        const cleanGuid = guid.replace(/-/g, '');
        const big = BigInt('0x' + cleanGuid);

        const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';

        let num = big;
        if (num === 0n) result = '0';
        while (num > 0n) {
            result = chars[Number(num % 62n)] + result;
            num /= 62n;
        }

        return result.padStart(16, '0').slice(-16);
    }

    public static setTranslatedCategory(key: ChummerFile, categories: { _TEXT: string; $?: { translate?: string; }; }[]) {
        const map = (this.categoryMap[key] ??= {});
        for (const { _TEXT: name, $ } of categories)
            map[name] = $?.translate ?? name;
    }

    public static getTranslatedCategory(key: ChummerFile, name: string): string {
        const entry = this.categoryMap[key]?.[name];
        return entry ?? name;
    }

    public static setItem(compKey: CompendiumKey, name: string, id: string) {
        this.nameToId[compKey] ??= {};
        this.idToName[compKey] ??= {};
        this.nameToId[compKey][name] ??= id;
        this.idToName[compKey][id] ??= name;
    }

    /**
     * Finds items in the given compendium by name, clones them with a new ID,
     * and adds their original English name for tracking purposes.
     *
     * @param compKey - The compendium category key to search in.
     * @param names   - List of item names to retrieve.
     * @returns Promise resolving to the cloned items.
     */
    public static async findItems(
        compKey: CompendiumKey,
        names: string[],
    ): Promise<RetrievedItem[]> {
        if (!names.length) return [];

        const pack = game.packs?.get(
            `world.${Constants.MAP_COMPENDIUM_KEY[compKey].pack}`
        ) as CompendiumCollection<'Item'>;

        const ids = names
            .map(n => this.nameToId[compKey]?.[n])
            .filter((id): id is string => !!id);

        const docs =
            names.length === 1
                ? [await pack.getDocument(ids[0])] as Item.Stored[]
                : await pack.getDocuments({ _id__in: ids }) as Item.Stored[];
        return docs.map(doc => ({
            ...game.items.fromCompendium(doc) as RetrievedItem,
            name_english: this.idToName[compKey]![doc._id]
        }));
    }

    public static async getItem(
        compKey: CompendiumKey | null,
        itemData: { chummerId: string | null; name: string; name_english?: string }
    ) {
        if (!compKey) return null;
        const pack = game.packs?.get(
            `world.${Constants.MAP_COMPENDIUM_KEY[compKey].pack}`
        ) as CompendiumCollection<'Item'>;
        if (!pack) return null;

        let item: Item.Stored | undefined | null;

        if (itemData.chummerId) {
            const id = this.guidToId(itemData.chummerId);
            item = await pack.getDocument(id);
        }

        if (!item)
            item = pack.getName(itemData.name);

        if (!item && itemData.name_english)
            item = pack.getName(itemData.name_english);

        return item ? game.items.fromCompendium(item) as Item.CreateData : null;
    }

    /**
     * Helper method to create a new folder.
     * @param ctype The compendium key identifying the target compendium.
     * @param name The name of the folder.
     * @param folder The parent folder, or `null` if the folder is at the root level.
     * @returns {Promise<Folder>} A promise that resolves with the folder object when the folder is created.
     */
    public static async NewFolder(ctype: CompendiumKey, name: string, folder: Folder | null = null): Promise<Folder> {
        const { pack, type } = Constants.MAP_COMPENDIUM_KEY[ctype];

        const folderCreated = await Folder.create({ name, type, folder: folder?.id ?? null }, { pack: "world." + pack });

        if (!folderCreated) throw new Error("Folder creation failed.");
        return folderCreated;
    }

    /**
     * Finds or creates a folder within a compendium in Foundry VTT.
     * 
     * @param ctype - The compendium key identifying the target compendium.
     * @param name - The name of the folder to find or create.
     * @param parent - The parent folder, or `null` if the folder is at the root level.
     * @returns A promise that resolves to the found or newly created folder.
     * 
     * @remarks
     * This function first attempts to locate an existing folder in the specified compendium
     * that matches the given name and parent. If no such folder exists, it creates a new one.
     * Note: The `folders` property is not officially typed but is available in Foundry VTT v12.
     */
    private static async FindOrCreateFolder(ctype: CompendiumKey, name: string, parent: Folder | null = null): Promise<Folder> {
        const compendium = await this.GetCompendium(ctype);

        const folder = compendium.folders?.find((folder: Folder) =>
            folder.name === name && folder.folder === parent
        );

        return folder || this.NewFolder(ctype, name, parent);
    }

    /**
     * Helper method to create a new folder for the import compendium tab.
     * @param name The name of the folder.
     * @param parent The parent folder, or `null` if the folder is at the root level.
     * @returns {Promise<Folder>} A promise that resolves with the folder object when the folder is created.
     */
    private static async getCompendiumFolder(name: string, parent: Folder | null = null): Promise<Folder> {
        let folder = game.folders?.find(f => f.name === name && f.type === "Compendium" && f.folder === parent);
        if (!folder)
            folder = await Folder.create({ name, color: "#00cc00", folder: parent?.id ?? null, type: "Compendium" });
        return folder!;
    }

    /**
     * Retrieves a compendium by its mapped key. If the compendium does not exist, it will be created with the corresponding metadata.
     *
     * @param ctype The compendium key (e.g., "Actor" or "Item") mapped in MAP_COMPENDIUM_KEY.
     * @returns A promise that resolves with the compendium collection.
     * @throws If the compendium key is invalid or improperly formatted.
     */
    public static async GetCompendium(ctype: CompendiumKey) {
        const { pack, type, folder, subFolder } = Constants.MAP_COMPENDIUM_KEY[ctype];
        let compendium = game.packs.get("world." + pack) as CompendiumCollection<'Actor' | 'Item'>;

        // Create the compendium if it doesn't exist
        if (!compendium) {
            if (!pack) throw new Error(`Invalid compendium key: ${pack}`);

            // Manually assign compendium to the folder via settings
            let currentFolder = await this.getCompendiumFolder(game.i18n.localize(`SR5.Compendiums.Folders.Root`));

            if (folder) {
                currentFolder = await this.getCompendiumFolder(game.i18n.localize(`SR5.Compendiums.Folders.${folder}`), currentFolder);
                if (subFolder)
                    currentFolder = await this.getCompendiumFolder(game.i18n.localize(`SR5.Compendiums.Folders.${subFolder}`), currentFolder);
            }

            // Create the compendium pack
            compendium = await foundry.documents.collections.CompendiumCollection.createCompendium({
                type,
                name: pack,
                label: game.i18n.localize(`SR5.Compendiums.${pack}`)
            }, { folder: currentFolder?.id ?? null });
        }

        return compendium;
    }

    /**
     * Ensures a folder hierarchy exists based on provided names.
     * Uses caching to minimize redundant operations.
     * 
     * @param ctype - Compendium key for folder categorization.
     * @param folder1 - First-level folder name.
     * @param folder2 - (Optional) Second-level folder name.
     * @param folder3 - (Optional) Third-level folder name.
     * @returns Promise resolving to the deepest folder.
     */
    public static async getFolder(ctype: CompendiumKey, folder1: string, folder2?: string, folder3?: string): Promise<Folder> {
        let path = ctype + '.' + folder1;
        let folder = this.folders[path] ??= this.FindOrCreateFolder(ctype, folder1);

        path += "." + folder2;
        if (folder2)
            folder = this.folders[path] ??= this.FindOrCreateFolder(ctype, folder2, await folder);

        path += "." + folder3;
        if (folder3)
            folder = this.folders[path] ??= this.FindOrCreateFolder(ctype, folder3, await folder);

        return folder;
    }
}
