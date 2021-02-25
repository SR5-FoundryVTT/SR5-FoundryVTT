import {_mergeWithMissingSkillFields} from "../../actor/prep/functions/SkillsPrep";
import {GearsParser} from "./gearImport/GearsParser"

/**
 * Parses all items (qualities, weapons, gear, ...) from a chummer character.
 */
export class ItemsParser {

    /**
     *  Creates the item description object from the chummer entry
     *  @param entry The chummer entry (the item, the quality..)
     */
    parseDescription = (entry) => {
        const parsedDescription = {
            source: `${entry.source} ${entry.page}`
        };

        if (entry.description) {
            parsedDescription.value = TextEditor.enrichHTML(q.description);
        }

        return parsedDescription
    }

    getValues = (val) => {
        const regex = /(-?[0-9]+)(?:([0-9]+))*/g;
        const l = val.match(regex);
        return l || ['0'];
    };

    getArray = (value) => {
        return Array.isArray(value) ? value : [value];
    };

    /**
     * Parses all items from a chummer char and returns an array of the corresponding foundry items.
     * @param {*} chummerChar The chummer char holding the items
     * @param {*} importOptions Additional import option that specify what items will be imported.
     */
    parse(chummerChar, importOptions) {
        const parsedItems = [];

        if (importOptions.qualities && chummerChar.qualities && chummerChar.qualities.quality) {
            const parsedQualities = this.parseQualities(chummerChar);
            Array.prototype.push.apply(parsedItems, parsedQualities);
        }

        if (importOptions.weapons && chummerChar.weapons != null && chummerChar.weapons.weapon != null) {
            const parsedWeapons = this.parseWeapons(chummerChar);
            Array.prototype.push.apply(parsedItems, parsedWeapons);
        }

        if (importOptions.armor && chummerChar.armors && chummerChar.armors.armor) {
            const parsedArmors = this.parseArmors(chummerChar);
            Array.prototype.push.apply(parsedItems, parsedArmors);
        }

        if (importOptions.cyberware && chummerChar.cyberwares && chummerChar.cyberwares.cyberware) {
            const parsedCyberware = this.parseCyberware(chummerChar);
            Array.prototype.push.apply(parsedItems, parsedCyberware);
        }

        if (importOptions.powers && chummerChar.powers && chummerChar.powers.power) {
            const parsedPowers = this.parsePowers(chummerChar);
            Array.prototype.push.apply(parsedItems, parsedPowers);
        }

        if (importOptions.equipment && chummerChar.gears && chummerChar.gears.gear) {
            const gears = this.getArray(chummerChar.gears.gear);
            const allGearData = new GearsParser().parseAllGear(gears);
            Array.prototype.push.apply(parsedItems, allGearData);
        }

        if (importOptions.spells && chummerChar.spells && chummerChar.spells.spell) {
            const parsedSpells = this.parseSpells(chummerChar);
            Array.prototype.push.apply(parsedItems, parsedSpells);
        }

        return parsedItems;
    }

    parseQualities(chummerChar) {
        const qualities = this.getArray(chummerChar.qualities.quality);
        const parsedQualities = [];

        qualities.forEach((chummerQuality) => {
            try {
                const data = {};
                data.type = chummerQuality.qualitytype.toLowerCase();
                data.description = this.parseDescription(chummerQuality);

                const itemData = {
                    name: chummerQuality.name,
                    type: 'quality',
                    data,
                };
                parsedQualities.push(itemData);
            } catch (e) {
                console.error(e);
            }
        });

        return parsedQualities;
    }

