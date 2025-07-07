import { BaseItem } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents.mjs';
import { SR5Item } from "../../../item/SR5Item";
import { Constants, CompendiumKey } from '../importer/Constants';
import { TranslationHelper as TH } from './TranslationHelper';

export type OneOrMany<T> = T | T[];
export type ArrayItem<T> = T extends (infer U)[] ? U : never;
export type NotEmpty<T> = T extends object ? NonNullable<T> : never;
type SplitPack<T extends string> = T extends `${infer Scope}.${infer PackName}` ? [Scope, PackName] : never;

/**
 * A utility class providing helper methods for importing and managing data in Foundry VTT.
 * Includes functionality for handling compendiums, folders, and data normalization.
 * Designed to streamline data processing and reduce the impact of structural changes in external data sources.
 */
export class ImportHelper {
    public static readonly CHAR_KEY = '_TEXT';
    private static readonly folders: Record<string, Promise<Folder>> = {};

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

    /**
     * Finds items in a compendium by name and optional type.
     * 
     * @param compKey - Compendium key mapped in `Constants.MAP_COMPENDIUM_KEY`.
     * @param name - Name(s) to search for, translated via `TH.getTranslation`.
     * @param types - (Optional) Type(s) to filter results.
     * @returns Promise resolving to matching `SR5Item` array or empty if none.
     */
    public static async findItem(
        compKey: CompendiumKey,
        name: OneOrMany<string>,
        types?: OneOrMany<BaseItem['data']['type']>
    ): Promise<SR5Item[]> {
        if (Array.isArray(name) ? name.length === 0 : !name) return [];

        type ItemType = CompendiumCollection<CompendiumCollection.Metadata & {type: 'Item'}>;
        const pack = game.packs?.get(Constants.MAP_COMPENDIUM_CONFIG[Constants.MAP_COMPENDIUM_KEY[compKey]].pack) as ItemType;

        return pack.getDocuments({
            name__in: this.getArray(name),
            ...(types ? { type__in: this.getArray(types) } : {})
        });
    }

    private static async getCompendiumFolder(name: string, parent?: Folder): Promise<Folder> {
        // @ts-expect-errorx
        let folder = game.folders?.find(f => f.name === name && f.type === "Compendium" && (!parent || f.folder === parent));
        if (!folder) {
            folder = await Folder.create({
                name,
                color: "#00cc00",
                // @ts-expect-error
                type: "Compendium",
                folder: parent?.id ?? null
            });
        }
        return folder!;
    }

    /**
     * Retrieves a compendium by its mapped key. If the compendium does not exist, it will be created with the corresponding metadata.
     *
     * @param ctype The compendium key (e.g., "Actor" or "Item") mapped in MAP_COMPENDIUM_KEY.
     * @returns A promise that resolves with the compendium collection.
     * @throws If the compendium key is invalid or improperly formatted.
     */
    public static async GetCompendium(ctype: CompendiumKey): Promise<CompendiumCollection<CompendiumCollection.Metadata>> {
        const { pack, type, folder, subFolder } = Constants.MAP_COMPENDIUM_CONFIG[Constants.MAP_COMPENDIUM_KEY[ctype]];
        let compendium = game.packs.get(pack);

        // Create the compendium if it doesn't exist
        if (!compendium) {
            const [scope, packName] = pack.split(".") as SplitPack<typeof pack>;
            if (!scope || !packName) throw new Error(`Invalid compendium key: ${pack}`);

            // Create the compendium pack
            compendium = await CompendiumCollection.createCompendium({
                name: packName,
                label: game.i18n.localize(`SR5.Compendiums.${packName}`),
                type: type,
                package: scope,
                private: false,
                path: `packs/${packName}`,
                ownership: {
                    PLAYER: "OBSERVER",
                    TRUSTED: "OBSERVER",
                    ASSISTANT: "OWNER"
                }
            });

            // Manually assign compendium to the folder via settings
            let currentFolder = await this.getCompendiumFolder(game.i18n.localize(`SR5.Compendiums.Folders.Root`));

            if (folder) {
                currentFolder = await this.getCompendiumFolder(game.i18n.localize(`SR5.Compendiums.Folders.${folder}`), currentFolder);
                if (subFolder)
                    currentFolder = await this.getCompendiumFolder(game.i18n.localize(`SR5.Compendiums.Folders.${subFolder}`), currentFolder);
            }

            const config = game.settings.get("core", "compendiumConfiguration") ?? {};
            Object.assign(config, { [pack]: { folder: currentFolder?.id ?? null } });
            await game.settings.set("core", "compendiumConfiguration", config);
        }

        return compendium;
    }

    /**
     * Helper method to create a new folder.
     * @param ctype The compendium key identifying the target compendium.
     * @param name The name of the folder.
     * @param folder The parent folder, or `null` if the folder is at the root level.
     * @returns {Promise<Folder>} A promise that resolves with the folder object when the folder is created.
     */
    public static async NewFolder(ctype: CompendiumKey, name: string, folder: Folder | null = null): Promise<Folder> {
        const { pack, type } = Constants.MAP_COMPENDIUM_CONFIG[Constants.MAP_COMPENDIUM_KEY[ctype]];

        const folderCreated = await Folder.create({ name, type, folder: folder?.id ?? null }, { pack });

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

        //@ts-expect-error
        const folder = await compendium.folders?.find((folder: Folder) =>
            folder.name === name && folder.folder === parent
        );

        return folder || this.NewFolder(ctype, name, parent);
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
