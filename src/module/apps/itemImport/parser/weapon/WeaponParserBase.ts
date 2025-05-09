import { ItemDataSource } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { TranslationHelper as TH } from '../../helper/TranslationHelper';
import { Constants } from '../../importer/Constants';
import WeaponCategory = Shadowrun.WeaponCategory;
import SkillName = Shadowrun.SkillName;
import { Parser } from '../Parser';
import WeaponItemData = Shadowrun.WeaponItemData;
import DamageElement = Shadowrun.DamageElement;
import DamageType = Shadowrun.DamageType;
import { DataDefaults } from '../../../../data/DataDefaults';
import PhysicalAttribute = Shadowrun.PhysicalAttribute;
import DamageData = Shadowrun.DamageData;
import { SR5 } from '../../../../config';
import RangeData = Shadowrun.RangeData;
import { Weapon } from '../../schema/WeaponsSchema';

export class WeaponParserBase extends Parser<WeaponItemData> {
    protected override parseType: string = 'weapon';

    protected override async getItems(jsonData: Weapon) : Promise<ItemDataSource[]> {
        const result: ItemDataSource[] = []
        const accessories = jsonData.accessories?.accessory;

        for (const accessory of IH.getArray(accessories)) {
            const name = accessory.name._TEXT;
            const foundItem = await IH.findItem('Item', name, 'modification');

            if (!foundItem.length) {
                console.log(
                    `[Modification Missing]\nWeapon: ${jsonData.name._TEXT}\nAccessory: ${name}`
                );
                continue;
            }

            const accessoryBase = foundItem[0].toObject() as Shadowrun.ModificationItemData;

            accessoryBase.system.technology.equipped = true;
            if (accessory.rating)
                accessoryBase.system.technology.rating = Number(accessory.rating._TEXT) || 0;

            result.push(accessoryBase as ItemDataSource);
        }

        return result;
    }

    private GetSkill(weaponJson: Weapon): SkillName {
        if (weaponJson.useskill?._TEXT) {
            const jsonSkill = weaponJson.useskill._TEXT;
            if (Constants.MAP_CATEGORY_TO_SKILL[jsonSkill])
                return Constants.MAP_CATEGORY_TO_SKILL[jsonSkill];

            return jsonSkill.replace(/[\s\-]/g, '_').toLowerCase();
        } else {
            const category = weaponJson.category._TEXT;
            if (Constants.MAP_CATEGORY_TO_SKILL[category])
                return Constants.MAP_CATEGORY_TO_SKILL[category];

            const type = weaponJson.type._TEXT.toLowerCase();
            return type === 'ranged' ? 'exotic_range' : 'exotic_melee';
        }
    }

    public static GetWeaponType(weaponJson: Weapon): WeaponCategory {
        let type = weaponJson.type._TEXT;
        //melee is the least specific, all melee entries are accurate
        if (type === 'Melee') {
            return 'melee';
        } else {
            // "Throwing Weapons" maps to "thrown", preferring useskill over category
            const skillCategory = weaponJson.useskill?._TEXT ?? weaponJson.category?._TEXT;
            if (skillCategory === 'Throwing Weapons') return 'thrown';

            // ranged is everything else
            return 'range';
        }
    }

    protected override getSystem(jsonData: Weapon): WeaponItemData['system'] {
        const system = this.getBaseSystem(
            'Item',
            {action: {type: 'varies', attribute: 'agility'}} as Shadowrun.WeaponData
        );

        let category = jsonData.category._TEXT;
        // A single item does not meet normal rules, thanks Chummer!
        // TODO: Check these rules after localization using a generic, non-english approach.
        if (category === 'Hold-outs') {
            category = 'Holdouts';
        }

        system.category = WeaponParserBase.GetWeaponType(jsonData);
        system.subcategory = category.toLowerCase();
        
        system.action.skill = this.GetSkill(jsonData);
        system.action.damage = this.GetDamage(jsonData as any);
        
        system.action.limit.value = Number(jsonData.accuracy?._TEXT) || 0;
        system.action.limit.base = Number(jsonData.accuracy?._TEXT) || 0;
        
        system.technology.conceal.base = Number(jsonData.conceal?._TEXT);

        return system;
    }
    
    protected GetDamage(jsonData: Weapon): DamageData {
        const jsonDamage = jsonData.damage._TEXT;
        // ex. 15S(e)
        const simpleDamage = /^([0-9]+)([PSM])? ?(\([a-zA-Z]+\))?/g.exec(jsonDamage);
        // ex. ({STR}+1)P(fire)
        const strengthDamage = /^\({STR}([+-]?[0-9]*)\)([PSM])? ?(\([a-zA-Z]+\))?/g.exec(jsonDamage);

        let damageType: DamageType = '';
        let damageAttribute: PhysicalAttribute | '' = '';
        let damageBase: number = 0;
        let damageElement: DamageElement = '';

        if(simpleDamage) {
            damageAttribute = '';
            damageBase = parseInt(simpleDamage[1], 10);
            damageType = this.parseDamageType(simpleDamage[2]);
            damageElement = this.parseDamageElement(simpleDamage[3])
        } else if (strengthDamage) {
            damageAttribute = 'strength';
            damageBase = parseInt(strengthDamage[1], 10) || 0;
            damageType = this.parseDamageType(strengthDamage[2]);
            damageElement = this.parseDamageElement(strengthDamage[3]);
        }

        const damageAp = Number(jsonData.ap._TEXT) || 0;

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
        return DataDefaults.damageData(partialDamageData);
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

    protected override async getFolder(jsonData: Weapon): Promise<Folder> {
        const rootFolder = TH.getTranslation('Weapon', {type: 'category'});
        const folderName = TH.getTranslation(jsonData.category._TEXT, {type: 'category'});

        return IH.getFolder('Item', rootFolder, folderName);
    }
}
