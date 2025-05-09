import { Constants } from './Constants';
import { DataImporter } from './DataImporter';
import { ImportHelper as IH } from '../helper/ImportHelper';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';
import { CritterpowersSchema, Power } from '../schema/CritterpowersSchema';
import { SpritePowerParser } from '../parser/critter-power/SpritePowerParser';
import { CritterPowerParser } from '../parser/critter-power/CritterPowerParser';

type CritterPowerType = Shadowrun.CritterPowerItemData | Shadowrun.SpritePowerItemData;

export class CritterPowerImporter extends DataImporter {
    public files = ['critterpowers.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('powers') && jsonObject['powers'].hasOwnProperty('power');
    }

    static parserWrap = class {
        public async Parse(jsonData: Power): Promise<CritterPowerType> {
            const critterPowerParser = new CritterPowerParser();
            const spritePowerParser = new SpritePowerParser();

            const isSpritePower = jsonData.category._TEXT !== "Emergent";
            const selectedParser = isSpritePower ? critterPowerParser : spritePowerParser;

            return await selectedParser.Parse(jsonData);
        }
    };

    async Parse(jsonObject: CritterpowersSchema): Promise<void> {
        const items = await CritterPowerImporter.ParseItems<Power, CritterPowerType>(
            jsonObject.powers.power,
            {
                compendiumKey: "Trait",
                parser: new CritterPowerImporter.parserWrap(),
                filter: jsonData => !DataImporter.unsupportedEntry(jsonData),
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                errorPrefix: "Failed Parsing Critter Power"
            }
        );

        // @ts-expect-error // TODO: TYPE: Remove this.
        await Item.create(items, { pack: Constants.MAP_COMPENDIUM_KEY['Trait'].pack });
    }    
}
