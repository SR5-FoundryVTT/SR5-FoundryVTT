import { ImportHelper } from '../../helper/ImportHelper';
import { Constants } from '../../importer/Constants';
import WeaponCategory = Shadowrun.WeaponCategory;
import SkillName = Shadowrun.SkillName;
import { TechnologyItemParserBase } from '../item/TechnologyItemParserBase';
import WeaponItemData = Shadowrun.WeaponItemData;
import DamageElement = Shadowrun.DamageElement;
import DamageType = Shadowrun.DamageType;
import { DataDefaults } from '../../../../data/DataDefaults';
import PhysicalAttribute = Shadowrun.PhysicalAttribute;
import DamageData = Shadowrun.DamageData;
import { SR5 } from '../../../../config';
import RangeData = Shadowrun.RangeData;

export class WeaponParserBase extends TechnologyItemParserBase<WeaponItemData> {
    private GetSkill(weaponJson: object): SkillName {
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

    public override Parse(jsonData: object, item: WeaponItemData, jsonTranslation?: object): WeaponItemData {
        item = super.Parse(jsonData, item, jsonTranslation);

        let category = ImportHelper.StringValue(jsonData, 'category');
        // A single item does not meet normal rules, thanks Chummer!
        // TODO: Check these rules after localization using a generic, non-english approach.
        if (category === 'Hold-outs') {
            category = 'Holdouts';
        }

        item.system.category = WeaponParserBase.GetWeaponType(jsonData);
        item.system.subcategory = category.toLowerCase();

        item.system.action.skill = this.GetSkill(jsonData);
        item.system.action.damage = this.GetDamage(jsonData);

        item.system.action.limit.value = ImportHelper.IntValue(jsonData, 'accuracy');
        item.system.action.limit.base = ImportHelper.IntValue(jsonData, 'accuracy');

        item.system.technology.conceal.base = ImportHelper.IntValue(jsonData, 'conceal');

        return item;
    }

    protected GetDamage(jsonData: object): DamageData {
        const jsonDamage = ImportHelper.StringValue(jsonData, 'damage');
        // ex. 15S(e)
        const simpleDamage = /^([0-9]+)([PSM])? ?(\([a-zA-Z]+\))?/g.exec(jsonDamage);
        // ex. ({STR}+1)P(fire)
        const strengthDamage = /^\({STR}([+-]?[0-9]*)\)([PSM])? ?(\([a-zA-Z]+\))?/g.exec(jsonDamage);

        let damageType: DamageType = '';
        let damageAttribute: PhysicalAttribute | '' = '';
        let damageBase: number = 0;
        let damageElement: DamageElement = '';

        if(simpleDamage !== null) {
            damageAttribute = '';
            damageBase = parseInt(simpleDamage[1], 10);
            damageType = this.parseDamageType(simpleDamage[2]);
            damageElement = this.parseDamageElement(simpleDamage[3])
        } else if (strengthDamage !== null) {
            damageAttribute = 'strength';
            damageBase = parseInt(strengthDamage[1], 10) || 0;
            damageType = this.parseDamageType(strengthDamage[2]);
            damageElement = this.parseDamageElement(strengthDamage[3]);
        }

        const damageAp = ImportHelper.IntValue(jsonData, 'ap', 0);

        const partialDamageData: RecursivePartial<DamageData> = {
            type: {
                base: damageType || 'physical',
                value: damageType || 'physical',
            },
            base: damageBase,
            value: damageBase,
            ap: {
                base: damageAp,
                value: damageAp,
                mod: [],
            },
            attribute: damageAttribute,
            element: {
                base: damageElement,
                value: damageElement,
            }
        }
        return DataDefaults.createData('damage', partialDamageData);
    }

    protected parseDamageType(parsedType: string | undefined): DamageType {
        switch(parsedType) {
            case 'S':
                return 'stun';
            case 'M':
                return 'matrix';
            case 'P':
                return 'physical';
            default:
                return '';
        }
    }

    protected parseDamageElement(parsedElement: string | undefined): DamageElement {
        switch(parsedElement?.toLowerCase()) {
            case '(e)':
                return 'electricity';
            case '(fire)':
                return 'fire';
            default:
                return '';
        }
    }

    protected GetRangeDataFromImportedCategory(category: string): RangeData|undefined {
        const systemRangeCategory: Exclude<keyof typeof SR5.weaponRangeCategories, "manual"> | undefined = Constants.MAP_IMPORT_RANGE_CATEGORY_TO_SYSTEM_RANGE_CATEGORY[category];
        if(systemRangeCategory === undefined) {
            return undefined;
        }
        return {
            ...SR5.weaponRangeCategories[systemRangeCategory].ranges,
            category: systemRangeCategory,
        };
    }
}
