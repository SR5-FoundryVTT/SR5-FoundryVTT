import { DataDefaults } from '.././../../data/DataDefaults';
import { ImportHelper } from '../helper/ImportHelper';
import * as IconAssign from '../../../apps/iconAssigner/iconAssign';
import { SR5 } from "../../../config";
import { SR5Actor } from '../../../actor/SR5Actor';

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
    public static SR5: object = SR5;

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
    public GetDefaultData({ type, entityType }: { type: any; entityType: keyof Game["model"] }) {
        return DataDefaults.baseEntityData<ItemDataType, ItemSystemDataType>(
            entityType,
            { type }
        );
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
    public abstract Parse(chummerData: object, setIcons: boolean): Promise<Item|StoredDocument<SR5Actor>[]>;

    /**
     * Get the appropriate default icon
     * @param importFlags The importFlags data of an item
     * @param system The item's system data
     */
    public iconAssign(importFlags: Shadowrun.ImportFlagData, system: any, iconList: string[]): Promise<string> {
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
     * Reformat the name or subtype name so it matches the categories in config.ts
     * @param name The item's name or subtype name to reformat
     */
    public formatAsSlug(name: string): string {
        return name.trim().toLowerCase().replace((/'|,|\[|\]|\(|\)/g), '').split((/-|\s|\//g)).join('-');
    }

    /**
     * Set the subtype
     * @param name The item's English name
     * @param type The item's type
     * @param subType The item's subtype
     */
    public genImportFlags(name: string, type: string, subType: string): Shadowrun.ImportFlagData {
        const flags = {
            name: this.formatAsSlug(name), // original english name
            type: type,
            subType: '',
            isFreshImport: true
        }
        if (subType && Object.keys(SR5.itemSubTypeIconOverrides[type]).includes(subType)) {
            flags.subType = subType;
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
    filterObjects<T>(objects: T) : T {
        if (!this.unsupportedCategories) return objects;
        //@ts-expect-error
        return objects.filter(object => !this.unsupportedCategories.includes(ImportHelper.StringValue(object, 'category', '')));
    }
}
