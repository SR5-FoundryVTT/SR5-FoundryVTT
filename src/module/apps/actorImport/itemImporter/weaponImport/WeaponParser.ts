import { DamageType, DamageTypeType } from "src/module/types/item/Action";
import { DataDefaults } from "src/module/data/DataDefaults";
import { ActorSchema } from "../../ActorSchema";
import { Unwrap } from "../ItemsParser";
import { BlankItem, ExtractItemType, Parser } from "../Parser";
import { ImportHelper as IH } from "@/module/apps/itemImport/helper/ImportHelper";
import { AccessoryParser } from "./AccessoryParser";
import { ClipParser } from "./ClipParser";
import { RangeType } from "@/module/types/item/Weapon";
import { Constants } from "@/module/apps/itemImport/importer/Constants";

type DamageElement = DamageType['element']['base'];
type AttributeFormulaOperator = DamageType['base_formula_operator'];

export class WeaponParser extends Parser<'weapon'> {
    protected readonly parseType = 'weapon';

    private getValues(val: string) {
        const regex = /(-?[0-9]+)(?:([0-9]+))*/g;
        const l = val.match(regex);
        return l ?? ['0'];
    }

    public parseChummerDamage(rawDamage?: string | null, fallbackDamage?: string | null) {
        return this.parseDamage(rawDamage) ?? this.parseDamage(fallbackDamage);
    }

    public parseChummerAP(rawAP?: string | null, fallbackAP?: string | null) {
        for (const ap of [rawAP, fallbackAP]) {
            const apText = ap?.trim();
            if (!apText || apText === '-') continue;

            const formula = this.parseAttributeFormula(apText);
            if (formula) return formula;

            const simpleAP = /^[+-]?\d+(?:\.\d+)?$/.exec(apText);
            if (simpleAP) {
                return {
                    base: Number(simpleAP[0]) || 0,
                    attribute: '',
                    base_formula_operator: 'add',
                } as const;
            }
        }

        return null;
    }

    private parseDamage(val?: string | null) {
        const damageText = val?.trim();
        if (!damageText) return null;

        const blast = this.parseBlast(damageText);
        const damageCode = blast.damageCode;
        let damage = 0;
        let type: DamageTypeType = 'physical';
        let element: DamageElement = '';
        let attribute: DamageType['attribute'] = '';
        let base_formula_operator: AttributeFormulaOperator = 'add';
        let parsed = false;

        const attributeDamage = /^(?:\((.+)\)|(.+?))([PSM])?(?:\(([a-zA-Z]+)\))?$/i.exec(damageCode);
        if (attributeDamage) {
            const formulaText = attributeDamage[1] ?? attributeDamage[2];
            if (formulaText.includes('{')) {
                const formula = this.parseAttributeFormula(formulaText);
                if (!formula) return null;

                damage = formula.base;
                type = this.parseDamageType(attributeDamage[3]);
                element = this.parseDamageElement(attributeDamage[4]);
                attribute = formula.attribute;
                base_formula_operator = formula.base_formula_operator;
                parsed = true;
            }
        }

        if (!parsed) {
            const simpleDamage = /^(\d+)([PSM])?(?:\(([a-zA-Z]+)\))?$/i.exec(damageCode);
            if (!simpleDamage) return null;

            damage = Number(simpleDamage[1]) || 0;
            type = this.parseDamageType(simpleDamage[2]);
            element = this.parseDamageElement(simpleDamage[3]);
        }

        return {
            damage,
            type,
            element,
            attribute,
            base_formula_operator,
            dropoff: blast.dropoff,
            radius: blast.dropoff && !blast.radius ? damage / Math.abs(blast.dropoff) : blast.radius,
        } as const;
    }

    public parseAttributeFormula(val: string) {
        const expression = val.replace(/\s/g, '');
        const attributeFormula = /^(-)?\{([A-Z]+)\}(?:(\+|-|\*|\/)([+-]?\d+(?:\.\d+)?))?$/i.exec(expression);
        if (!attributeFormula) return null;

        const attribute = Constants.attributeTable[attributeFormula[2].toUpperCase()] as DamageType['attribute'] | undefined;
        if (!attribute) return null;

        const sign = attributeFormula[1] === '-' ? -1 : 1;
        const operator = attributeFormula[3];
        const operand = Number(attributeFormula[4]) || 0;

        switch (operator) {
            case '+':
                return { base: operand, attribute, base_formula_operator: 'add' } as const;
            case '-':
                return { base: -operand, attribute, base_formula_operator: 'add' } as const;
            case '*':
                return { base: sign * operand, attribute, base_formula_operator: 'multiply' } as const;
            case '/':
                return null;
            default:
                return { base: 0, attribute, base_formula_operator: sign === -1 ? 'subtract' : 'add' } as const;
        }
    }

