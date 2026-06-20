import { Parser } from '../Parser';
import { Metatype } from '../../schema/MetatypeSchema';
import { BonusSchema } from '../../schema/BonusSchema';
import { DataDefaults } from 'src/module/data/DataDefaults';
import { InitiativeType } from 'src/module/types/template/Initiative';
import { ImportHelper as IH, OneOrMany, RetrievedItem } from '../../helper/ImportHelper';

type MetatypeItemData = {
    _TEXT: string;
    $?: { select?: string; rating?: string; spec?: string };
};

export abstract class MetatypeParserBase<TResult extends ('character' | 'spirit' | 'sprite')> extends Parser<TResult> {
    /**
     * Returns metatype bonus data stripped of initiative keys to avoid duplicate initiative application.
     */
    protected override getBonus(jsonData: Metatype): BonusSchema | undefined {
        const bonus = jsonData.bonus;
        if (!bonus) return undefined;

        const filtered = foundry.utils.deepClone(bonus);
        delete filtered.initiative;
        delete filtered.initiativedice;
        delete filtered.initiativepass;
        return filtered;
    }

    /**
     * Merges many optional one-or-many arrays into a single non-null list.
     */
    protected mergeLists<T>(...lists: Array<OneOrMany<T> | undefined>): Array<NonNullable<T>> {
        return lists.flatMap(list => IH.getArray(list)).filter(v => v != null);
    }

    /**
     * Converts one-or-many `_TEXT` collections into a flat name list.
     */
    protected getNamedList(...collections: Array<undefined | OneOrMany<{ _TEXT: string }>>) {
        return collections.flatMap(collection => IH.getArray(collection).map(entry => entry._TEXT));
    }

    /**
     * Parses special attribute expressions (F, F+N, F-N, numeric) into applies/base values.
     */
    protected parseSpecialOffset(raw: string) {
        const value = (raw ?? '').trim();
        if (!value) return { appliesSpecial: false, base: 0 };

        const escapedToken = 'F'.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (new RegExp(`^${escapedToken}$`, 'i').test(value))
            return { appliesSpecial: true, base: 0 };

        const offsetMatch = new RegExp(`^${escapedToken}\\s*([+-])\\s*(\\d+)$`, 'i').exec(value);
        if (offsetMatch) {
            const sign = offsetMatch[1] === '-' ? -1 : 1;
            const amount = Number(offsetMatch[2]) || 0;
            return { appliesSpecial: true, base: sign * amount };
        }

        return { appliesSpecial: false, base: Number(value) || 0 };
    }

    /**
     * Applies movement values from metatype walk/run/sprint fields to actor movement base values.
     */
    protected applyMovement(
        system: ReturnType<typeof this.getBaseSystem>,
        jsonData: Pick<Metatype, 'walk' | 'run' | 'sprint'>,
    ) {
        if (!('movement' in system)) return;

        if (jsonData.walk)
            system.movement.walk.base = Number(jsonData.walk._TEXT.split('/')[0] ?? 0);

        if (jsonData.run)
            system.movement.run.base = Number(jsonData.run._TEXT.split('/')[0] ?? 0);

        system.movement.sprint = Number(jsonData.sprint?._TEXT.split('/')[0] ?? 0);
    }

    /**
     * Parses initiative formula expressions using F as a special attribute token.
     */
    private parseInitFormula(raw: string, specialAttr: 'force' | 'level') {
        const normalized = raw.replace(/\s+/g, '').toUpperCase();
        if (!normalized) return null;

        const match = /^(\(F\*2\)|F)?([+-]?\d+)?$/.exec(normalized);
        if (!match || (!match[1] && !match[2])) return null;

        const [, fModifier, constantStr] = match;
        if (!fModifier) return null;

        return {
            attributeA: fModifier === '(F*2)' ? specialAttr : '',
            attributeB: fModifier ? specialAttr : '',
            constant: Number(constantStr) || 0
        } as const;
    }

    /**
     * Parses initiative fields into initiative formula data for the selected mode.
     */
    protected parseInitiative(
        system: ReturnType<typeof this.getBaseSystem>,
        { inimin, bonus }: Pick<Metatype, 'inimin' | 'bonus'>,
        options: {
            mode: 'meatspace' | 'matrix';
            specialAttr?: 'force' | 'level';
        },
    ) {
        const initiative = system.initiative[options.mode] as InitiativeType | undefined;
        if (!initiative) return;

        if (options.specialAttr) {
            const parsedFormula = this.parseInitFormula(inimin._TEXT, options.specialAttr);

            if (parsedFormula) {
                initiative.attribute_a = parsedFormula.attributeA;
                initiative.attribute_b = parsedFormula.attributeB;
                initiative.constant.base = parsedFormula.constant;
            }
        }

        if (options.mode === 'meatspace') {
            const deltaConstant = Number(bonus?.initiative?._TEXT) || 0;
            const deltaDice = Number(bonus?.initiativedice?._TEXT) || Number(bonus?.initiativepass?._TEXT) || 0;

            initiative.dice.base = 1 + deltaDice;
            initiative.constant.base += deltaConstant;
        }
    }

