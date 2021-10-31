import { ImportHelper } from '../helper/ImportHelper';

const xml2js = require('xml2js');

export abstract class DataImporter {
    public abstract files: string[];
    public static jsoni18n: any;
    public categoryTranslations: any;
    public entryTranslations: any;
    public static unsupportedBooks: string[] = ['2050'];

    /**
     * Get default data for constructing a TItem.
     */
    public abstract GetDefaultData(): any;

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
     * @param jsonObject The JSON data to parse.
     * @returns An array of created objects.
     */
    public abstract Parse(jsonObject: object): Promise<Item>;

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
}
