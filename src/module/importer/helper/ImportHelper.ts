import { Constants } from '../importer/Constants';
import { XMLStrategy } from './XMLStrategy';
import { JSONStrategy } from './JSONStrategy';
import { ImportStrategy } from './ImportStrategy';
import {SR5Item} from "../../item/SR5Item";

export enum ImportMode {
    XML = 1,
    JSON = 2,
}
export enum LookupMode {
    Directory = 0,
    Actor = 1,
}

/**
 * An import helper to standardize data extraction.
 * Mostly conceived to reduced required refactoring if Chummer changes data file layout.
 * Also contains helper methods to safely parse values to appropriate types.
 */
export class ImportHelper {
    public static readonly CHAR_KEY = '_TEXT';

    private static s_Strategy: ImportStrategy = new XMLStrategy();

    public static SetMode(mode: ImportMode) {
        switch (mode) {
            case ImportMode.XML:
                ImportHelper.s_Strategy = new XMLStrategy();
                break;
            case ImportMode.JSON:
                ImportHelper.s_Strategy = new JSONStrategy();
                break;
        }
    }

    private constructor() {}

    /**
     * Helper method to create a new folder.
     * @param name The name of the folder.
     * @param folder The parent folder.
     * @returns {Promise<Folder>} A promise that resolves with the folder object when the folder is created.
     */
    public static async NewFolder(name: string, folder: Folder | null = null) {
        return await Folder.create({
            type: 'Item',
            folder: folder === null ? null : folder.id,
            name: name,
        });
    }

    /**
     * Get / create a folder at a path in the items directory.
     *
     * Traverse path and match folder structure to the last and current path segments.
     *
     * @param path The absolute path of the folder.
     * @param mkdirs If true, will make all folders along the hierarchy if they do not exist.
     * @returns A promise that will resolve with the found folder.
     */
    public static async GetFolderAtPath(path: string, mkdirs: boolean = false): Promise<Folder> {
        let currentFolder,
            lastFolder = null;
        const pathSegments = path.split('/');
        for (const pathSegment of pathSegments) {
             // Check if the path structure matches the folder structure.
            currentFolder = game.folders?.find((folder) => {
                return folder.folder === lastFolder && folder.name === pathSegment
            });

            // Only create when allowed to. Otherwise abort with error.
            if (!currentFolder && !mkdirs) return Promise.reject(`Unable to find folder: ${path}`);
            // Create the missing folder for the current segment
            if (!currentFolder) currentFolder = await ImportHelper.NewFolder(pathSegment, lastFolder);

            lastFolder = currentFolder;
        }

        return Promise.resolve(currentFolder);
    }

    /**
     * Get a value from the the provided jsonData, optionally returning a default value if it is not found
     * or is unable to be parsed to an integer.
     * @param jsonData The data to get the keyed value in.
     * @param key The key to check for the value under.
     * @param fallback An optional default value to return if the key is not found.
     */
    public static IntValue(jsonData: object, key: string, fallback: number | undefined = undefined): number {
        return ImportHelper.s_Strategy.intValue(jsonData, key, fallback);
    }

    /**
     * Get a value from the the provided jsonData, optionally returning a default value if it is not found.
     * @param jsonData The data to get the keyed value in.
     * @param key The key to check for the value under.
     * @param fallback An optional default value to return if the key is not found.
     */
    public static StringValue(jsonData: object, key: string | number, fallback: string | undefined = undefined): string {
        return ImportHelper.s_Strategy.stringValue(jsonData, key, fallback);
    }

    /**
     * Get an object from the the provided jsonData, optionally returning a default value if it is not found.
     * @param jsonData The data to get the keyed value in.
     * @param key The key to check for the value under.
     * @param fallback An optional default value to return if the key is not found.
     */
    public static ObjectValue(jsonData: object, key: string | number, fallback: object | null | undefined = undefined): object | null {
        return ImportHelper.s_Strategy.objectValue(jsonData, key, fallback);
    }

