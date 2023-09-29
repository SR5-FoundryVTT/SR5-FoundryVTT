import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { CyberwareParser } from '../parser/ware/CyberwareParser';
import {Helpers} from "../../helpers";
import Ware = Shadowrun.WareItemData;
import CyberwareItemData = Shadowrun.CyberwareItemData;
import BiowareItemData = Shadowrun.BiowareItemData;
import { SR5 } from "../../config";

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

            // Check to ensure the data entry is supported
            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            // Create the item
            const defaultData = key === 'cyberware' ? this.GetDefaultCyberwareData() : this.GetDefaultBiowareData();
            let item = cyberParser.Parse(jsonData, defaultData, this.itemTranslations);
            const category = ImportHelper.StringValue(jsonData, 'category').toLowerCase();
            // TODO: Does this type mixture cause later issues? Will it carry over?
            //@ts-ignore
            item.folder = folders[category].id;

            // Import Flags
            item.system.importFlags.name = foundry.utils.deepClone(item.name); // original english name for matching to icons
            item.system.importFlags.type = item.type;
            item.system.importFlags.subType = '';
            item.system.importFlags.isFreshImport = true;

            // Add the subtype so the importer can add the correct icon
            let subType = category.trim().replace('/', ' ').split(' ').join('-');
            if (SR5.itemSubTypes.cyberware.includes(subType) || SR5.itemSubTypes.bioware.includes(subType)) {
                item.system.importFlags.subType = subType;
            }

            // Default icon
            item.img = await this.iconAssign(item.system.importFlags, item.system);

            // Translate name if needed
            item.name = ImportHelper.MapNameToTranslation(this.itemTranslations, item.name);

            // Add relevant action tests
            Helpers.injectActionTestsIntoChangeData(item.type, item, item);

            items.push(item);
        }

        // @ts-ignore // TODO: TYPE: Remove this.
        return await Item.create(items);
    }
}
