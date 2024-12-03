import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { CyberwareParser } from '../parser/ware/CyberwareParser';
import WareData = Shadowrun.WareData
import WareItemData = Shadowrun.WareItemData;
import CyberwareItemData = Shadowrun.CyberwareItemData;
import BiowareItemData = Shadowrun.BiowareItemData;
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';

export class WareImporter extends DataImporter<WareItemData, WareData> {
    public override categoryTranslations: any;
    public override itemTranslations: any;
    public files = ['cyberware.xml', 'bioware.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('cyberwares') && jsonObject['cyberwares'].hasOwnProperty('cyberware') ||
               jsonObject.hasOwnProperty('biowares') && jsonObject['biowares'].hasOwnProperty('bioware');
    }

    GetDefaultCyberwareData(): CyberwareItemData {
        return this.GetDefaultData({type: 'cyberware', entityType: "Item"}) as CyberwareItemData;
    }

    GetDefaultBiowareData(): BiowareItemData {
        return this.GetDefaultData({type: 'bioware', entityType: "Item"}) as BiowareItemData;

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

    async Parse(jsonObject: object, setIcons: boolean): Promise<Item> {
        const cyberParser = new CyberwareParser();

        let key = jsonObject.hasOwnProperty('cyberwares') ? 'Cyberware' : 'Bioware';
        const folders = await ImportHelper.MakeCategoryFolders("Item", jsonObject, key);

        key = key.toLowerCase();
        let items: WareItemData[] = [];
        let jsonDatas = jsonObject[key + 's'][key];

        this.iconList = await this.getIconFiles();

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
            //@ts-expect-error
            item.folder = folders[category].id;

            // Bioware has no wireless feature, so disable it by default
            if (key === 'bioware') {
                item.system.technology.wireless = false;
            }

            // Import Flags
            item.system.importFlags = this.genImportFlags(item.name, item.type, this.formatAsSlug(category));

            // Default icon
            if (setIcons) {item.img = await this.iconAssign(item.system.importFlags, item.system, this.iconList)};

            // Translate name if needed
            item.name = ImportHelper.MapNameToTranslation(this.itemTranslations, item.name);

            // Add relevant action tests
            UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);

            items.push(item);
        }

        // @ts-expect-error // TODO: TYPE: Remove this.
        return await Item.create(items);
    }
}
