import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { SpellParserBase } from '../parser/spell/SpellParserBase';
import { CombatSpellParser } from '../parser/spell/CombatSpellParser';
import { ManipulationSpellParser } from '../parser/spell/ManipulationSpellParser';
import { IllusionSpellParser } from '../parser/spell/IllusionSpellParser';
import { DetectionSpellImporter } from '../parser/spell/DetectionSpellImporter';
import { ParserMap } from '../parser/ParserMap';
import {Helpers} from "../../helpers";
import { DataDefaults } from '../../data/DataDefaults';
import { SR5 } from "../../config";

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

    async Parse(jsonObject: object): Promise<Item> {
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
        for (let i = 0; i < jsonDatas.length; i++) {
            let jsonData = jsonDatas[i];

            // Check to ensure the data entry is supported
            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            // Create the item
            let item = parser.Parse(jsonData, this.GetDefaultData({type: 'spell'}), this.itemTranslations);
            //@ts-ignore TODO: Foundry Where is my foundry base data?
            item.folder = folders[item.system.category].id;

            // Import Flags
            item.system.importFlags.name = foundry.utils.deepClone(item.name); // original english name for matching to icons
            item.system.importFlags.type = item.type;
            item.system.importFlags.subType = '';
            item.system.importFlags.isFreshImport = true;

            // Add the subtype so the importer can add the correct icon
            let subType = item.system.category;
            if (SR5.itemSubTypes.spell.includes(subType)) {
                item.system.importFlags.subType = subType;
            }
            else {
                let x = 0;
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
