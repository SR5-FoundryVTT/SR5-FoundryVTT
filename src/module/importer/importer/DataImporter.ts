import { DataDefaults } from './../../data/DataDefaults';
import { ImportHelper } from '../helper/ImportHelper';
import * as IconAssign from '../../apps/iconAssigner/iconAssign';

const xml2js = require('xml2js');

/**
 * The most basic chummer item data importer, meant to handle one or more Chummer5a data <type>.xml file.
 *
 * Generic type ItemDataType is the items data type DataImporter creates per entry in that Chummer5a data .xml file.
 */
export abstract class DataImporter<ItemDataType, ItemSystemDataType> {
    public abstract files: string[];
    public static jsoni18n: any;
    public categoryTranslations: any;
    public itemTranslations: any;
    public static unsupportedBooks: string[] = ['2050'];
    public iconList: string[];

    // Used to filter down a files entries based on category.
    // See filterObjects for use.
    // Leave on null to support all categories.
    public unsupportedCategories: string[]|null = [];

    /**
     * Get complete item data.
     *
     * NOTE: We use temporary items to have a full set of item data instead of just
     *       system model data that game.model.Item would give us.
     */
    public GetDefaultData({type}:{type:any}) {
        return DataDefaults.baseItemData<ItemDataType, ItemSystemDataType>({type});
    }

    /**
     *
     * @param jsonObject JSON Data with all data translations for one language.
     */
    public static CanParseI18n(jsonObject: any): boolean {
        return jsonObject.hasOwnProperty('chummer') && jsonObject.chummer.length > 0 && jsonObject.chummer[0].$.hasOwnProperty('file');
    }

    /**
     * Stores translations as a whole for all implementing classes to extract from without reparsing.
     * @param jsonObject JSON Data with all data translations for one language.
     */
    public static ParseTranslation(jsonObject: object) {
        if (jsonObject && jsonObject.hasOwnProperty('chummer')) {
            DataImporter.jsoni18n = jsonObject['chummer'];
        }
    }
    /**
     * Implementing classes can use ExtractTranslation to only extract needed translations.
     */
    public abstract ExtractTranslation(fileName?: string);

    /**
     * Validate if this importer is capable of parsing the provided JSON data.
     * @param jsonObject JSON data to check import capability for.
     * @returns boolean True if the importer is capable of parsing the provided XML data.
     */
    public abstract CanParse(jsonObject: object): boolean;

    /**
     * Parse the specified jsonObject and return Item representations.
     * @param chummerData The JSON data to parse.
     * @returns An array of created objects.
     */
    public abstract Parse(chummerData: object, setIcons: boolean): Promise<Item>;

    /**
     * Get the appropriate default icon
     * @param importFlags The importFlags data of an item
     * @param system The item's system data
     */
    public iconAssign(importFlags: Shadowrun.ImportFlagData, system: Object, iconList: string[]): Promise<string> {
        // if (!this.iconList) this.getIconFiles();
        return IconAssign.iconAssign(importFlags, system, iconList);
    }

    /**
     * Gets a list of icons available in the importer's folder
     */
    public async getIconFiles(): Promise<string[]> {
        return IconAssign.getIconFiles();
    }

    /**
     * Reformat the subtype's name so it matches the categories in config.ts
     * @param name The item's subtype name
     */
    public formatSubtypeName(name: string): string {
        return name.trim().toLowerCase().split((/-| |\//)).join('-');
    }

    /**
     * Generate default import flags
     * @param name The item's English name
     * @param type The item's type
     */
    public genImportFlags(name: string, type: string): Shadowrun.ImportFlagData {
        const flags = {
            name: foundry.utils.deepClone(name), // original english name for matching to icons
            type: type,
            subType: '',
            isFreshImport: true
        }
        return flags;
    }

    /**
     * Parse an XML string into a JSON object.
     * @param xmlString The string to parse as XML.
     * @returns A json object converted from the string.
     */
    public static async xml2json(xmlString: string): Promise<object> {
        const parser = xml2js.Parser({
            explicitArray: false,
            explicitCharkey: true,
            charkey: ImportHelper.CHAR_KEY,
        });

        return (await parser.parseStringPromise(xmlString))['chummer'];
    }

    public static unsupportedBookSource(jsonObject) {
        if (!jsonObject.hasOwnProperty('source')) return false;
        const source = ImportHelper.StringValue(jsonObject, 'source', '');
        return DataImporter.unsupportedBooks.includes(source);
    }

    public static unsupportedEntry(jsonObject) {
        if (DataImporter.unsupportedBookSource(jsonObject)) {
            return true;
        }

        return false;
    }

    /**
     * Filter down objects to those actaully imported.
     *
     * Sometimes a single Chummer xml file contains mulitple 'categories' that don't mix with system types
     *
     * @param objects
     * @returns A subset of objects
     */
    filterObjects(objects: any[]) {
        if (!this.unsupportedCategories) return objects;
        //@ts-ignore
        return objects.filter(object => !this.unsupportedCategories.includes(ImportHelper.StringValue(object, 'category', '')));
    }
}
