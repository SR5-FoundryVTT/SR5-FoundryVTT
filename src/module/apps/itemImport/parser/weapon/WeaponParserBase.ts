import { Parser } from '../Parser';
import { SR5 } from '../../../../config';
import { Constants } from '../../importer/Constants';
import { DataDefaults } from '../../../../data/DataDefaults';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { Weapon, WeaponsSchema } from '../../schema/WeaponsSchema';
import { TranslationHelper as TH } from '../../helper/TranslationHelper';
import { RangeType } from 'src/module/types/item/WeaponModel';
import { DamageType } from 'src/module/types/item/ActionModel';

import PhysicalAttribute = Shadowrun.PhysicalAttribute;
type DamageTypeType = Item.SystemOfType<'weapon'>['action']['damage']['type']['base'];
type DamageElement = Item.SystemOfType<'weapon'>['action']['damage']['element']['base'];

export class WeaponParserBase extends Parser<'weapon'> {
    protected parseType = 'weapon' as const;
    private categories: WeaponsSchema['categories']['category'];

    constructor(categories: WeaponsSchema['categories']['category']) {
        super(); this.categories = categories;
    }

    protected override async getItems(jsonData: Weapon): Promise<Item.Source[]> {
        if (!jsonData.accessories?.accessory) return [];

        const accessories = IH.getArray(jsonData.accessories.accessory);
        const accessoriesNames = accessories.map(acc => acc.name._TEXT);
        const translationMap: Record<string, string> = {};
        for (const name of accessoriesNames)
            translationMap[name] = TH.getTranslation(name, { type: 'accessory' });

        const foundItems = await IH.findItem('Modification', Object.values(translationMap));
        const itemMap = new Map(foundItems.map(item => [item.name, item]));

        const result: Item.Source[] = [];
        for (const accessory of accessories) {
            const rawName = accessory.name._TEXT;
            const translatedName = translationMap[rawName] || rawName;
            const foundItem = itemMap.get(translatedName);

            if (!foundItem) {
                console.log(`[Accessory Missing]\nWeapon: ${jsonData.name._TEXT}\nAccessory: ${rawName}, ${translatedName}`);
                continue;
            }

            const accessoryBase = foundItem.toObject();
            const system = accessoryBase.system as Item.SystemOfType<'modification'>;
            system.technology.equipped = true;

            const ratingText = accessory.rating?._TEXT;
            if (ratingText)
                system.technology.rating = Number(ratingText) || 0;

            result.push(accessoryBase as Item.Source);
        }

        return result;
    }

    private GetSkill(weaponJson: Weapon): string {
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

    public static GetWeaponType(weaponJson: Weapon): Item.SystemOfType<'weapon'>['category'] {
        let type = weaponJson.type._TEXT;
        //melee is the least specific, all melee entries are accurate
        if (type === 'Melee') {
            return 'melee';
        } else {
            // "Throwing Weapons" maps to "thrown", preferring useskill over category
            const skillCategory = weaponJson.useskill?._TEXT ?? weaponJson.category?._TEXT;
            if (skillCategory === 'Throwing Weapons') return 'thrown';

            // ranged is everything else
            return 'ranged';
        }
    }

    protected override getSystem(jsonData: Weapon): Item.SystemOfType<'weapon'> {
        const system = this.getBaseSystem() as Item.SystemOfType<'weapon'>;

        system.action.type = 'varies';
        system.action.attribute = 'agility';

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
    
    protected GetDamage(jsonData: Weapon): DamageType {
        const jsonDamage = jsonData.damage._TEXT;
        // ex. 15S(e)
        const simpleDamage = /^([0-9]+)([PSM])? ?(\([a-zA-Z]+\))?/g.exec(jsonDamage);
        // ex. ({STR}+1)P(fire)
        const strengthDamage = /^\({STR}([+-]?[0-9]*)\)([PSM])? ?(\([a-zA-Z]+\))?/g.exec(jsonDamage);

        let damageType: DamageTypeType = 'physical';
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

        const partialDamageData = {
            type: {
                base: damageType,
                value: damageType,
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

    protected parseDamageType(parsedType: string | undefined): DamageTypeType {
        switch(parsedType) {
            case 'S':
                return 'stun';
            case 'M':
                return 'matrix';
            case 'P':
            default:
                return 'physical';
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

    protected GetRangeDataFromImportedCategory(category: string): RangeType|undefined {
        const systemRangeCategory: Exclude<keyof typeof SR5.weaponRangeCategories, "manual"> | undefined = Constants.MAP_IMPORT_RANGE_CATEGORY_TO_SYSTEM_RANGE_CATEGORY[category];
        if(!systemRangeCategory) return;

        return {
            ...SR5.weaponRangeCategories[systemRangeCategory].ranges,
            category: systemRangeCategory,
        };
    }

    protected override async getFolder(jsonData: Weapon): Promise<Folder> {
        const categoryData = jsonData.category._TEXT;
        const folderName = TH.getTranslation(categoryData, { type: 'category' });
        const match = this.categories.find(c => c._TEXT === categoryData);
        const root = match?.$?.type?.capitalize?.() ?? 'Other';

        return ['Gun', 'Melee', 'Other'].includes(root)
            ? IH.getFolder('Weapon', root, folderName)
            : IH.getFolder('Weapon', folderName);
    }
}
