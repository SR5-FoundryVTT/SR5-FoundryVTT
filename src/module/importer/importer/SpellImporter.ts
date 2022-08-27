import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { SpellParserBase } from '../parser/spell/SpellParserBase';
import { CombatSpellParser } from '../parser/spell/CombatSpellParser';
import { ManipulationSpellParser } from '../parser/spell/ManipulationSpellParser';
import { IllusionSpellParser } from '../parser/spell/IllusionSpellParser';
import { DetectionSpellImporter } from '../parser/spell/DetectionSpellImporter';
import { ParserMap } from '../parser/ParserMap';
import {DefaultValues} from "../../data/DataDefaults";
import SpellItemData = Shadowrun.SpellItemData;
import {Helpers} from "../../helpers";

export class SpellImporter extends DataImporter {
    public categoryTranslations: any;
    public itemTranslations: any;
    public files = ['spells.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('spells') && jsonObject['spells'].hasOwnProperty('spell');
    }

    GetDefaultData(): SpellItemData {
        return {
            name: 'Unnamed Item',
            type: 'spell',
            data: {
                description: {
                    value: '',
                    chat: '',
                    source: '',
                },
                action: DefaultValues.actionData({
                    type: 'varies',
                    attribute: 'magic',
                    skill: 'spellcasting',
                    damage: DefaultValues.damageData({type: {base: '', value: ''}})}),
                drain: 0,
                category: '',
                type: '',
                range: '',
                duration: '',
                extended: false,
                combat: {
                    type: '',
                },
                detection: {
                    passive: false,
                    type: '',
                    extended: false,
                },
                illusion: {
                    type: '',
                    sense: '',
                },
                manipulation: {
                    damaging: false,
                    mental: false,
                    environmental: false,
                    physical: false,
                },
            },
        };
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

        const parser = new ParserMap<SpellItemData>('category', [
            { key: 'Combat', value: new CombatSpellParser() },
            { key: 'Manipulation', value: new ManipulationSpellParser() },
            { key: 'Illusion', value: new IllusionSpellParser() },
            { key: 'Detection', value: new DetectionSpellImporter() },
            { key: 'Health', value: new SpellParserBase() },
            { key: 'Enchantments', value: new SpellParserBase() },
            { key: 'Rituals', value: new SpellParserBase() },
        ]);

        let datas: SpellItemData[] = [];
        let jsonDatas = jsonObject['spells']['spell'];
        for (let i = 0; i < jsonDatas.length; i++) {
            let jsonData = jsonDatas[i];
            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            let data = parser.Parse(jsonData, this.GetDefaultData(), this.itemTranslations);
            //@ts-ignore TODO: Foundry Where is my foundry base data?
            data.folder = folders[data.data.category].id;

            Helpers.injectActionTestsIntoChangeData(data.type, data, data);

            datas.push(data);
        }

        // @ts-ignore // TODO: TYPE: Remove this.
        return await Item.create(datas);
    }
}
