import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { SpellParserBase } from '../parser/spell/SpellParserBase';
import { CombatSpellParser } from '../parser/spell/CombatSpellParser';
import { ManipulationSpellParser } from '../parser/spell/ManipulationSpellParser';
import { IllusionSpellParser } from '../parser/spell/IllusionSpellParser';
import { DetectionSpellImporter } from '../parser/spell/DetectionSpellImporter';
import { ParserMap } from '../parser/ParserMap';
import { DataDefaults } from '../../data/DataDefaults';
import { Helpers } from "../../helpers";
import { UpdateActionFlow } from '../../item/flows/UpdateActionFlow';

export class SpellImporter extends DataImporter<Shadowrun.SpellItemData, Shadowrun.SpellData> {
    public override categoryTranslations: any;
    public override itemTranslations: any;
    public files = ['spells.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('spells') && jsonObject['spells'].hasOwnProperty('spell');
    }

    public override GetDefaultData({ type }: { type: any; }): Shadowrun.SpellItemData {
        const systemData = {action: {type: 'varies', attribute: 'magic', skill: 'spellcasting'}} as Shadowrun.SpellData;
        return DataDefaults.baseItemData<Shadowrun.SpellItemData, Shadowrun.SpellData>({type}, systemData);
    }

    ExtractTranslation() {
        if (!DataImporter.jsoni18n) {
            return;
        }

        let jsonSpelli18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
        this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonSpelli18n);
        this.itemTranslations = ImportHelper.ExtractItemTranslation(jsonSpelli18n, 'spells', 'spell');
    }

    async Parse(jsonObject: object, setIcons: boolean): Promise<Item> {
        const folders = await ImportHelper.MakeCategoryFolders(jsonObject, 'Spells', this.categoryTranslations);

        const parser = new ParserMap<Shadowrun.SpellItemData>('category', [
            { key: 'Combat', value: new CombatSpellParser() },
            { key: 'Manipulation', value: new ManipulationSpellParser() },
            { key: 'Illusion', value: new IllusionSpellParser() },
            { key: 'Detection', value: new DetectionSpellImporter() },
            { key: 'Health', value: new SpellParserBase() },
            { key: 'Enchantments', value: new SpellParserBase() },
            { key: 'Rituals', value: new SpellParserBase() },
        ]);

        let items: Shadowrun.SpellItemData[] = [];
        let jsonDatas = jsonObject['spells']['spell'];
        this.iconList = await this.getIconFiles();
        const parserType = 'spell';

        for (let i = 0; i < jsonDatas.length; i++) {
            let jsonData = jsonDatas[i];

            // Check to ensure the data entry is supported
            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            // Create the item
            let item = parser.Parse(jsonData, this.GetDefaultData({type: parserType}), this.itemTranslations);
            //@ts-expect-error TODO: Foundry Where is my foundry base data?
            item.folder = folders[item.system.category].id;

            // Import Flags
            item.system.importFlags = this.genImportFlags(item.name, item.type, item.system.category);

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
