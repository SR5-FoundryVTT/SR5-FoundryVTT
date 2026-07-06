import { SR5 } from '../../../../config';
import { Parser, SystemType } from '../Parser';
import { Weapon } from '../../schema/WeaponsSchema';
import { RangeType } from 'src/module/types/item/Weapon';
import { DataDefaults } from '../../../../data/DataDefaults';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { CompendiumKey, Constants } from '../../importer/Constants';
import { DamageType, DamageTypeType } from 'src/module/types/item/Action';
type DamageElement = DamageType['element']['base'];
type AttributeFormulaOperator = DamageType['base_formula_operator'];
type ParsedAttributeFormula = {
    base: number;
    attribute: DamageType['attribute'];
    base_formula_operator: AttributeFormulaOperator;
};

export class WeaponParserBase extends Parser<'weapon'> {
    protected readonly parseType = 'weapon';

    protected override async getItems(jsonData: Weapon): Promise<Item.Source[]> {
        if (!jsonData.accessories?.accessory) return [];

        const accessories = IH.getArray(jsonData.accessories.accessory);
        const accessoriesNames = accessories.map(acc => acc.name._TEXT);

        const foundItems = await IH.findItems('Weapon_Mod', accessoriesNames);
        const itemMap = new Map(foundItems.map(({name_english, ...i}) => [name_english, i]));

        const result: Item.Source[] = [];
        for (const accessory of accessories) {
            const name = accessory.name._TEXT;
            const item = itemMap.get(name);

            if (!item) {
                console.warn(`[Accessory Missing]\nWeapon: ${jsonData.name._TEXT}\nAccessory: ${name}`);
                continue;
            }

            item._id = foundry.utils.randomID();
            const system = item.system as SystemType<'modification'>;
            system.technology.equipped = true;

            const ratingText = accessory.rating?._TEXT;
            if (ratingText)
                system.technology.rating = Number(ratingText) || 0;

            result.push(item);
        }

        return result;
    }

