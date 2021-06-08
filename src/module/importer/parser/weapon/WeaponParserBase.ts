import { ImportHelper } from '../../helper/ImportHelper';
import { Constants } from '../../importer/Constants';
import DamageData = Shadowrun.DamageData;
import WeaponCategory = Shadowrun.WeaponCategory;
import SkillName = Shadowrun.SkillName;
import { TechnologyItemParserBase } from '../item/TechnologyItemParserBase';
import WeaponItemData = Shadowrun.WeaponItemData;

export abstract class WeaponParserBase extends TechnologyItemParserBase<WeaponItemData> {
    public abstract GetDamage(jsonData: object): DamageData;

    protected GetSkill(weaponJson: object): SkillName {
        if (weaponJson.hasOwnProperty('useskill')) {
            let jsonSkill = ImportHelper.StringValue(weaponJson, 'useskill');
            if (Constants.MAP_CATEGORY_TO_SKILL.hasOwnProperty(jsonSkill)) {
                return Constants.MAP_CATEGORY_TO_SKILL[jsonSkill];
            }
            return jsonSkill.replace(/[\s\-]/g, '_').toLowerCase();
        } else {
            let category = ImportHelper.StringValue(weaponJson, 'category');
            if (Constants.MAP_CATEGORY_TO_SKILL.hasOwnProperty(category)) {
                return Constants.MAP_CATEGORY_TO_SKILL[category];
            }

            let type = ImportHelper.StringValue(weaponJson, 'type').toLowerCase();
            return type === 'ranged' ? 'exotic_range' : 'exotic_melee';
        }
    }

    public static GetWeaponType(weaponJson: object): WeaponCategory {
        let type = ImportHelper.StringValue(weaponJson, 'type');
        //melee is the least specific, all melee entries are accurate
        if (type === 'Melee') {
            return 'melee';
        } else {
            // skill takes priorities over category
            if (weaponJson.hasOwnProperty('useskill')) {
                let skill = ImportHelper.StringValue(weaponJson, 'useskill');
                if (skill === 'Throwing Weapons') return 'thrown';
            }

            // category is the fallback
            let category = ImportHelper.StringValue(weaponJson, 'category');
            if (category === 'Throwing Weapons') return 'thrown';
            // ranged is everything else
            return 'range';
        }
    }

    public Parse(jsonData: object, data: WeaponItemData, jsonTranslation?: object): WeaponItemData {
        data = super.Parse(jsonData, data, jsonTranslation);

        let category = ImportHelper.StringValue(jsonData, 'category');
        // A single item does not meet normal rules, thanks Chummer!
        // TODO: Check these rules after localization using a generic, non-english approach.
        if (category === 'Hold-outs') {
            category = 'Holdouts';
        }

        data.data.category = WeaponParserBase.GetWeaponType(jsonData);
        data.data.subcategory = category.toLowerCase();

        data.data.action.skill = this.GetSkill(jsonData);
        data.data.action.damage = this.GetDamage(jsonData);

        data.data.action.limit.value = ImportHelper.IntValue(jsonData, 'accuracy');
        data.data.action.limit.base = ImportHelper.IntValue(jsonData, 'accuracy');

        data.data.technology.conceal.base = ImportHelper.IntValue(jsonData, 'conceal');

        return data;
    }
}
