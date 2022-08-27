import { parseDescription, getArray, getValues, parseTechnology, createItemData } from "./BaseParserFunctions.js"

export class WeaponParser {
    parseDamage = (val) => {
        const damage = {
            damage: 0,
            type: 'physical',
            radius: 0,
            dropoff: 0,
        };
        const split = val.split(',');
        if (split.length > 0) {
            const l = split[0].match(/(\d+)(\w+)/);
            if (l && l[1]) damage.damage = parseInt(l[1]);
            if (l && l[2]) damage.type = l[2] === 'P' ? 'physical' : 'stun';
        }
        for (let i = 1; i < split.length; i++) {
            const l = split[i].match(/(-?\d+)(.*)/);
            if (l && l[2]) {
                if (l[2].toLowerCase().includes('/m')) damage.dropoff = parseInt(l[1]);
                else damage.radius = parseInt(l[1]);
            }
        }
        return damage;
    };

    parseWeapons(chummerChar) {
        const weapons = getArray(chummerChar.weapons.weapon);
        const parsedWeapons = [];

        weapons.forEach((chummerWeapon) => {
            try {
                const itemData = this.parseWeapon(chummerWeapon);
                parsedWeapons.push(itemData);
            } catch (e) {
                console.error(e);
            }
        });

        return parsedWeapons;
    }

    parseWeapon(chummerWeapon) {
        const data = {};
        const action = {};
        const damage = {};
        action.damage = damage;
        data.action = action;

        data.description = parseDescription(chummerWeapon);
        data.technology = parseTechnology(chummerWeapon);

        damage.ap = {
            base: parseInt(getValues(chummerWeapon.ap)[0])
        };
        action.type = 'varies';

        // Transform Chummer skill naming schema to shadowrun5e naming schema.
        // NOTE: chummerWeapon.skill CAN be null. Don't rely on it.
        if (chummerWeapon.skill) {
            action.skill = chummerWeapon.skill.toLowerCase().replace(/\s/g, '_');
        // Instead of direct skill, rely on a category mapping by the rules.
        } else if (chummerWeapon.category && chummerWeapon.category.toLowerCase().includes('exotic')) {
            action.skill = chummerWeapon.category
                .toLowerCase()
                .replace(' weapons', '')
                .replace(/\s/g, '_');
        } else if (chummerWeapon.category && chummerWeapon.category.toLowerCase().includes('laser weapons')) {
            action.skill = 'exotic_range';
        }

        if (action.skill.includes('exotic')) {
            action.skill = action.skill.replace('_weapon', '');
        }

        action.attribute = 'agility';
        action.limit = {
            base: parseInt(getValues(chummerWeapon.accuracy)[0])
        };

        if (chummerWeapon.type.toLowerCase() === 'melee') {
            action.type = 'complex';
            data.category = 'melee';
            const melee = {};
            data.melee = melee;
            melee.reach = parseInt(chummerWeapon.reach);
        } else if (chummerWeapon.type.toLowerCase() === 'ranged') {
            data.category = 'range';
            if (action.skill.toLowerCase().includes('throw')) {
                data.category = 'thrown';
            }
            const range = {};
            data.range = range;
            range.rc = {
                base: parseInt(getValues(chummerWeapon.rc)[0]),
            };
            if (chummerWeapon.mode) {
                // HeroLab export doesn't have mode
                const lower = chummerWeapon.mode.toLowerCase();
                range.modes = {
                    single_shot: lower.includes('ss'),
                    semi_auto: lower.includes('sa'),
                    burst_fire: lower.includes('bf'),
                    full_auto: lower.includes('fa'),
                };
            }
            if (chummerWeapon.clips != null && chummerWeapon.clips.clip != null) {
                // HeroLab export doesn't have clips
                const clips = Array.isArray(chummerWeapon.clips.clip)
                    ? chummerWeapon.clips.clip
                    : [chummerWeapon.clips.clip];
                clips.forEach((clip) => {
                    console.log(clip);
                });
            }
            if (chummerWeapon.ranges &&
                chummerWeapon.ranges.short &&
                chummerWeapon.ranges.medium &&
                chummerWeapon.ranges.long &&
                chummerWeapon.ranges.extreme) {
                console.log(chummerWeapon.ranges);
                range.ranges = {
                    short: parseInt(chummerWeapon.ranges.short.split('-')[1]),
                    medium: parseInt(chummerWeapon.ranges.medium.split('-')[1]),
                    long: parseInt(chummerWeapon.ranges.long.split('-')[1]),
                    extreme: parseInt(chummerWeapon.ranges.extreme.split('-')[1]),
                };
            }

        } else if (chummerWeapon.type.toLowerCase() === 'thrown') {
            data.category = 'thrown';
        }
        {
            // TODO handle raw damage if present
            const d = this.parseDamage(chummerWeapon.damage_english);
            damage.base = d.damage;
            damage.type = {};
            damage.type.base = d.type;
            if (d.dropoff || d.radius) {
                const thrown = {};
                data.thrown = thrown;
                thrown.blast = {
                    radius: d.radius,
                    dropoff: d.dropoff,
                };
            }
        }

        const itemData = createItemData(chummerWeapon.name, 'weapon', data);
        return itemData;
    }
}