    public static findItem(nameOrCmp: string | ItemComparer): SR5Item {
        let result: any | null;
        if (typeof nameOrCmp === 'string') {
            result = game.items?.find((item) => item.name == nameOrCmp);
        } else {
            result = game.items?.find(nameOrCmp);
        }
        return result;
    }

    public static TranslateCategory(name, jsonCategoryTranslations?) {
        if (jsonCategoryTranslations && jsonCategoryTranslations.hasOwnProperty(name)) {
            return jsonCategoryTranslations[name];
        }

        return name;
    }
    public static async MakeCategoryFolders(
        jsonData: object,
        path: string,
        jsonCategoryTranslations?: object | undefined,
    ): Promise<{ [name: string]: Folder }> {
        let folders = {};
        let jsonCategories = jsonData['categories']['category'];

        for (let i = 0; i < jsonCategories.length; i++) {
            let categoryName = jsonCategories[i][ImportHelper.CHAR_KEY];
            // use untranslated category name for easier mapping during DataImporter.Parse implementations.
            let origCategoryName = categoryName;
            categoryName = ImportHelper.TranslateCategory(categoryName, jsonCategoryTranslations);
            folders[origCategoryName.toLowerCase()] = await ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/${path}/${categoryName}`, true);
        }

        return folders;
    }

    /** Extract the correct <chummer file="${dataFileName}>[...]</chummer> element from xx-xx_data.xml translations.
     *
     * @param jsoni18n
     * @param dataFileName Expected translation target file name
     */
    public static ExtractDataFileTranslation(jsoni18n, dataFileName): object {
        for (let i = 0; i < jsoni18n.length; i++) {
            const translation = jsoni18n[i];
            if (translation.$.file === dataFileName) {
                return translation;
            }
        }
        return {};
    }

    /** Extract categories translations within xx-xx_data.xml <chummer/> translation subset.
     *
     *  Note: Not all file translations provide categories.
     *
     * @param jsonChummeri18n Translations as given by ExtractDataFileTranslations
     */
    public static ExtractCategoriesTranslation(jsonChummeri18n) {
        const categoryTranslations = {};
        if (jsonChummeri18n && jsonChummeri18n.hasOwnProperty('categories')) {
            jsonChummeri18n.categories.category.forEach((category) => {
                const name = category[ImportHelper.CHAR_KEY];
                const translate = category.$.translate;
                categoryTranslations[name] = translate;
            });
        }
        return categoryTranslations;
    }

    /** Extract item type translations within xx-xx_data.xml <chummer/> translation subset.
     *
     * @param jsonItemsi18n Translations as given by ExtractDataFileTranslations
     * @param typeKey The item type to translate. Tends to be plural.
     * @param listKey The item to translate. Tends to be singular.
     */
    public static ExtractItemTranslation(jsonItemsi18n, typeKey, listKey) {
        const itemTranslation = {};
        if (jsonItemsi18n && jsonItemsi18n[typeKey] && jsonItemsi18n[typeKey][listKey] && jsonItemsi18n[typeKey][listKey].length > 0) {
            jsonItemsi18n[typeKey][listKey].forEach((item) => {
                const name = item.name[ImportHelper.CHAR_KEY];
                const translate = item.translate[ImportHelper.CHAR_KEY];
                const altpage = item.altpage[ImportHelper.CHAR_KEY];
                itemTranslation[name] = { translate, altpage };
            });
        }

        return itemTranslation;
    }

    static MapNameToTranslationKey(translationMap, name, key, fallbackValue = ''): string {
        if (translationMap && translationMap.hasOwnProperty(name) && translationMap[name].hasOwnProperty(key)) {
            return translationMap[name][key];
        }

        return fallbackValue;
    }

    public static MapNameToTranslation(translationMap, name): string {
        return ImportHelper.MapNameToTranslationKey(translationMap, name, 'translate', name);
    }

    public static MapNameToPageSource(translationMap, name, fallback='?'): string {
        return ImportHelper.MapNameToTranslationKey(translationMap, name, 'altpage', fallback);
    }
}
export type ItemComparer = (item: Item) => boolean;
