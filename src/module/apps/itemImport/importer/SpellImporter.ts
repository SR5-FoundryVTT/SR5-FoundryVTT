import { CompendiumKey } from './Constants';
import { DataImporter } from './DataImporter';
import { RitualParser } from '../parser/spell/RitualParser';
import { ImportHelper as IH } from '../helper/ImportHelper';
import { SpellsSchema, Spell } from '../schema/SpellsSchema';
import { SpellParserBase } from '../parser/spell/SpellParserBase';
import { CombatSpellParser } from '../parser/spell/CombatSpellParser';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';
import { IllusionSpellParser } from '../parser/spell/IllusionSpellParser';
import { DetectionSpellParser } from '../parser/spell/DetectionSpellParser';
import { ManipulationSpellParser } from '../parser/spell/ManipulationSpellParser';

export class SpellImporter extends DataImporter{
    public readonly files = ['spells.xml'] as const;

    protected static parserWrap = class {
        private readonly ritualParser = new RitualParser();
        private readonly spellParserBase = new SpellParserBase();
        private readonly combatSpellParser = new CombatSpellParser();
        private readonly illusionSpellParser = new IllusionSpellParser();
        private readonly detectionSpellParser = new DetectionSpellParser();
        private readonly manipulationSpellParser = new ManipulationSpellParser();

        public async Parse(jsonData: Spell, compendiumKey: CompendiumKey): Promise<Item.CreateData> {
            const category = jsonData.category._TEXT;
            const selectedParser = category === 'Combat'        ? this.combatSpellParser
                                 : category === 'Detection'     ? this.detectionSpellParser
                                 : category === 'Illusion'      ? this.illusionSpellParser
                                 : category === 'Manipulation'  ? this.manipulationSpellParser
                                 : category === 'Rituals'       ? this.ritualParser
                                                                : this.spellParserBase;

            return selectedParser.Parse(jsonData, compendiumKey) as Promise<Item.CreateData>;
        }
    };

    async _parse(jsonObject: SpellsSchema): Promise<void> {
        IH.setTranslatedCategory('spells', jsonObject.categories.category);

        return SpellImporter.ParseItems<Spell>(
            jsonObject.spells.spell,
            {
                compendiumKey: () => "Spell",
                parser: new SpellImporter.parserWrap(),
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                documentType: "Spell"
            }
        );
    }
}
