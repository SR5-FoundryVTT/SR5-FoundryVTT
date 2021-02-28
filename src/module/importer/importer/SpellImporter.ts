import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import Spell = Shadowrun.Spell;
import { SpellParserBase } from '../parser/spell/SpellParserBase';
import { CombatSpellParser } from '../parser/spell/CombatSpellParser';
import { ManipulationSpellParser } from '../parser/spell/ManipulationSpellParser';
import { IllusionSpellParser } from '../parser/spell/IllusionSpellParser';
import { DetectionSpellImporter } from '../parser/spell/DetectionSpellImporter';
import { ParserMap } from '../parser/ParserMap';
import {DefaultValues} from "../../dataTemplates";

export class SpellImporter extends DataImporter {
    public categoryTranslations: any;
    public itemTranslations: any;
    public files = ['spells.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('spells') && jsonObject['spells'].hasOwnProperty('spell');
    }

    GetDefaultData(): Spell {
        return {
            name: 'Unnamed Item',
            _id: '',
            folder: '',
            img: 'icons/svg/mystery-man.svg',
            flags: {},
            type: 'spell',
            data: {
                description: {
                    value: '',
                    chat: '',
                    source: '',
                },
                action: {
                    type: 'varies',
                    category: '',
                    attribute: 'magic',
                    attribute2: '',
                    skill: 'spellcasting',
                    spec: false,
                    mod: 0,
                    mod_description: '',
                    damage: DefaultValues.damageData({type: {base: '', value: ''}}),
                    limit: {
                        value: 0,
                        attribute: '',
                        mod: [],
                        base: 0,
                    },
                    extended: false,
                    opposed: {
                        type: '',
                        attribute: '',
                        attribute2: '',
                        skill: '',
                        mod: 0,
                        description: '',
                    },
                    alt_mod: 0,
                    dice_pool_mod: [],
                },
                drain: 0,
                category: '',
                type: '',
                range: '',
                duration: '',
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
            permission: {
                default: 2,
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

    async Parse(jsonObject: object): Promise<Entity> {
        const folders = await ImportHelper.MakeCategoryFolders(jsonObject, 'Spells', this.categoryTranslations);

        const parser = new ParserMap<Spell>('category', [
            { key: 'Combat', value: new CombatSpellParser() },
            { key: 'Manipulation', value: new ManipulationSpellParser() },
            { key: 'Illusion', value: new IllusionSpellParser() },
            { key: 'Detection', value: new DetectionSpellImporter() },
            { key: 'Health', value: new SpellParserBase() },
            { key: 'Enchantments', value: new SpellParserBase() },
            { key: 'Rituals', value: new SpellParserBase() },
        ]);

        let datas: Spell[] = [];
        let jsonDatas = jsonObject['spells']['spell'];
        for (let i = 0; i < jsonDatas.length; i++) {
            let jsonData = jsonDatas[i];
            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            let data = parser.Parse(jsonData, this.GetDefaultData(), this.itemTranslations);
            data.folder = folders[data.data.category].id;
            datas.push(data);
        }

        return await Item.create(datas);
    }
}