    private parseBlast(damageText: string) {
        let damageCode = damageText;
        let radius = 0;
        let dropoff = 0;

        const dropoffMatch = /\((-?\d+)\/m\)/i.exec(damageCode);
        if (dropoffMatch) {
            dropoff = Number(dropoffMatch[1]) || 0;
            damageCode = damageCode.replace(dropoffMatch[0], '').trim();
        }

        const radiusMatch = /\((\d+)m(?:\s+radius)?\)/i.exec(damageCode);
        if (radiusMatch) {
            radius = Number(radiusMatch[1]) || 0;
            damageCode = damageCode.replace(radiusMatch[0], '').trim();
        }

        return { damageCode, radius, dropoff } as const;
    }

    private parseDamageType(parsedType?: string): DamageTypeType {
        switch (parsedType?.toUpperCase()) {
            case 'S':
                return 'stun';
            case 'M':
                return 'matrix';
            case 'P':
            default:
                return 'physical';
        }
    }

    private parseDamageElement(parsedElement?: string): DamageElement {
        switch (parsedElement?.toLowerCase()) {
            case 'e':
            case 'electricity':
                return 'electricity';
            case 'f':
            case 'fire':
                return 'fire';
            case 'cold':
                return 'cold';
            case 'acid':
                return 'acid';
            case 'pollutant':
                return 'pollutant';
            case 'radiation':
                return 'radiation';
            case 'water':
                return 'water';
            default:
                return '';
        }
    }

    async parseWeapons(chummerChar: ActorSchema | Unwrap<NonNullable<ActorSchema['vehicles']>['vehicle']>) {
        return this.parseItems(IH.getArray(chummerChar.weapons?.weapon))
    }

    parseItem(item: BlankItem<'weapon'>, itemData: ExtractItemType<'weapons', 'weapon'>) {
        const system = item.system;

        const action = system.action;
        const damage = system.action.damage;

        const chummerAP = this.parseChummerAP(itemData.rawap, itemData.ap_english);
        if (chummerAP) {
            damage.ap.base = chummerAP.base;
            damage.ap.value = damage.ap.base;
            damage.ap.attribute = chummerAP.attribute;
            damage.ap.base_formula_operator = chummerAP.base_formula_operator;
        }

        action.type = 'varies';

        // Transform Chummer skill naming schema to shadowrun5e naming schema.
        // NOTE: chummerWeapon.skill CAN be null. Don't rely on it.
        if (itemData.skill) {
            action.skill = itemData.skill.toLowerCase().replace(/\s/g, '_');
        // Instead of direct skill, rely on a category mapping by the rules.
        } else if (itemData.category_english?.toLowerCase().includes('exotic')) {
            action.skill = itemData.category_english.toLowerCase().replace(/\s/g, '_');
        } else if (itemData.category_english?.toLowerCase().includes('laser weapons')) {
            action.skill = 'exotic_ranged_weapon';
        }

        action.attribute = 'agility';

        if (itemData.rawaccuracy) {
            let accuracy: string = itemData.rawaccuracy;
            if (itemData.rawaccuracy.includes('Physical')) {
                action.limit.attribute = 'physical';
                accuracy = accuracy.replace('Physical', '').trim();
            }
            action.limit.base = Number(this.getValues(accuracy)[0]) || 0;
        }

        if (itemData.type.toLowerCase() === 'melee') {
            this.handleMeleeWeapon(system, itemData)
        } 

        if (itemData.type.toLowerCase() === 'ranged') {
            this.handledRangedWeapon(system, itemData)
        } else if (itemData.type.toLowerCase() === 'thrown') {
            system.category = 'thrown';
            const ranges = IH.getArray(itemData.ranges)[0];
            if (ranges?.short && ranges.medium && ranges.long && ranges.extreme) {
                system.thrown = {
                    ...system.thrown,
                    ranges: {
                        short: parseInt(ranges.short.split('-')[1]),
                        medium: parseInt(ranges.medium.split('-')[1]),
                        long: parseInt(ranges.long.split('-')[1]),
                        extreme: parseInt(ranges.extreme.split('-')[1]),
                        category: 'manual',
                        attribute: '',
                    }
                };
            }
        }

        const chummerDamage = this.parseChummerDamage(itemData.rawdamage, itemData.damage_english);
        if (chummerDamage) {
            damage.base = chummerDamage.damage;
            damage.value = chummerDamage.damage;
            damage.attribute = chummerDamage.attribute;
            damage.type.base = chummerDamage.type;
            damage.type.value = chummerDamage.type;
            damage.element.base = chummerDamage.element;
            damage.element.value = chummerDamage.element;
            damage.base_formula_operator = chummerDamage.base_formula_operator;

            if (chummerDamage.dropoff || chummerDamage.radius) {
                system.thrown = {
                    ...system.thrown,
                    blast: {
                        radius: chummerDamage.radius,
                        dropoff: chummerDamage.dropoff,
                    },
                };
            }
        }
    }

