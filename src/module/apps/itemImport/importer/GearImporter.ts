import { DataImporter } from './DataImporter';
import { AmmoParser } from '../parser/gear/AmmoParser';
import { GearSchema, Gear } from '../schema/GearSchema';
import { DeviceParser } from '../parser/gear/DeviceParser';
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
        private categories: GearSchema['categories']['category'];
        constructor(categories: GearSchema['categories']['category']) {
            this.categories = categories;
        }

        public async Parse(jsonData: Gear): Promise<Item.CreateData> {
            const ammoParser = new AmmoParser(this.categories);
            const deviceParser = new DeviceParser(this.categories);
            const programParser = new ProgramParser(this.categories);
            const equipmentParser = new EquipmentParser(this.categories);

            const category = jsonData.category._TEXT;
            const programTypes = ['Hacking Programs', 'Common Programs'];
            const deviceTypes = ['Commlinks', 'Cyberdecks', 'Rigger Command Consoles'];

            const selectedParser = category === "Ammunition"       ? ammoParser
                                 : deviceTypes.includes(category)  ? deviceParser
                                 : programTypes.includes(category) ? programParser
                                                                   : equipmentParser;

            return await selectedParser.Parse(jsonData) as Item.CreateData;
        }
    };

    async Parse(jsonObject: GearSchema): Promise<void> {
        return GearImporter.ParseItems<Gear>(
            jsonObject.gears.gear,
            {
                compendiumKey: "Gear",
                parser: new GearImporter.parserWrap(jsonObject.categories.category),
                filter: jsonData => jsonData.id._TEXT !== 'd63eb841-7b15-4539-9026-b90a4924aeeb',
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type!, item, item);
                },
                errorPrefix: "Failed Parsing Gear"
            }
        );
    }    
}
