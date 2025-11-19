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
    public readonly files = ['weapons.xml'] as const;

    static parserWrap = class {
        private readonly meleeParser = new MeleeParser();
        private readonly rangedParser = new RangedParser();
        private readonly thrownParser = new ThrownParser();

        public async Parse(jsonData: Weapon, compendiumKey: CompendiumKey): Promise<Item.CreateData> {
            const category = WeaponParserBase.GetWeaponType(jsonData);
            const selectedParser = category === 'range' ? this.rangedParser
                                 : category === 'melee' ? this.meleeParser
                                                        : this.thrownParser;

            return selectedParser.Parse(jsonData, compendiumKey) as Promise<Item.CreateData>;
        }
    };

    async _parse(jsonObject: WeaponsSchema): Promise<void> {
        IH.setTranslatedCategory('weapons', jsonObject.categories.category);

        return WeaponImporter.ParseItems<Weapon>(
            jsonObject.weapons.weapon,
            {
                compendiumKey: () => "Weapon",
                parser: new WeaponImporter.parserWrap(),
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                documentType: "Weapon"
            }
        );
    }
}
