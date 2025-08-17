import { CompendiumKey } from './Constants';
import { DataImporter } from './DataImporter';
import { ImportHelper as IH } from '../helper/ImportHelper';
import { SpritePowerParser } from '../parser/powers/SpritePowerParser';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';
import { CritterPowerParser } from '../parser/powers/CritterPowerParser';
import { CritterpowersSchema, Power } from '../schema/CritterpowersSchema';

export class CritterPowerImporter extends DataImporter {
    public readonly files = ['critterpowers.xml'] as const;

    static parserWrap = class {
        private readonly critterPowerParser = new CritterPowerParser();
        private readonly spritePowerParser = new SpritePowerParser();
        public async Parse(jsonData: Power, compendiumKey: CompendiumKey): Promise<Item.CreateData> {
            const isSpritePower = jsonData.category._TEXT !== "Emergent";
            const selectedParser = isSpritePower ? this.critterPowerParser : this.spritePowerParser;

            return selectedParser.Parse(jsonData, compendiumKey) as Promise<Item.CreateData>;
        }
    };

    async Parse(jsonObject: CritterpowersSchema): Promise<void> {
        IH.setTranslatedCategory('critterpowers', jsonObject.categories.category);

        return CritterPowerImporter.ParseItems<Power>(
            jsonObject.powers.power,
            {
                compendiumKey: () => "Critter_Power",
                parser: new CritterPowerImporter.parserWrap(),
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                documentType: "Critter Power"
            }
        );
    }    
}
