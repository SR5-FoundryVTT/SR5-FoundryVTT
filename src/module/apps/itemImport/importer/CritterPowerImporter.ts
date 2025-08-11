import { CompendiumKey } from './Constants';
import { DataImporter } from './DataImporter';
import { ImportHelper as IH } from '../helper/ImportHelper';
import { SpritePowerParser } from '../parser/powers/SpritePowerParser';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';
import { CritterPowerParser } from '../parser/powers/CritterPowerParser';
import { CritterpowersSchema, Power } from '../schema/CritterpowersSchema';

export class CritterPowerImporter extends DataImporter {
    public files = ['critterpowers.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('powers') && jsonObject['powers'].hasOwnProperty('power');
    }

    static parserWrap = class {
        public async Parse(jsonData: Power, compendiumKey: CompendiumKey): Promise<Item.CreateData> {
            const critterPowerParser = new CritterPowerParser();
            const spritePowerParser = new SpritePowerParser();

            const isSpritePower = jsonData.category._TEXT !== "Emergent";
            const selectedParser = isSpritePower ? critterPowerParser : spritePowerParser;

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
                errorPrefix: "Failed Parsing Critter Power"
            }
        );
    }    
}