    /**
     * Resolves metatype-linked items and applies selection/rating metadata to imported item data.
     */
    getMetatypeItems(
        items: RetrievedItem[],
        itemsData: OneOrMany<MetatypeItemData> | undefined,
        msg_field: {type: string; critter: string},
    ): Item.Source[] {
        const itemMap = new Map(items.map(({name_english, ...i}) => [name_english, i]));

        const result: Item.Source[] = [];
        for (const itemData of IH.getArray(itemsData)) {
            const name = itemData._TEXT;
            const item = itemMap.get(name);

            if (!item) {
                console.warn(`[${msg_field.type} Missing]\nCritter: ${msg_field.critter}\n${msg_field.type}: ${name}`);
                continue;
            }

            item._id = foundry.utils.randomID();
            const system = item.system;

            if (itemData.$?.select)
                item.name += ` (${itemData.$.select})`;

            if (msg_field.type === 'Optional Power' && 'optional' in system && system.optional)
                system.optional = 'disabled_option';

            if (itemData.$?.rating) {
                const rating = Number(itemData.$.rating) || 0;
                if ('rating' in system)
                    system.rating = rating;
                else if ('technology' in system)
                    system.technology.rating = rating;
                else if ('skill' in system) {
                    system.group.rating = itemData.$.rating.includes('F') ? 1 : rating;
                    system.skill.rating = itemData.$.rating.includes('F') ? 1 : rating;
                    if (itemData.$.spec) system.skill.specializations.push({ name: itemData.$.spec });
                }
            }

            result.push(item);
        }

        return result;
    }

    /**
     * Builds weapon items from all natural-weapon power entries while keeping power import intact.
     */
    protected getNaturalWeapons(
        powers: { _TEXT: string; $?: { select?: string; }; }[],
        options: { actorName: string; },
    ): Item.Source[] {
        const items: Item.Source[] = [];

        for (const entry of powers) {
            if (entry._TEXT.trim().toLowerCase() !== 'natural weapon') continue;

            const select = (entry.$?.select ?? '').trim();
            if (!select) continue;

            // 1. Extract optional Name (e.g., "Bite:" or "Claws (DV...")
            let rawName = 'Natural Weapon';
            const nameMatch = /^([^:(]+?)[:(]/.exec(select);
            if (nameMatch && !/^DV\b/i.test(nameMatch[1].trim())) {
                rawName = nameMatch[1].trim();
            }

            // Split the name by '/' (e.g., "Bite / Claws" -> ["Bite", "Claws"])
            const names = rawName.split('/').map(n => n.trim()).filter(Boolean);
            if (names.length === 0) names.push('Natural Weapon');

            // 2. Extract DV segment anywhere in the string
            const dvMatch = /\bDV\s+(\(?[A-Z0-9+-]+\)?)\s*([PSM])?\b/i.exec(select);
            if (!dvMatch) {
                console.warn(`[Natural Weapon Parse]\nCritter: ${options.actorName}\nSelect: ${select}`);
                continue;
            }

            const dvFormula = dvMatch[1].toUpperCase().replace(/[()\s]/g, '');
            let damageBase = 0;
            let damageAttribute: 'strength' | 'force' | undefined;

            if (dvFormula.includes('STR')) {
                damageAttribute = 'strength';
                damageBase = Number(/[+-]\d+/.exec(dvFormula)?.[0]) || 0;
            } else if (dvFormula.includes('F')) {
                damageAttribute = 'force';
                damageBase = Number(/[+-]\d+/.exec(dvFormula)?.[0]) || 0;
            } else {
                damageBase = Number(dvFormula) || 0;
            }

            const typeStr = dvMatch[2]?.toUpperCase();
            const damageType = typeStr === 'S' ? 'stun' : 'physical';

            // 3. Extract AP segment anywhere in the string (Optional)
            const apMatch = /\bAP\s+([-A-Z0-9+]+)\b/i.exec(select);
            let apBase = 0;
            let apAttribute: 'force' | undefined;
            let apOperator: 'add' | 'subtract' | undefined;

            if (apMatch) {
                const apRaw = apMatch[1].toUpperCase().replace(/\s+/g, '');
                if (apRaw.includes('F')) {
                    apAttribute = 'force';
                    apOperator = apRaw.includes('-') ? 'subtract' : 'add';
                    apBase = Number(/[+-]\d+/.exec(apRaw)?.[0]) || 0;
                } else {
                    apBase = Number(apRaw) || 0;
                }
            }

            // 4. Extract Reach (Optional)
            const reachMatch = /\bREACH\s+([-+]?\d+)\b/i.exec(select);
            const reach = reachMatch ? Number(reachMatch[1]) || 0 : undefined;

            // 5. Detect if the weapon is Ranged
            const isRanged = /\bRANGED?\b/i.test(select);

            // --- Build Item System Data ---
            const system = DataDefaults.baseSystemData('weapon');
            system.action.type = 'varies';
            system.melee.reach = reach || 0;
            system.technology.equipped = true;
            system.subcategory = 'natural_weapon';
            system.category = isRanged ? 'range' : 'melee';

            system.action.attribute = 'agility';
            system.action.skill = isRanged ? 'exotic_ranged_weapon' : 'unarmed_combat';
            
            system.action.damage = DataDefaults.createData('damage', {
                base: damageBase,
                type: { base: damageType },
                ap: { 
                    base: apBase,
                    ...(apAttribute && { 
                        attribute: apAttribute,
                        base_formula_operator: apOperator 
                    })
                },
                ...(damageAttribute && { attribute: damageAttribute }),
            });

            // --- Push Items ---
            // Loop through all parsed names and create a unique item for each one
            for (const itemName of names) {
                items.push({
                    _id: foundry.utils.randomID(),
                    name: itemName,
                    type: 'weapon' as const,
                    img: 'systems/shadowrun5e/dist/icons/importer/critter_power/critter_power.svg',
                    // Deep clone prevents multiple items from sharing the exact same memory reference
                    system: foundry.utils.deepClone(system), 
                } satisfies Item.CreateData<'weapon'> as unknown as Item.Source);
            }
        }

        return items;
    }
}
