import { CompendiumKey } from './Constants';
import { DataImporter } from './DataImporter';
import { ImportHelper as IH } from '../helper/ImportHelper';
import { SpellsSchema, Spell } from '../schema/SpellsSchema';
import { SpellParserBase } from '../parser/spell/SpellParserBase';
import { CombatSpellParser } from '../parser/spell/CombatSpellParser';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';
import { IllusionSpellParser } from '../parser/spell/IllusionSpellParser';
import { DetectionSpellParser } from '../parser/spell/DetectionSpellParser';
import { ManipulationSpellParser } from '../parser/spell/ManipulationSpellParser';

export class SpellImporter extends DataImporter{
    public files = ['spells.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('spells') && jsonObject['spells'].hasOwnProperty('spell');
    }

    static parserWrap = class {
        public async Parse(jsonData: Spell, compendiumKey: CompendiumKey): Promise<Item.CreateData> {
            const spellParserBase = new SpellParserBase();
            const combatSpellParser = new CombatSpellParser();
            const illusionSpellParser = new IllusionSpellParser();
            const detectionSpellParser = new DetectionSpellParser();
            const manipulationSpellParser = new ManipulationSpellParser();

            const category = jsonData.category._TEXT;
            const selectedParser = category === 'Combat'        ? combatSpellParser
                                 : category === 'Detection'     ? detectionSpellParser
                                 : category === 'Illusion'      ? illusionSpellParser
                                 : category === 'Manipulation'  ? manipulationSpellParser
                                                                : spellParserBase;

            return selectedParser.Parse(jsonData, compendiumKey) as Promise<Item.CreateData>;
        }
    };

    async Parse(jsonObject: SpellsSchema): Promise<void> {
        IH.setTranslatedCategory('spells', jsonObject.categories.category);

        return SpellImporter.ParseItems<Spell>(
            jsonObject.spells.spell,
            {
                compendiumKey: () => "Spell",
                parser: new SpellImporter.parserWrap(),
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                errorPrefix: "Failed Parsing Spell"
            }
        );
    }
}