    protected override parseCategoryFlags(item: BlankItem<'weapon'>, itemData: ExtractItemType<'weapons', 'weapon'>) {
        let category = '';
        if (item.system.category)
            category = item.system.category;

        const weaponCategory = itemData.category_english;
        if (!(category && ( weaponCategory === 'gear')))
            category = weaponCategory;

        if (weaponCategory === 'gear' && itemData.name_english.includes(':'))
            category = itemData.name_english.split(':')[0];

        return category;
    }

    override async getEmbeddedItems(itemData: ExtractItemType<'weapons', 'weapon'>): Promise<Item.CreateData[]> {
        return [
            ...(await new AccessoryParser().parseItems(itemData.accessories?.accessory)),
            ...(await new ClipParser(itemData).parseItems(itemData.clips?.clip)),
        ] as Item.CreateData[];
    }

    handleMeleeWeapon(system: BlankItem<'weapon'>['system'], itemData: ExtractItemType<'weapons', 'weapon'>) {
        system.action.type = 'complex';
        system.category = 'melee';
        system.melee.reach = Number(itemData.rawreach) || 0;
    }

    handledRangedWeapon(system: BlankItem<'weapon'>['system'], itemData: ExtractItemType<'weapons', 'weapon'>) {
        system.category = 'range';

        if (system.action.skill.toLowerCase().includes('throw'))
            system.category = 'thrown';

        system.ammo.current.value = Number((/\d+/.exec(itemData.ammo_english))?.[0]) || 0;
        system.ammo.current.max = system.ammo.current.value;

        if (itemData.clips?.clip) {
            const clipsArray = IH.getArray(itemData.clips.clip);
            const currentClip = clipsArray.find(clip => clip.name === itemData.currentammo);
            system.ammo.current.value = Number(currentClip?.count) || system.ammo.current.value;
        }

        if (system.ammo.current.max) {
            const totalAmmo = Number(itemData.availableammo) || 0;
            const currentAmmo = system.ammo.current.value;
            const clipSize = system.ammo.current.max;

            const spareClips = Math.max(0, Math.floor((totalAmmo - currentAmmo) / clipSize));
            system.ammo.spare_clips.max = spareClips;
            system.ammo.spare_clips.value = spareClips;
        }

        const range = DataDefaults.createData('range_weapon');
        system.range = range;
        range.rc.base = Number(this.getValues(itemData.rawrc)[0]) || 0;

        if (itemData.mode) {
            const modes = (itemData.mode_english_noammo ?? itemData.mode_noammo)!.toLowerCase();
            range.modes = {
                single_shot: modes.includes('ss'),
                semi_auto: modes.includes('sa'),
                burst_fire: modes.includes('bf'),
                full_auto: modes.includes('fa'),
            };
        }

        const ranges = IH.getArray(itemData.ranges)[0]
        if (ranges?.short && ranges.medium && ranges.long && ranges.extreme) {
            const rangeData = {
                short: parseInt(ranges.short.split('-')[1]),
                medium: parseInt(ranges.medium.split('-')[1]),
                long: parseInt(ranges.long.split('-')[1]),
                extreme: parseInt(ranges.extreme.split('-')[1]),
                category: 'manual',
                attribute: ''
            } satisfies RangeType;

            if(system.category === "range") {
                range.ranges = rangeData;
            }

            if(system.category === "thrown") {
                system.thrown = {
                    ...system.thrown,
                    ranges: rangeData,
                };
            }
        }

    }
}
