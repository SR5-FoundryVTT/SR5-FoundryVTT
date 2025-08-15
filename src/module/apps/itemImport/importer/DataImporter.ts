import { Parser } from 'xml2js';
import { ParseData, Schemas } from "../parser/Types";
import { ImportHelper as IH } from '../helper/ImportHelper';
import { ChummerFileXML, CompendiumKey, Constants } from './Constants';

/**
 * The most basic chummer item data importer, meant to handle one or more Chummer5a data <type>.xml file.
 *
 * Generic type ItemDataType is the items data type DataImporter creates per entry in that Chummer5a data .xml file.
 */
export abstract class DataImporter {
    public static setIcons = true;
    public static iconList: string[] = [];
    public static overrideDocuments = true;
    public readonly abstract files: readonly ChummerFileXML[];

    /**
     * Parse the specified jsonObject and return Item representations.
     * @param chummerData The JSON data to parse.
     * @returns An array of created objects.
     */
    public abstract Parse(chummerData: Schemas): Promise<void>;

    /**
     * Parse an XML string into a JSON object.
     * @param xmlString The string to parse as XML.
     * @returns A json object converted from the string.
     */
    public static async xml2json(xmlString: string): Promise<Schemas> {
        const parser = new Parser({
            explicitArray: false,
            explicitCharkey: true,
            charkey: IH.CHAR_KEY,
        });

        return (await parser.parseStringPromise(xmlString))['chummer'];
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
    protected static async ParseItems<TInput extends ParseData>(
        inputs: TInput[],
        options: {
            documentType: string;
            compendiumKey: (data: TInput) => CompendiumKey;
            parser: { Parse: (data: TInput, compendiumKey: CompendiumKey) => Promise<Actor.CreateData | Item.CreateData> };
            filter?: (input: TInput) => boolean;
            injectActionTests?: (item: Item.CreateData) => void;
        }
    ): Promise<void> {
        const { compendiumKey, parser, filter, injectActionTests, documentType } = options;
        const itemMap = new Map<CompendiumKey, (Actor.CreateData | Item.CreateData)[]>();
        const compendiums: Partial<Record<CompendiumKey, CompendiumCollection<'Actor' | 'Item'>>> = {};
        const dataInput = filter ? inputs.filter(filter) : inputs;

        let counter = 0;
        let current = 0;
        const total = dataInput.length;
        const progressBar = ui.notifications.info(`Importing ${documentType}`, { progress: true });

        const updateBar = (name: string, message: string) => {
            current += 1;
            progressBar.update({
                pct: current / total,
                message: `${documentType} (${current}/${total}) ${message}: ${name}`,
            });
        }

        for (const data of dataInput) {
            try {
                const id = IH.guidToId(data.id._TEXT);
                const key = compendiumKey(data);
                const compendium = compendiums[key] ??= (await IH.GetCompendium(key));

                if (!this.overrideDocuments && compendium.index.has(id)) {
                    IH.setItem(key, data.name._TEXT, id);
                    updateBar(data.name._TEXT, "skipped, already exists");
                    continue;
                }

                const item = await parser.Parse(data, key);                
                injectActionTests?.(item as Item.CreateData);

                item._id = id;
                IH.setItem(key, data.name._TEXT, id);

                updateBar(data.name._TEXT, "Parsed");
                counter++;

                if (!itemMap.has(key)) itemMap.set(key, []);
                itemMap.get(key)!.push(item);
            } catch (error) {
                console.error(error);
                updateBar(data?.name?._TEXT || "Unknown", "failed to parse");
                ui.notifications?.error(`Failed parsing ${documentType}: ${data?.name?._TEXT ?? "Unknown"}`);
            }
        };

        progressBar.remove();
        const notification = ui.notifications?.info(`${documentType}: Creating ${counter} documents`, { permanent: true });

        for (const [key, items] of itemMap.entries()) {
            const compendium = Constants.MAP_COMPENDIUM_KEY[key];
            await (compendium.type === 'Actor' ? Actor : Item).create(items as any, { pack: "world." + compendium.pack, keepId: true });
        }

        notification.remove();
        ui.notifications?.info(`${documentType}: ${counter} documents created`);
    }
}