    private getSkill(weaponJson: Weapon): string {
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
            return type === 'range' ? 'exotic_ranged_weapon' : 'exotic_melee_weapon';
        }
    }

    public static getWeaponType(weaponJson: Weapon): SystemType<'weapon'>['category'] {
        const type = weaponJson.type._TEXT;
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

    protected override getSystem(jsonData: Weapon) {
        const system = this.getBaseSystem();

        system.action.type = 'varies';
        system.action.attribute = 'agility';

        const category = jsonData.category._TEXT;

        system.category = WeaponParserBase.getWeaponType(jsonData);
        system.subcategory = category.toLowerCase();

        system.action.skill = this.getSkill(jsonData);
        system.action.damage = this.getDamage(jsonData as any);

        if (jsonData.accuracy?._TEXT) {
            let accuracy: string = jsonData.accuracy._TEXT;
            if (accuracy.includes('Physical')) {
                system.action.limit.attribute = 'physical';
                accuracy = accuracy.replace('Physical', '').trim();
            }

            system.action.limit.base = Number(accuracy) || 0;
        }

        system.technology.conceal.base = Number(jsonData.conceal?._TEXT);

        return system;
    }
    
    protected getDamage(jsonData: Weapon): DamageType {
        const partialDamageData: Partial<DamageType> = {};
        const damageText = String(jsonData.damage._TEXT).trim();

        const attributeDamage = /^(?:\((.+)\)|(.+))([PSM])?(?:\(([a-zA-Z]+)\))?(?:\s+\(-?\d+\/m\))?$/i.exec(damageText);
        if (attributeDamage) {
            const formulaText = attributeDamage[1] ?? attributeDamage[2];
            if (formulaText.includes('{')) {
                const formula = this.parseAttributeFormula(formulaText);
                if (formula) {
                    const damageType = this.parseDamageType(attributeDamage[3]);
                    const damageElement = this.parseDamageElement(attributeDamage[4]);

                    partialDamageData.base = formula.base;
                    partialDamageData.value = formula.base;
                    partialDamageData.attribute = formula.attribute;
                    partialDamageData.base_formula_operator = formula.base_formula_operator;
                    partialDamageData.type = { base: damageType, value: damageType };
                    partialDamageData.element = { base: damageElement, value: damageElement };
                }
            }
        }

        if (partialDamageData.base === undefined) {
            const simpleDamage = /^(\d+)([PSM])?(?:\(([a-zA-Z]+)\))?(?:\s+\(-?\d+\/m\))?$/i.exec(damageText);
            if (simpleDamage) {
                const damageType = this.parseDamageType(simpleDamage[2]);
                const damageElement = this.parseDamageElement(simpleDamage[3]);
                const damageBase = Number(simpleDamage[1]) || 0;

                partialDamageData.base = damageBase;
                partialDamageData.value = damageBase;
                partialDamageData.type = { base: damageType, value: damageType };
                partialDamageData.element = { base: damageElement, value: damageElement };
            }
        }

        const apText = String(jsonData.ap._TEXT).trim();
        const apFormula = this.parseAttributeFormula(apText);
        const simpleAP = /^[+-]?\d+(?:\.\d+)?$/.exec(apText);
        if (apFormula) {
            partialDamageData.ap = {
                base: apFormula.base,
                value: apFormula.base,
                attribute: apFormula.attribute,
                base_formula_operator: apFormula.base_formula_operator,
            } as DamageType['ap'];
        } else if (simpleAP) {
            const damageAp = Number(simpleAP[0]) || 0;
            partialDamageData.ap = { base: damageAp, value: damageAp } as DamageType['ap'];
        }

        return DataDefaults.createData('damage', partialDamageData);
    }

    public parseAttributeFormula(val: string): ParsedAttributeFormula | null {
        const expression = val.replace(/\s/g, '');
        const attributeFormula = /^(-)?\{([A-Z]+)\}(?:(\+|-|\*|\/)([+-]?\d+(?:\.\d+)?))?$/i.exec(expression);
        if (!attributeFormula) return null;

        const mappedAttribute = Constants.attributeTable[attributeFormula[2].toUpperCase() as keyof typeof Constants.attributeTable];
        if (!mappedAttribute) return null;
        const attribute = mappedAttribute as DamageType['attribute'];

        const sign = attributeFormula[1] === '-' ? -1 : 1;
        const operator = attributeFormula[3];
        const operand = Number(attributeFormula[4]) || 0;

        switch (operator) {
            case '+':
                return { base: operand, attribute, base_formula_operator: 'add' };
            case '-':
                return { base: -operand, attribute, base_formula_operator: 'add' };
            case '*':
                return { base: sign * operand, attribute, base_formula_operator: 'multiply' };
            case '/':
                return null;
            default:
                return { base: 0, attribute, base_formula_operator: sign === -1 ? 'subtract' : 'add' };
        }
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
            case 'e':
            case '(e)':
                return 'electricity';
            case 'f':
            case '(f)':
            case 'fire':
            case '(fire)':
                return 'fire';
            default:
                return '';
        }
    }

    protected getRangeData(category: string): RangeType {
        if (!(category in Constants.RANGE_CATEGORY_MAP))
            return DataDefaults.createData("range");

        const mappedCategory = Constants.RANGE_CATEGORY_MAP[
            category as keyof typeof Constants.RANGE_CATEGORY_MAP
        ];

        return DataDefaults.createData("range", {
            ...SR5.weaponRangeCategories[mappedCategory].ranges,
            category: mappedCategory,
        });
    }

    protected override setImporterFlags(entity: Item.CreateData, jsonData: Weapon): void {
        super.setImporterFlags(entity, jsonData);

        if (entity.system!.importFlags!.category === 'Gear') {
            entity.system!.importFlags!.category = entity.name.split(':')[0].trim();
        }
    }

    protected override async getFolder(jsonData: Weapon, compendiumKey: CompendiumKey): Promise<Folder> {
        const categoryData = jsonData.category._TEXT;
        const root = WeaponParserBase.getWeaponType(jsonData).capitalize() ?? "Other";
        const folderName = IH.getTranslatedCategory('weapons', categoryData);

        return IH.getFolder(compendiumKey, root, root === 'Thrown' ? undefined : folderName);
    }
}
