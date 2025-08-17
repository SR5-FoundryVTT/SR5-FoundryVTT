import { CompendiumKey } from './Constants';
import { DataImporter } from './DataImporter';
import { AmmoParser } from '../parser/gear/AmmoParser';
import { GearSchema, Gear } from '../schema/GearSchema';
import { DeviceParser } from '../parser/gear/DeviceParser';
import { ImportHelper as IH } from '../helper/ImportHelper';
import { ProgramParser } from '../parser/gear/ProgramParser';
import { EquipmentParser } from '../parser/gear/EquipmentParser';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';

export class GearImporter extends DataImporter {
    public readonly files = ['gear.xml'] as const;

    static parserWrap = class {
        private readonly ammoParser: AmmoParser;
        private readonly deviceParser: DeviceParser;
        private readonly programParser: ProgramParser;
        private readonly equipmentParser: EquipmentParser;
        private readonly categories: GearSchema['categories']['category'];

        constructor(categories: GearSchema['categories']['category']) {
            this.categories = categories;
            this.ammoParser = new AmmoParser(this.categories);
            this.deviceParser = new DeviceParser(this.categories);
            this.programParser = new ProgramParser(this.categories);
            this.equipmentParser = new EquipmentParser(this.categories);
        }

        public async Parse(jsonData: Gear, compendiumKey: CompendiumKey): Promise<Item.CreateData> {
            const category = jsonData.category._TEXT;
            const programTypes = ['Hacking Programs', 'Common Programs'];
            const deviceTypes = ['Commlinks', 'Cyberdecks', 'Rigger Command Consoles'];

            const selectedParser = category === "Ammunition"       ? this.ammoParser
                                 : deviceTypes.includes(category)  ? this.deviceParser
                                 : programTypes.includes(category) ? this.programParser
                                                                   : this.equipmentParser;

            return selectedParser.Parse(jsonData, compendiumKey) as Promise<Item.CreateData>;
        }
    };

    async _parse(jsonObject: GearSchema): Promise<void> {
        IH.setTranslatedCategory('gear', jsonObject.categories.category);

        return GearImporter.ParseItems<Gear>(
            jsonObject.gears.gear,
            {
                compendiumKey: () => "Gear",
                parser: new GearImporter.parserWrap(jsonObject.categories.category),
                filter: jsonData => jsonData.id._TEXT !== 'd63eb841-7b15-4539-9026-b90a4924aeeb',
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                documentType: "Gear"
            }
        );
    }    
}
