import { SR5 } from "../../../config";
import { CompendiumKey, Constants } from './Constants';
import { ParseData } from "../parser/Parser";
import { ImportHelper as IH } from '../helper/ImportHelper';
import ShadowrunItemData = Shadowrun.ShadowrunItemData;
import ShadowrunActorData = Shadowrun.ShadowrunActorData;
const xml2js = require('xml2js');

/**
 * The most basic chummer item data importer, meant to handle one or more Chummer5a data <type>.xml file.
 *
 * Generic type ItemDataType is the items data type DataImporter creates per entry in that Chummer5a data .xml file.
 */
export abstract class DataImporter {
    public static SR5 = SR5;
    public abstract files: string[];
    public static iconList: string[];
    public static setIcons: boolean = true;
    public static supportedBooks: string[] = ['2050'];
    public static translationMap: Record<string, any> = {};

    // Used to filter down a files entries based on category.
    // See filterObjects for use.
    // Leave on null to support all categories.
    public unsupportedCategories: string[]|null = [];

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
    public abstract Parse(chummerData: object): Promise<void>;

    /**
     * Parse an XML string into a JSON object.
     * @param xmlString The string to parse as XML.
     * @returns A json object converted from the string.
     */
    public static async xml2json(xmlString: string): Promise<object> {
        const parser = xml2js.Parser({
            explicitArray: false,
            explicitCharkey: true,
            charkey: IH.CHAR_KEY,
        });

        return (await parser.parseStringPromise(xmlString))['chummer'];
    }

    /**
     * Checks if the provided JSON object originates from a supported book source.
     * 
     * @param jsonObject - The JSON object containing source information.
     * @returns `true` if the source is supported or undefined; otherwise, `false`.
     */
    private static supportedBookSource(jsonObject: ParseData): boolean {
        const source = jsonObject?.source?._TEXT ?? '';
        return !source || this.supportedBooks.includes(source);
    }

    /**
     * Parses an array of input data into an array of output items using a specified parser.
     * 
     * @template TInput - The type of the input data to be parsed.
     * @template TOutput - The type of the parsed output items.
     * 
     * @param inputs - An array of input data to be parsed.
     * @param options - Configuration options for parsing:
     *   - `compendiumKey`: The key to identify the compendium to be used.
     *   - `parser`: An object with a `Parse` method to transform input data into output items.
     *   - `filter`: (Optional) A function to filter input data before parsing.
     *   - `injectActionTests`: (Optional) A function to modify or enhance parsed items.
     *   - `errorPrefix`: (Optional) A prefix for error messages when parsing fails.
     * 
     * @returns A promise that resolves to an array of parsed output items.
     * 
     * @remarks
     * - The function first ensures the specified compendium is loaded.
     * - Each input is filtered (if a filter is provided) and parsed using the provided parser.
     * - If parsing fails, an error notification is displayed with the provided or default error prefix.
     * - Optionally, additional actions can be injected into parsed items using `injectActionTests`.
     */
    protected static async ParseItems<TInput extends ParseData, TOutput extends (ShadowrunActorData | ShadowrunItemData)>(
        inputs: TInput[],
        options: {
            compendiumKey: (data: TInput) => CompendiumKey;
            parser: { Parse: (data: TInput, compendiumKey: CompendiumKey) => Promise<TOutput> };
            filter?: (input: TInput) => boolean;
            injectActionTests?: (item: TOutput) => void;
            errorPrefix?: string;
        }
    ): Promise<void> {
        const { compendiumKey, parser, filter = () => true, injectActionTests, errorPrefix = "Failed Parsing Item"} = options;
        const itemMap = new Map<CompendiumKey, TOutput[]>();

        for (const data of inputs) {
            try {
                if (!this.supportedBookSource(data) || !filter(data)) continue;
                
                const key = compendiumKey(data);
                const item = await parser.Parse(data, key);
                injectActionTests?.(item);

                if (!itemMap.has(key)) itemMap.set(key, []);
                itemMap.get(key)!.push(item);
            } catch (error) {
                console.error(error);
                ui.notifications?.error(`${errorPrefix}: ${data?.name?._TEXT ?? "Unknown"}`);
            }
        };

        for (const [key, items] of itemMap.entries()) {
            await IH.GetCompendium(key);
            const compendium = Constants.MAP_COMPENDIUM_CONFIG[Constants.MAP_COMPENDIUM_KEY[key]];
            await (compendium.type === 'Actor' ? Actor : Item).create(items as any, { pack: compendium.pack });
        }
    }
}
