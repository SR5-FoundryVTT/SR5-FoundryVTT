import { DataImporter } from './DataImporter';
import { SpellsSchema, Spell } from '../schema/SpellsSchema';
import { SpellParserBase } from '../parser/spell/SpellParserBase';
import { CombatSpellParser } from '../parser/spell/CombatSpellParser';
import { ManipulationSpellParser } from '../parser/spell/ManipulationSpellParser';
import { IllusionSpellParser } from '../parser/spell/IllusionSpellParser';
import { DetectionSpellParser } from '../parser/spell/DetectionSpellParser';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';

export class SpellImporter extends DataImporter{
    public files = ['spells.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('spells') && jsonObject['spells'].hasOwnProperty('spell');
    }

    static parserWrap = class {
        public async Parse(jsonData: Spell): Promise<Shadowrun.SpellItemData> {
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

            return await selectedParser.Parse(jsonData);
        }
    };

    async Parse(jsonObject: SpellsSchema): Promise<void> {
        return await SpellImporter.ParseItems<Spell, Shadowrun.SpellItemData>(
            jsonObject.spells.spell,
            {
                compendiumKey: "Magic",
                parser: new SpellImporter.parserWrap(),
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                errorPrefix: "Failed Parsing Spell"
            }
        );
    }
}
