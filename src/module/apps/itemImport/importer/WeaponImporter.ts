import { Constants } from './Constants';
import { DataImporter } from './DataImporter';
import { MeleeParser } from '../parser/weapon/MeleeParser';
import { RangedParser } from '../parser/weapon/RangedParser';
import { ThrownParser } from '../parser/weapon/ThrownParser';
import { WeaponsSchema, Weapon } from '../schema/WeaponsSchema';
import { WeaponParserBase } from '../parser/weapon/WeaponParserBase';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';
import WeaponItemData = Shadowrun.WeaponItemData;

export class WeaponImporter extends DataImporter {
    public files = ['weapons.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('weapons') && jsonObject['weapons'].hasOwnProperty('weapon');
    }

    static parserWrap = class {
        private categories: WeaponsSchema['categories']['category'];
        constructor(categories: WeaponsSchema['categories']['category']) {
            this.categories = categories;
        }

        public async Parse(jsonData: Weapon): Promise<WeaponItemData> {
            const rangedParser = new RangedParser(this.categories);
            const meleeParser = new MeleeParser(this.categories);
            const thrownParser = new ThrownParser(this.categories);

            const category = WeaponParserBase.GetWeaponType(jsonData);
            const selectedParser = category === 'range' ? rangedParser
                                 : category === 'melee' ? meleeParser
                                                        : thrownParser;

            return await selectedParser.Parse(jsonData);
        }
    };

    async Parse(jsonObject: WeaponsSchema): Promise<void> {
        return WeaponImporter.ParseItems<Weapon, WeaponItemData>(
            jsonObject.weapons.weapon,
            {
                compendiumKey: "Weapon",
                parser: new WeaponImporter.parserWrap(jsonObject.categories.category),
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                errorPrefix: "Failed Parsing Weapon"
            }
        );
    }
}
