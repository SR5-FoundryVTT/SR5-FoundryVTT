import { Constants } from "./Constants";
import { DataImporter } from './DataImporter';
import { BiowareParser } from '../parser/ware/BiowareParser';
import { CyberwareParser } from '../parser/ware/CyberwareParser';
import { Bioware, BiowareSchema } from '../schema/BiowareSchema';
import { Cyberware, CyberwareSchema } from '../schema/CyberwareSchema';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';
import WareItemData = Shadowrun.WareItemData;
type WareTypes = Bioware | Cyberware;

export class WareImporter extends DataImporter {
    public files = ['cyberware.xml', 'bioware.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('biowares') && jsonObject['biowares'].hasOwnProperty('bioware') ||
               jsonObject.hasOwnProperty('cyberwares') && jsonObject['cyberwares'].hasOwnProperty('cyberware');
    }

    static parserWrap = class {
        constructor(private wareType: 'bioware' | 'cyberware') {}

        public async Parse(jsonData: WareTypes): Promise<WareItemData> {
            const biowareParser = new BiowareParser();
            const cyberwareParser = new CyberwareParser();

            const selectedParser = this.wareType === 'bioware' ? biowareParser : cyberwareParser;

            return await selectedParser.Parse(jsonData);
        }
    };

    async Parse(jsonObject: BiowareSchema | CyberwareSchema): Promise<void> {
        const key = 'biowares' in jsonObject ? 'bioware' : 'cyberware';
        const jsonDatas = 'biowares' in jsonObject ? jsonObject.biowares.bioware
                                                   : jsonObject.cyberwares.cyberware;

        const items = await WareImporter.ParseItems<WareTypes, WareItemData>(
            jsonDatas,
            {
                compendiumKey: "Item",
                parser: new WareImporter.parserWrap(key),
                filter: jsonData => !DataImporter.unsupportedEntry(jsonData),
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                errorPrefix: `Failed Parsing ${key.capitalize()}`
            }
        );

        // @ts-expect-error // TODO: TYPE: Remove this.
        await Item.create(items, { pack: Constants.MAP_COMPENDIUM_KEY['Item'].pack });
    }
}
