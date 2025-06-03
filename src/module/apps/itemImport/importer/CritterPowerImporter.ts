import { DataImporter } from './DataImporter';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';
import { CritterpowersSchema, Power } from '../schema/CritterpowersSchema';
import { SpritePowerParser } from '../parser/powers/SpritePowerParser';
import { CritterPowerParser } from '../parser/powers/CritterPowerParser';

type CritterPowerType = Shadowrun.CritterPowerItemData | Shadowrun.SpritePowerItemData;

export class CritterPowerImporter extends DataImporter {
    public files = ['critterpowers.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('powers') && jsonObject['powers'].hasOwnProperty('power');
    }

    static parserWrap = class {
        public async Parse(jsonData: Power): Promise<Item.CreateData> {
            const critterPowerParser = new CritterPowerParser();
            const spritePowerParser = new SpritePowerParser();

            const isSpritePower = jsonData.category._TEXT !== "Emergent";
            const selectedParser = isSpritePower ? critterPowerParser : spritePowerParser;

            return await selectedParser.Parse(jsonData) as Item.CreateData;
        }
    };

    async Parse(jsonObject: CritterpowersSchema): Promise<void> {
        return CritterPowerImporter.ParseItems<Power>(
            jsonObject.powers.power,
            {
                compendiumKey: "Trait",
                parser: new CritterPowerImporter.parserWrap(),
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type!, item, item);
                },
                errorPrefix: "Failed Parsing Critter Power"
            }
        );
    }    
}
