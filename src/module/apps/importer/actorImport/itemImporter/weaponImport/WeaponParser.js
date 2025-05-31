import { parseDescription, getArray, getValues, parseTechnology, createItemData, formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions.js"
import * as IconAssign from '../../../../iconAssigner/iconAssign.js';

export class WeaponParser {
    parseDamage = (val) => {
        const damage = {
            damage: 0,
            type: '',
            radius: 0,
            dropoff: 0,
        };

        const split = val.split(' ');

        if (split.length > 0) {
            const l = split[0].match(/(\d+)(\w+)/);
            
            if (l && l[1]) {
                damage.damage = parseInt(l[1]);
            }

            if (l && l[2]) {
                damage.type = l[2] === 'P' ? 'physical' : 'stun';
            }
        }

        for (let i = 1; i < split.length; i++) {
            const l = split[i].match(/(-?\d+)(.*)/);
            if (l && l[2]) {
                if (l[2].toLowerCase().includes('/m')) { 
                    damage.dropoff = parseInt(l[1]);
                    damage.radius = damage.damage / Math.abs(damage.dropoff)
                }
                else {
                    damage.radius = parseInt(l[1]);
                }
            }
        }

        return damage;
    };

    async parseWeapons(chummerChar, assignIcons) {
        return this.parseWeaponArray(getArray(chummerChar.weapons?.weapon), assignIcons)
    }

    async parseWeaponArray(weapons, assignIcons) {
        const parsedWeapons = [];
        const iconList = await IconAssign.getIconFiles();
        weapons.forEach(async (chummerWeapon) => {
            try {
                const itemData = this.parseWeapon(chummerWeapon);

                // Assign the icon if enabled
                if (assignIcons) {itemData.img = await IconAssign.iconAssign(itemData.system.importFlags, itemData.system, iconList)};

                parsedWeapons.push(itemData);
            } catch (e) {
                console.error(e);
            }
        });

        return parsedWeapons;
    }

    parseWeapon(chummerWeapon) {
        const parserType = 'weapon';
        const system = {
            action: {
                damage: {

                }
            }
        };

        const action = system.action;
        const damage = system.action.damage;

        system.description = parseDescription(chummerWeapon);
        system.technology = parseTechnology(chummerWeapon);

        damage.ap = {
            base: parseInt(getValues(chummerWeapon.rawap)[0])
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
            base: parseInt(getValues(chummerWeapon.rawaccuracy)[0])
        };

        if (chummerWeapon.type.toLowerCase() === 'melee') {
            this.handleMeleeWeapon(chummerWeapon, system)
        } 

        if (chummerWeapon.type.toLowerCase() === 'ranged') {
            this.handledRangedWeapon(chummerWeapon, system)
        } else if (chummerWeapon.type.toLowerCase() === 'thrown') {
            system.category = 'thrown';
            const ranges = chummerWeapon.ranges[0]
            if (ranges && ranges.short && ranges.medium && ranges.long && ranges.extreme) {
                system.thrown = {
                    ...system.thrown,
                    ranges: {
                        short: parseInt(ranges.short.split('-')[1]),
                        medium: parseInt(ranges.medium.split('-')[1]),
                        long: parseInt(ranges.long.split('-')[1]),
                        extreme: parseInt(ranges.extreme.split('-')[1]),
                    }
                };
            }
        }

        {
            //TODO change this to 'rawdamage' when mods can have damage value
            const chummerDamage = this.parseDamage(chummerWeapon.damage_noammo_english);
            damage.base = chummerDamage.damage;
            damage.type = {
                base: chummerDamage.type
            };
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

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(chummerWeapon.name_english), parserType);

        // Assign item subtype
        let subType = '';
        // range/melee/thrown
        if (system.category) {
            subType = formatAsSlug(system.category);
        }
        // exception for thrown weapons and explosives
        const weaponCategory = formatAsSlug(chummerWeapon.category_english);
        if (!(subType && ( weaponCategory == 'gear'))) {
            subType = weaponCategory;
        }
        // deal with explosives
        if (weaponCategory == 'gear' && chummerWeapon.name_english.includes(':')) {
            subType = formatAsSlug(chummerWeapon.name_english.split(':')[0]);
        }
        setSubType(system, parserType, subType);

        // Create the item
        const itemData = createItemData(chummerWeapon.name, 'weapon', system);

        this.handleClips(itemData, chummerWeapon)
        this.handleAccessories(itemData, chummerWeapon) 
        return itemData;
    }

    handleMeleeWeapon(chummerWeapon, system) {
        system.action.type = 'complex';
        system.category = 'melee';
        system.melee = {
            reach:  parseInt(chummerWeapon.reach)
        };
    }

    handledRangedWeapon(chummerWeapon, system) {
        system.category = 'range';

        if (system.action.skill.toLowerCase().includes('throw')) {
            system.category = 'thrown';
        }

        const range = {};
        system.range = range;
        range.rc = { base: parseInt(getValues(chummerWeapon.rawrc)[0]) };

        if (chummerWeapon.mode) {
            // HeroLab export doesn't have mode
            const modes = chummerWeapon.mode_noammo.toLowerCase();
            range.modes = {
                single_shot: modes.includes('ss'),
                semi_auto: modes.includes('sa'),
                burst_fire: modes.includes('bf'),
                full_auto: modes.includes('fa'),
            };
        }

        if (chummerWeapon.clips?.clip != null) {
            system.ammo = {}
            let ammo = system.ammo
            
            // HeroLab export doesn't have clips
            const chummerClips = getArray(chummerWeapon.clips.clip);
            let clips = chummerClips.filter(clip => !clip.name.toLowerCase().includes("inter"))

            ammo.spare_clips = {
                value: clips?.length -1 || 0,
                max: clips?.length -1 || 0
            }

            let loadedClip = clips.filter(clip => clip.location === "loaded")[0]
            
            ammo.current = {
                max: loadedClip?.count || 0,
                value: loadedClip?.count || 0
            }
        }

        const ranges = chummerWeapon.ranges[0]
        if (ranges && ranges.short && ranges.medium && ranges.long && ranges.extreme) {
            const rangeData = {
                short: parseInt(ranges.short.split('-')[1]),
                medium: parseInt(ranges.medium.split('-')[1]),
                long: parseInt(ranges.long.split('-')[1]),
                extreme: parseInt(ranges.extreme.split('-')[1]),
            };
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

    handleClips(item, chummerWeapon) {
        if (chummerWeapon.clips?.clip != null) {
            
            // HeroLab export doesn't have clips
            const chummerClips = getArray(chummerWeapon.clips.clip);
            let clips = chummerClips.filter(clip => !clip.name.toLowerCase().includes("inter"))

            let ammo = []
            clips.forEach((clip) => {
                let ammobonus = clip.ammotype
                let systemAmmo = {
                    accuracy: parseInt(ammobonus.weaponbonusacc),
                    ap: parseInt(ammobonus.weaponbonusap),
                    blast: {
                        radius: 0,
                        dropoff: 0
                    },
                    damage: ammobonus.weaponbonusdamage_english.match(/(\d+)/).pop(),
                    damageType: ammobonus.weaponbonusdamage_english.match(/S/)?.pop() === 'S' ? 'stun' : 'physical' ,
                    element: ammobonus.weaponbonusdamage_english.match(/\(e\)/)?.pop() == '(e)' ? 'electricity' : '',
                    importFlags: {
                        isFreshImport: true
                    },
                    replaceDamage: false,
                    technology: {
                        equipped: clip.name === chummerWeapon.currentammo
                    }
                }
                let currentAmmo = createItemData(clip.name, 'ammo', systemAmmo);
                currentAmmo._id = randomID(16)
                ammo.push(currentAmmo);
            });

            if(!item.flags?.shadowrun5e?.embeddedItems) {
                item.flags = {
                    shadowrun5e: {
                        embeddedItems: ammo
                    }
                }
            }
            else {
                item.flags.shadowrun5e.embeddedItems.push(...ammo)
            }            
        }
    }

    handleAccessories(itemData, chummerWeapon) {
        if (chummerWeapon.clips?.clip != null) {
            
            let chummerAccessories = getArray(chummerWeapon.accessories.accessory);

            let accessories = []
            chummerAccessories.forEach((item) => {
                let system = {
                    type: "weapon",
                    mount_point: item.mount.toLowerCase(),
                    dice_pool: 0,
                    accuracy: parseInt(item.accuracy),
                    rc: parseInt(item.rc) || 0,
                    conceal: parseInt(item.conceal),
                    technology: {
                        equipped: true
                    }
                }
                let current = createItemData(item.name, 'modification', system);
                current._id = randomID(16)
                accessories.push(current);
            });

            if(!itemData.flags?.shadowrun5e?.embeddedItems) {
                itemData.flags = {
                    shadowrun5e: {
                        embeddedItems: accessories
                    }
                }
            }
            else {
                itemData.flags.shadowrun5e.embeddedItems.push(...accessories)
            }            
        }
    }
}
