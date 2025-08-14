import { DataImporter } from './DataImporter';
import { WareParser } from '../parser/ware/WareParser';
import { ImportHelper as IH } from '../helper/ImportHelper';
import { Bioware, BiowareSchema } from '../schema/BiowareSchema';
import { Cyberware, CyberwareSchema } from '../schema/CyberwareSchema';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';
type WareTypes = Bioware | Cyberware;

export class WareImporter extends DataImporter {
    public readonly files = ['bioware.xml', 'cyberware.xml'] as const;

    CanParse(jsonObject: object): boolean {
        return (jsonObject.hasOwnProperty('biowares') && jsonObject['biowares'].hasOwnProperty('bioware')) ||
               (jsonObject.hasOwnProperty('cyberwares') && jsonObject['cyberwares'].hasOwnProperty('cyberware'));
    }

    async Parse(jsonObject: BiowareSchema | CyberwareSchema): Promise<void> {
        const key = 'biowares' in jsonObject ? 'bioware' : 'cyberware';

        IH.setTranslatedCategory(key, jsonObject.categories.category);

        const jsonDatas = 'biowares' in jsonObject ? jsonObject.biowares.bioware
                                                   : jsonObject.cyberwares.cyberware;

        return WareImporter.ParseItems<WareTypes>(
            jsonDatas,
            {
                compendiumKey: () => "Ware",
                parser: new WareParser(key, jsonObject.categories.category),
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                documentType: `${key.capitalize()}`
            }
        );
    }
}
