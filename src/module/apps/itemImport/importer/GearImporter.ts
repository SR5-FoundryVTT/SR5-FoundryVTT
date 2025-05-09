import { Constants } from './Constants';
import { DataImporter } from './DataImporter';
import { AmmoParser } from '../parser/gear/AmmoParser';
import { GearSchema, Gear } from '../schema/GearSchema';
import { DeviceParser } from '../parser/gear/DeviceParser';
import { ImportHelper as IH } from '../helper/ImportHelper';
import { ProgramParser } from '../parser/gear/ProgramParser';
import { EquipmentParser } from '../parser/gear/EquipmentParser';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';

type gearTypes = Shadowrun.EquipmentItemData | Shadowrun.AmmoItemData |
                 Shadowrun.DeviceItemData | Shadowrun.ProgramItemData;

export class GearImporter extends DataImporter {
    public files = ['gear.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('gears') && jsonObject['gears'].hasOwnProperty('gear');
    }

    static parserWrap = class {
        public async Parse(jsonData: Gear): Promise<gearTypes> {
            const ammoParser = new AmmoParser();
            const deviceParser = new DeviceParser();
            const programParser = new ProgramParser();
            const equipmentParser = new EquipmentParser();

            const category = jsonData.category._TEXT;
            const programTypes = ['Hacking Programs', 'Common Programs'];
            const deviceTypes = ['Commlinks', 'Cyberdecks', 'Rigger Command Consoles'];

            const selectedParser = category === "Ammunition"       ? ammoParser
                                 : deviceTypes.includes(category)  ? deviceParser
                                 : programTypes.includes(category) ? programParser
                                                                   : equipmentParser;

            return await selectedParser.Parse(jsonData);
        }
    };

    async Parse(jsonObject: GearSchema): Promise<void> {
        const items = await GearImporter.ParseItems<Gear, gearTypes>(
            jsonObject.gears.gear,
            {
                compendiumKey: "Item",
                parser: new GearImporter.parserWrap(),
                filter: jsonData => {
                    return !DataImporter.unsupportedEntry(jsonData) && jsonData.id._TEXT !== 'd63eb841-7b15-4539-9026-b90a4924aeeb';
                },
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                errorPrefix: "Failed Parsing Gear"
            }
        );

        // @ts-expect-error
        await Item.create(items, { pack: Constants.MAP_COMPENDIUM_KEY['Item'].pack }) as Item;
    }    
}
