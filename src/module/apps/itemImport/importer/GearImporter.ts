import { CompendiumKey } from './Constants';
import { DataImporter } from './DataImporter';
import { AmmoParser } from '../parser/gear/AmmoParser';
import { GearSchema, Gear } from '../schema/GearSchema';
import { DeviceParser } from '../parser/gear/DeviceParser';
import { ProgramParser } from '../parser/gear/ProgramParser';
import { EquipmentParser } from '../parser/gear/EquipmentParser';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';

export class GearImporter extends DataImporter {
    public files = ['gear.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('gears') && jsonObject['gears'].hasOwnProperty('gear');
    }

    static parserWrap = class {
        private readonly categories: GearSchema['categories']['category'];
        constructor(categories: GearSchema['categories']['category']) {
            this.categories = categories;
        }

        public async Parse(jsonData: Gear, compendiumKey: CompendiumKey): Promise<Item.CreateData> {
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

            return selectedParser.Parse(jsonData, compendiumKey) as Promise<Item.CreateData>;
        }
    };

    async Parse(jsonObject: GearSchema): Promise<void> {
        return GearImporter.ParseItems<Gear>(
            jsonObject.gears.gear,
            {
                compendiumKey: () => "Gear",
                parser: new GearImporter.parserWrap(jsonObject.categories.category),
                filter: jsonData => jsonData.id._TEXT !== 'd63eb841-7b15-4539-9026-b90a4924aeeb',
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                errorPrefix: "Failed Parsing Gear"
            }
        );
    }    
}
