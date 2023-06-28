import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { CyberwareParser } from '../parser/ware/CyberwareParser';
import {Helpers} from "../../helpers";
import Ware = Shadowrun.WareItemData;
import CyberwareItemData = Shadowrun.CyberwareItemData;
import BiowareItemData = Shadowrun.BiowareItemData;

export class WareImporter extends DataImporter<Ware, Shadowrun.WareData> {
    public override categoryTranslations: any;
    public override itemTranslations: any;
    public files = ['cyberware.xml', 'bioware.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('cyberwares') && jsonObject['cyberwares'].hasOwnProperty('cyberware') ||
               jsonObject.hasOwnProperty('biowares') && jsonObject['biowares'].hasOwnProperty('bioware');
    }

    GetDefaultCyberwareData(): CyberwareItemData {
        return this.GetDefaultData({type: 'cyberware'}) as CyberwareItemData;
    }

    GetDefaultBiowareData(): BiowareItemData {
        return this.GetDefaultData({type: 'bioware'}) as BiowareItemData;
    
    }

    ExtractTranslation(fileName) {
        if (!DataImporter.jsoni18n) {
            return;
        }

        let jsonItemi18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, fileName);
         // TODO: Move ExtractTranslation phase before the parsing phase and initiate it with the filename to parse.
            if (this.files.length !== 2) console.error('Lazily hacked code will fail for more or less than two files.');

        this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonItemi18n);

        const {typeKey, listKey} = fileName === 'cyberware.xml' ?
                {typeKey: 'cyberwares', listKey: 'cyberware'} :
                {typeKey: 'biowares', listKey: 'bioware'};

        this.itemTranslations = ImportHelper.ExtractItemTranslation(jsonItemi18n, typeKey, listKey);
    }

    async Parse(jsonObject: object): Promise<Item> {
        const cyberParser = new CyberwareParser();

        let key = jsonObject.hasOwnProperty('cyberwares') ? 'Cyberware' : 'Bioware';
        const folders = await ImportHelper.MakeCategoryFolders(jsonObject, key);

        key = key.toLowerCase();
        let items: Ware[] = [];
        let jsonDatas = jsonObject[key + 's'][key];
        for (let i = 0; i < jsonDatas.length; i++) {
            let jsonData = jsonDatas[i];

            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            const defaultData = key === 'cyberware' ? this.GetDefaultCyberwareData() : this.GetDefaultBiowareData();
            let item = cyberParser.Parse(jsonData, defaultData, this.itemTranslations);
            
            const category = ImportHelper.StringValue(jsonData, 'category');

            // TODO: Does this type mixture cause later issues? Will it carry over?
            //@ts-ignore
            item.folder = folders[category.toLowerCase()].id;

            // // TODO: Follow ComplexFormParserBase approach.
            // data.name = ImportHelper.MapNameToTranslation(this.itemTranslations, data.name);
            Helpers.injectActionTestsIntoChangeData(item.type, item, item);

            // TODO: Move this to a more general base class
            item.img = this.iconAssign(item.type, item.name, item.system);

            items.push(item);
        }

        // @ts-ignore // TODO: TYPE: Remove this.
        return await Item.create(items);
    }
}