    parseWeapons(chummerChar) {
        const parseDamage = (val) => {
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

        const weapons = this.getArray(chummerChar.weapons.weapon);
        const parsedWeapons = [];

        weapons.forEach((chummerWeapon) => {
            try {
                const data = {};
                const action = {};
                const damage = {};
                action.damage = damage;
                data.action = action;

                data.description = this.parseDescription(chummerWeapon);

                damage.ap = {
                    base: parseInt(this.getValues(chummerWeapon.ap)[0])
                };
                action.type = 'varies';
                if (chummerWeapon.skill) action.skill = chummerWeapon.skill.toLowerCase().replace(/\s/g, '_');
                else if (chummerWeapon.category && chummerWeapon.category.toLowerCase().includes('exotic'))
                    action.skill = chummerWeapon.category
                        .toLowerCase()
                        .replace(' weapons', '')
                        .replace(/\s/g, '_');
                if (action.skill.includes('exotic'))
                    action.skill = action.skill.replace('_weapon', '');
                action.attribute = 'agility';
                action.limit = {
                    base: parseInt(this.getValues(chummerWeapon.accuracy)[0])
                };
                action.opposed = {
                    type: 'defense',
                };

                if (chummerWeapon.type.toLowerCase() === 'melee') {
                    action.type = 'complex';
                    data.category = 'melee';
                    const melee = {};
                    data.melee = melee;
                    melee.reach = parseInt(chummerWeapon.reach);
                } else if (chummerWeapon.type.toLowerCase() === 'ranged') {
                    data.category = 'range';
                    if (chummerWeapon.skill.toLowerCase().includes('throw')) {
                        data.category = 'thrown'; // TODO clean this up
                    }
                    const range = {};
                    data.range = range;
                    range.rc = {
                        base: parseInt(this.getValues(chummerWeapon.rc)[0]),
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
                    if (
                        chummerWeapon.ranges &&
                        chummerWeapon.ranges.short &&
                        chummerWeapon.ranges.medium &&
                        chummerWeapon.ranges.long &&
                        chummerWeapon.ranges.extreme
                    ) {
                        console.log(chummerWeapon.ranges);
                        range.ranges = {
                            short: parseInt(chummerWeapon.ranges.short.split('-')[1]),
                            medium: parseInt(chummerWeapon.ranges.medium.split('-')[1]),
                            long: parseInt(chummerWeapon.ranges.long.split('-')[1]),
                            extreme: parseInt(chummerWeapon.ranges.extreme.split('-')[1]),
                        };
                    }
                    // TODO figure out how to add mods to weapons
                    // if (w.accessories && w.accessories.accessory) {
                    //     range.mods = [];
                    //     const accessories = this.getArray(w.accessories.accessory);
                    //     accessories.forEach((a) => {
                    //         if (a) {
                    //             range.mods.push({
                    //                 name: a.name,
                    //             });
                    //         }
                    //     });
                    // }
                } else if (chummerWeapon.type.toLowerCase() === 'thrown') {
                    data.category = 'thrown';
                }
                {
                    // TODO handle raw damage if present
                    const d = parseDamage(chummerWeapon.damage_english);
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

                const itemData = {
                    name: chummerWeapon.name,
                    type: 'weapon',
                    data,
                };
                parsedWeapons.push(itemData);
            } catch (e) {
                console.error(e);
            }
        });
    
        return parsedWeapons;
    }

    parseArmors(chummerChar) {
        const armors = this.getArray(chummerChar.armors.armor);
        const parsedArmors = [];
        armors.forEach((chummerArmor) => {
            try {
                const data = {};
                const armor = {};
                data.armor = armor;

                let desc = '';
                armor.mod = chummerArmor.armor.includes('+');
                armor.value = parseInt(chummerArmor.armor.replace('+', ''));
                if (chummerArmor.description) desc = chummerArmor.description;

                console.log(chummerArmor);
                if (chummerArmor.armormods && chummerArmor.armormods.armormod) {
                    armor.fire = 0;
                    armor.electricity = 0;
                    armor.cold = 0;
                    armor.acid = 0;
                    armor.radiation = 0;

                    const modDesc = [];
                    const mods = this.getArray(chummerArmor.armormods.armormod);
                    mods.forEach((mod) => {
                        if (mod.name.toLowerCase().includes('fire resistance')) {
                            armor.fire += parseInt(mod.rating);
                        } else if (mod.name.toLowerCase().includes('nonconductivity')) {
                            armor.electricity += parseInt(mod.rating);
                        } else if (mod.name.toLowerCase().includes('insulation')) {
                            armor.cold += parseInt(mod.rating);
                        } else if (
                            mod.name.toLowerCase().includes('radiation shielding')
                        ) {
                            armor.radiation += parseInt(mod.rating);
                        }
                        if (mod.rating !== '') {
                            modDesc.push(`${mod.name} R${mod.rating}`);
                        } else {
                            modDesc.push(mod.name);
                        }
                    });
                    if (modDesc.length > 0) {
                        // add desc to beginning
                        desc = `${modDesc.join(',')}\n\n${desc}`;
                    }
                }
                if (chummerArmor.equipped.toLowerCase() === 'true') {
                    data.technology = {
                        equipped: true,
                    };
                }
                data.description = this.parseDescription(chummerArmor);

                const itemData = {
                    name: chummerArmor.name,
                    type: 'armor',
                    data,
                };
                parsedArmors.push(itemData);
            } catch (e) {
                console.error(e);
            }
        });

        return parsedArmors;
    }

    parseCyberware(chummerChar) {
        const cyberwares = this.getArray(chummerChar.cyberwares.cyberware);
        const parsedCyberware = [];
        cyberwares.forEach((chummerCyber) => {
            try {
                const data = {};
                data.description = this.parseDescription(chummerCyber);
                data.description.rating = chummerCyber.rating; 
                data.description.value = chummerCyber.description;

                data.technology = {
                    equipped: true,
                };
                data.essence = chummerCyber.ess;
                data.grade = chummerCyber.grade;
                const itemData = {
                    name: chummerCyber.name,
                    type: 'cyberware',
                    data,
                };
                parsedCyberware.push(itemData);
            } catch (e) {
                console.error(e);
            }
        });

        return parsedCyberware;
    }

    parsePowers(chummerChar) {
        const powers = this.getArray(chummerChar.powers.power);
        const parsedPowers = [];

        powers.forEach((chummerPower) => {
            const data = {};
            data.description = this.parseDescription(chummerPower);

            data.level = parseInt(chummerPower.rating);
            chummerPower.pp = parseInt(chummerPower.totalpoints);

            const itemData = {
                name: chummerPower.name,
                type: 'adept_power',
                data,
            };
            parsedPowers.push(itemData);
        });
    
        return parsedPowers;
    }

    parseSpells(chummerChar) {
        const spells = this.getArray(chummerChar.spells.spell);
        const parsedSpells = [];
        spells.forEach((chummerSpell) => {
            try {
                if (chummerSpell.alchemy.toLowerCase() !== 'true') {
                    const action = {};
                    const data = {};
                    data.action = action;
                    data.category = chummerSpell.category.toLowerCase().replace(/\s/g, '_');
                    data.name = chummerSpell.name;
                    data.type = chummerSpell.type === 'M' ? 'mana' : 'physical';
                    data.range =
                        chummerSpell.range === 'T'
                            ? 'touch'
                            : chummerSpell.range
                                  .toLowerCase()
                                  .replace(/\s/g, '_')
                                  .replace('(', '')
                                  .replace(')', '');
                    data.drain = parseInt(chummerSpell.dv.replace('F', ''));
                    data.description = this.parseDescription(chummerSpell);

                    let description = '';
                    if (chummerSpell.descriptors) description = chummerSpell.descriptors;
                    if (chummerSpell.description) description += `\n${chummerSpell.description}`;
                    data.description.value = TextEditor.enrichHTML(description);

                    if (chummerSpell.duration.toLowerCase() === 's') data.duration = 'sustained';
                    else if (chummerSpell.duration.toLowerCase() === 'i')
                        data.duration = 'instant';
                    else if (chummerSpell.duration.toLowerCase() === 'p')
                        data.duration = 'permanent';

                    action.type = 'varies';
                    action.skill = 'spellcasting';
                    action.attribute = 'magic';

                    if (chummerSpell.descriptors) {
                        const desc = chummerSpell.descriptors.toLowerCase();
                        if (chummerSpell.category.toLowerCase() === 'combat') {
                            data.combat = {};
                            if (desc.includes('direct')) {
                                data.combat.type = 'indirect';
                                action.opposed = {
                                    type: 'defense',
                                };
                            } else {
                                data.combat.type = 'direct';
                                if (data.type === 'mana') {
                                    action.opposed = {
                                        type: 'custom',
                                        attribute: 'willpower',
                                    };
                                } else if (data.type === 'physical') {
                                    action.opposed = {
                                        type: 'custom',
                                        attribute: 'body',
                                    };
                                }
                            }
                        }
                        if (chummerSpell.category.toLowerCase() === 'detection') {
                            data.detection = {};
                            const split = desc.split(',');
                            split.forEach((token) => {
                                token = token || '';
                                token = token.replace(' detection spell', '');
                                if (!token) return;
                                if (token.includes('area')) return;

                                if (token.includes('passive'))
                                    data.detection.passive = true;
                                else if (token.includes('active'))
                                    data.detection.passive = false;
                                else if (token)
                                    data.detection.type = token.toLowerCase();
                            });
                            if (!data.detection.passive) {
                                action.opposed = {
                                    type: 'custom',
                                    attribute: 'willpower',
                                    attribute2: 'logic',
                                };
                            }
                        }
                        if (chummerSpell.category.toLowerCase() === 'illusion') {
                            data.illusion = {};
                            const split = desc.split(',');
                            split.forEach((token) => {
                                token = token || '';
                                token = token.replace(' illusion spell', '');
                                if (!token) return;
                                if (token.includes('area')) return;

                                if (token.includes('sense'))
                                    data.illusion.sense = token.toLowerCase();
                                else if (token)
                                    data.illusion.type = token.toLowerCase();
                            });
                            if (data.type === 'mana') {
                                action.opposed = {
                                    type: 'custom',
                                    attribute: 'willpower',
                                    attribute2: 'logic',
                                };
                            } else {
                                action.opposed = {
                                    type: 'custom',
                                    attribute: 'intuition',
                                    attribute2: 'logic',
                                };
                            }
                        }
                        if (chummerSpell.category.toLowerCase() === 'manipulation') {
                            data.manipulation = {};
                            if (desc.includes('environmental'))
                                data.manipulation.environmental = true;
                            if (desc.includes('physical'))
                                data.manipulation.physical = true;
                            if (desc.includes('mental'))
                                data.manipulation.mental = true;
                            // TODO figure out how to parse damaging

                            if (data.manipulation.mental) {
                                action.opposed = {
                                    type: 'custom',
                                    attribute: 'willpower',
                                    attribute2: 'logic',
                                };
                            }
                            if (data.manipulation.physical) {
                                action.opposed = {
                                    type: 'custom',
                                    attribute: 'body',
                                    attribute2: 'strength',
                                };
                            }
                        }
                    }
                    const itemData = {
                        name: chummerSpell.name,
                        type: 'spell',
                        data,
                    };
                    parsedSpells.push(itemData);
                }
            } catch (e) {
                console.error(e);
            }
        });

        return parsedSpells;
    }
}
