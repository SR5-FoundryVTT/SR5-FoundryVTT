import { CompendiumKey } from './Constants';
import { DataImporter } from './DataImporter';
import { MeleeParser } from '../parser/weapon/MeleeParser';
import { ImportHelper as IH } from '../helper/ImportHelper';
import { RangedParser } from '../parser/weapon/RangedParser';
import { ThrownParser } from '../parser/weapon/ThrownParser';
import { WeaponsSchema, Weapon } from '../schema/WeaponsSchema';
import { WeaponParserBase } from '../parser/weapon/WeaponParserBase';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';

export class WeaponImporter extends DataImporter {
    public files = ['weapons.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('weapons') && jsonObject['weapons'].hasOwnProperty('weapon');
    }

    static parserWrap = class {
        public async Parse(jsonData: Weapon, compendiumKey: CompendiumKey): Promise<Item.CreateData> {
            const rangedParser = new RangedParser();
            const meleeParser = new MeleeParser();
            const thrownParser = new ThrownParser();

            const category = WeaponParserBase.GetWeaponType(jsonData);
            const selectedParser = category === 'range' ? rangedParser
                                 : category === 'melee' ? meleeParser
                                                        : thrownParser;

            return selectedParser.Parse(jsonData, compendiumKey) as Promise<Item.CreateData>;
        }
    };

    async Parse(jsonObject: WeaponsSchema): Promise<void> {
        IH.setTranslatedCategory('weapons', jsonObject.categories.category);

        return WeaponImporter.ParseItems<Weapon>(
            jsonObject.weapons.weapon,
            {
                compendiumKey: () => "Weapon",
                parser: new WeaponImporter.parserWrap(),
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                errorPrefix: "Failed Parsing Weapon"
            }
        );
    }
}
