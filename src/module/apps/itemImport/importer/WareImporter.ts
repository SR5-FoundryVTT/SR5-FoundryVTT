import { DataImporter } from './DataImporter';
import { WareParser } from '../parser/ware/WareParser';
import { Bioware, BiowareSchema } from '../schema/BiowareSchema';
import { Cyberware, CyberwareSchema } from '../schema/CyberwareSchema';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';
import WareItemData = Shadowrun.WareItemData;
type WareTypes = Bioware | Cyberware;

export class WareImporter extends DataImporter {
    public files = ['bioware.xml', 'cyberware.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('biowares') && jsonObject['biowares'].hasOwnProperty('bioware') ||
               jsonObject.hasOwnProperty('cyberwares') && jsonObject['cyberwares'].hasOwnProperty('cyberware');
    }

    async Parse(jsonObject: BiowareSchema | CyberwareSchema): Promise<void> {
        const key = 'biowares' in jsonObject ? 'bioware' : 'cyberware';
        const jsonDatas = 'biowares' in jsonObject ? jsonObject.biowares.bioware
                                                   : jsonObject.cyberwares.cyberware;

        return WareImporter.ParseItems<WareTypes, WareItemData>(
            jsonDatas,
            {
                compendiumKey: () => "Ware",
                parser: new WareParser(key, jsonObject.categories.category),
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                errorPrefix: `Failed Parsing ${key.capitalize()}`
            }
        );
    }
}
