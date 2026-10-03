import { DataDefaults } from 'src/module/data/DataDefaults';
import { WeaponParserBase } from '../parser/weapon/WeaponParserBase';
import { Constants, CompendiumKey } from '../importer/Constants';
import { ImportHelper as IH } from './ImportHelper';

export interface NaturalWeaponEntry {
    _TEXT: string;
    $?: {
        select?: string;
        rating?: string;
    };
}

export class NaturalWeaponHelper {
    private static _weaponParser: WeaponParserBase | null = null;

    private static get weaponParser(): WeaponParserBase {
        if (!this._weaponParser) {
            this._weaponParser = new WeaponParserBase();
        }
        return this._weaponParser;
    }

    /**
     * Determines if a power entry represents a natural weapon based on name or damage formula in select.
     */
    static isNaturalWeapon(entry: { _TEXT?: string; $?: { select?: string; }; } | null | undefined): boolean {
        if (!entry) return false;
        const text = (entry._TEXT || '').trim().toLowerCase();
        const select = (entry.$?.select || '').trim();
        if (text === 'natural weapon' || text.includes('natural weapon')) return true;
        if (select && /\bDV\s+[^,]+/i.test(select)) return true;
        return false;
    }

    /**
     * Parse natural weapon power entries into Item.CreateData<'weapon'> documents.
     */
    static parseNaturalWeapons(
        powers: NaturalWeaponEntry[],
        options: { actorName?: string; } = {}
    ): Item.CreateData<'weapon'>[] {
        const items: Item.CreateData<'weapon'>[] = [];

        for (const entry of powers) {
            if (!this.isNaturalWeapon(entry)) continue;

            const select = (entry.$?.select ?? '').trim();
            if (!select) continue;

            // 1. Extract optional Name (e.g., "Bite:", "Bite (Infection):", or "Claws (DV...")
            let rawName = 'Natural Weapon';
            const colonIndex = select.indexOf(':');
            if (colonIndex > 0 && !/^DV\b/i.test(select.slice(0, colonIndex).trim())) {
                rawName = select.slice(0, colonIndex).trim();
            } else {
                const parenIndex = select.indexOf('(');
                if (parenIndex > 0 && !/^DV\b/i.test(select.slice(0, parenIndex).trim())) {
                    rawName = select.slice(0, parenIndex).trim();
                } else if (entry._TEXT && entry._TEXT.trim().toLowerCase() !== 'natural weapon') {
                    rawName = entry._TEXT.trim();
                }
            }

            // Split the name by '/' (e.g., "Bite / Claws" -> ["Bite", "Claws"])
            const names = rawName.split('/').map(n => n.trim()).filter(Boolean);
            if (names.length === 0) names.push('Natural Weapon');

            const rawDamage = /\bDV\s+([^,]+)/i.exec(select)?.[1]?.trim();
            if (!rawDamage) {
                console.warn(`[Natural Weapon Parse]\nCritter: ${options.actorName ?? 'Unknown'}\nSelect: ${select}`);
                continue;
            }
            const damageText = rawDamage.replace(/\b(BOD|AGI|REA|STR|CHA|INT|LOG|WIL|EDG|MAG|RES)\b/gi, (match) => {
                return `{${match.toUpperCase()}}`;
            }).replace(/\{\{/g, '{').replace(/\}\}/g, '}');

            const apText = /\bAP\s+([^,]+)/i.exec(select)?.[1]?.trim() ?? '-';

            // 4. Extract Reach (Optional)
            const reachMatch = /(?:\bREACH\s+([-+]?\d+)\b|\b([-+]?\d+)\s+REACH\b)/i.exec(select);
            const reach = reachMatch ? Number(reachMatch[1] ?? reachMatch[2]) || 0 : undefined;

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
            system.action.damage = this.weaponParser.parseDamageData(damageText, apText, system.action.damage.normal_weapon);

            // --- Push Items ---
            for (const itemName of names) {
                items.push({
                    _id: foundry.utils.randomID(),
                    name: itemName,
                    type: 'weapon',
                    img: 'systems/shadowrun5e/dist/icons/importer/critter_power/critter_power.svg',
                    system: foundry.utils.deepClone(system),
                } satisfies Item.CreateData<'weapon'>);
            }
        }

        return items;
    }

    /**
     * Ensures a parsed natural weapon exists in the weapon compendium (`world.sr5weapon`)
     * and returns its compendium UUID (`Compendium.world.sr5weapon.Item.<id>`).
     */
    static async ensureNaturalWeaponInCompendium(
        weaponData: Item.CreateData<'weapon'>,
        preferredId?: string
    ): Promise<string | null> {
        const compKey: CompendiumKey = 'Weapon';
        const compConfig = Constants.MAP_COMPENDIUM_KEY[compKey];
        const compendium = await IH.GetCompendium(compKey);
        const targetId: string = preferredId ?? (typeof weaponData._id === 'string' ? weaponData._id : foundry.utils.randomID());
        const uuid = `Compendium.world.${compConfig.pack}.Item.${targetId}`;

        if (compendium.index.has(targetId)) {
            return uuid;
        }

        const createData: Item.CreateData<'weapon'> = {
            ...weaponData,
            _id: targetId,
        };

        IH.setItem(compKey, weaponData.name, targetId);

        try {
            await IH.createDocumentInCompendium(compKey, createData);
            return uuid;
        } catch (error) {
            console.error(`SR5 | Error creating natural weapon ${weaponData.name} in compendium:`, error);
            return null;
        }
    }
}
