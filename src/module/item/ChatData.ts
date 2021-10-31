import { Helpers } from '../helpers';
import DeviceData = Shadowrun.DeviceData;
import { SR5Item } from './SR5Item';
import AmmoData = Shadowrun.AmmoData;
import {SR5} from "../config";

export const ChatData = {
    action: (data, labels, props) => {
        if (data.action) {
            const labelStringList: string[] = [];
            if (data.action.skill) {
                labelStringList.push(Helpers.label(data.action.skill));
                labelStringList.push(Helpers.label(data.action.attribute));
            } else if (data.action.attribute2) {
                labelStringList.push(Helpers.label(data.action.attribute));
                labelStringList.push(Helpers.label(data.action.attribute2));
            } else if (data.action.attribute) {
                labelStringList.push(Helpers.label(data.action.attribute));
            }
            if (data.action.mod) {
                labelStringList.push(`${game.i18n.localize('SR5.ItemMod')} (${data.action.mod})`);
            }
            if (labelStringList.length) {
                labels.roll = labelStringList.join(' + ');
            }

            if (data.action.opposed.type) {
                const { opposed } = data.action;
                if (opposed.type !== 'custom') labels.opposedRoll = `vs. ${Helpers.label(opposed.type)}`;
                else if (opposed.skill) labels.opposedRoll = `vs. ${Helpers.label(opposed.skill)}+${Helpers.label(opposed.attribute)}`;
                else if (opposed.attribute2) labels.opposedRoll = `vs. ${Helpers.label(opposed.attribute)}+${Helpers.label(opposed.attribute2)}`;
                else if (opposed.attribute) labels.opposedRoll = `vs. ${Helpers.label(opposed.attribute)}`;
            }

            // setup action props
            // go in order of "Limit/Accuracy" "Damage" "AP"
            // don't add action type if set to 'varies' or 'none' as that's pretty much useless info
            if (data.action.type !== '' && data.action.type !== 'varies' && data.action.type !== 'none') {
                props.push(`${Helpers.label(data.action.type)} Action`);
            }
            if (data.action.limit) {
                const { limit } = data.action;
                const attribute = limit.attribute ? `${game.i18n.localize(SR5.limits[limit.attribute])}` : '';
                const limitVal = limit.value ? limit.value : '';
                let limitStr = '';
                if (attribute) {
                    limitStr += attribute;
                }
                if (limitVal) {
                    if (attribute) {
                        limitStr += ' + ';
                    }
                    limitStr += limitVal;
                }

                if (limitStr) {
                    props.push(`Limit ${limitStr}`);
                }
            }
            if (data.action.damage.type.value) {
                const { damage } = data.action;
                let damageString = '';
                let elementString = '';
                const attribute = damage.attribute ? `${game.i18n.localize(SR5.attributes[damage.attribute])} + ` : '';
                if (damage.value || attribute) {
                    const type = damage.type.value ? damage.type.value.toUpperCase().charAt(0) : '';
                    damageString = `DV ${attribute}${damage.value}${type}`;
                }
                if (damage.element.value) {
                    // if we have a damage value and are electric, follow the convention of (e) after
                    if (damage.value) {
                        if (damage.element.value === 'electricity') {
                            damageString += ' (e)';
                        } else {
                            elementString = Helpers.label(damage.element.value);
                        }
                    } else {
                        elementString = Helpers.label(damage.element.value);
                    }
                }
                if (damageString) props.push(damageString);
                if (elementString) props.push(elementString);
                if (damage.ap && damage.ap.value) props.push(`AP ${damage.ap.value}`);
            }
        }
    },
    sin: (data, labels, props) => {
        props.push(`Rating ${data.technology.rating}`);
        data.licenses.forEach((license) => {
            props.push(`${license.name} R${license.rtg}`);
        });
    },

    contact: (data, labels, props) => {
        props.push(data.type);
        props.push(`${game.i18n.localize('SR5.Connection')} ${data.connection}`);
        props.push(`${game.i18n.localize('SR5.Loyalty')} ${data.loyalty}`);
        if (data.blackmail) {
            props.push(`${game.i18n.localize('SR5.Blackmail')}`);
        }
        if (data.family) {
            props.push(game.i18n.localize('SR5.Family'));
        }
    },

    lifestyle: (data, labels, props) => {
        props.push(Helpers.label(data.type));
        if (data.cost) props.push(`¥${data.cost}`);
        if (data.comforts) props.push(`Comforts ${data.comforts}`);
        if (data.security) props.push(`Security ${data.security}`);
        if (data.neighborhood) props.push(`Neighborhood ${data.neighborhood}`);
        if (data.guests) props.push(`Guests ${data.guests}`);
    },

    adept_power: (data, labels, props) => {
        ChatData.action(data, labels, props);
        props.push(`PP ${data.pp}`);
        props.push(Helpers.label(data.type));
    },

    armor: (data, labels, props) => {
        if (data.armor) {
            if (data.armor.value) props.push(`Armor ${data.armor.mod ? '+' : ''}${data.armor.value}`);
            if (data.armor.acid) props.push(`Acid ${data.armor.acid}`);
            if (data.armor.cold) props.push(`Cold ${data.armor.cold}`);
            if (data.armor.fire) props.push(`Fire ${data.armor.fire}`);
            if (data.armor.electricity) props.push(`Electricity ${data.armor.electricity}`);
            if (data.armor.radiation) props.push(`Radiation ${data.armor.radiation}`);
        }
    },

    ammo: (data, labels, props) => {
        if (data.damageType) props.push(`${game.i18n.localize("SR5.DamageType")} ${data.damageType}`);
        if (data.damage) props.push(`${game.i18n.localize("SR5.DamageValue")} ${data.damage}`);
        if (data.element) props.push(`${game.i18n.localize("SR5.Element")} ${data.element}`);
        if (data.ap) props.push(`${game.i18n.localize("SR5.AP")} ${data.ap}`);
        if (data.blast.radius) props.push(`${game.i18n.localize('SR5.BlastRadius')} ${data.blast.radius}m`);
        if (data.blast.dropoff) props.push(`${game.i18n.localize('SR5.Dropoff')} ${data.blast.dropoff}/m`);
    },

    program: (data, labels, props) => {
        props.push(game.i18n.localize(SR5.programTypes[data.type]));
    },

    complex_form: (data, labels, props) => {
        ChatData.action(data, labels, props);
        props.push(Helpers.label(data.target), Helpers.label(data.duration));
        const { fade } = data;
        if (fade > 0) props.push(`Fade L+${fade}`);
        else if (fade < 0) props.push(`Fade L${fade}`);
        else props.push('Fade L');
    },

    cyberware: (data, labels, props) => {
        ChatData.action(data, labels, props);
        ChatData.armor(data, labels, props);
        if (data.essence) props.push(`Ess ${data.essence}`);
    },

    bioware: (data, labels, props) => {
        ChatData.action(data, labels, props);
        ChatData.armor(data, labels, props);
        if (data.essence) props.push(`Ess ${data.essence}`);
    },

    device: (data: DeviceData, labels, props) => {
        if (data.technology && data.technology.rating) props.push(`Rating ${data.technology.rating}`);
        if (data.category === 'cyberdeck') {
            for (const attN of Object.values(data.atts)) {
                props.push(`${Helpers.label(attN.att)} ${attN.value}`);
            }
        }
    },

    equipment: (data, labels, props) => {
        if (data.technology && data.technology.rating) props.push(`Rating ${data.technology.rating}`);
    },

    quality: (data, labels, props) => {
        ChatData.action(data, labels, props);
        props.push(Helpers.label(data.type));
    },

    sprite_power: (data, labels, props) => {
        // add action data
        ChatData.action(data, labels, props);
    },

    critter_power: (data, labels, props) => {
        // power type
        props.push(game.i18n.localize(SR5.critterPower.types[data.powerType]));
        // duration
        props.push(game.i18n.localize(SR5.critterPower.durations[data.duration]));
        // range
        props.push(game.i18n.localize(SR5.critterPower.ranges[data.range]));

        // add action data
        ChatData.action(data, labels, props);
    },

    // add properties for spell data, follow order in book
    spell: (data, labels, props) => {
        // first category and type
        props.push(Helpers.label(data.category), Helpers.label(data.type));

        // add subtype tags
        if (data.category === 'combat') {
            props.push(Helpers.label(data.combat.type));
        } else if (data.category === 'health') {
        } else if (data.category === 'illusion') {
            props.push(data.illusion.type);
            props.push(data.illusion.sense);
        } else if (data.category === 'manipulation') {
            if (data.manipulation.damaging) props.push('Damaging');
            if (data.manipulation.mental) props.push('Mental');
            if (data.manipulation.environmental) props.push('Environmental');
            if (data.manipulation.physical) props.push('Physical');
        } else if (data.category === 'detection') {
            props.push(data.illusion.type);
            props.push(data.illusion.passive ? 'Passive' : 'Active');
            if (data.illusion.extended) props.push('Extended');
        }
        // add range
        props.push(Helpers.label(data.range));

        // add action data
        ChatData.action(data, labels, props);

        // add duration data
        props.push(Helpers.label(data.duration));

        // add drain data
        const { drain } = data;
        if (drain > 0) props.push(`Drain F+${drain}`);
        else if (drain < 0) props.push(`Drain F${drain}`);
        else props.push('Drain F');

        labels.roll = 'Cast';
    },

    weapon: (data, labels, props, item: SR5Item) => {
        ChatData.action(data, labels, props);
        for (let i = 0; i < props.length; i++) {
            const prop = props[i];
            if (prop.includes('Limit')) {
                props[i] = prop.replace('Limit', 'Accuracy');
            }
        }

        const equippedAmmo = item.getEquippedAmmo();
        if (equippedAmmo && data.ammo && data.ammo.current?.max) {
            if (equippedAmmo) {
                const ammoData = equippedAmmo.data.data as AmmoData;
                const { current, spare_clips } = data.ammo;
                if (equippedAmmo.name) props.push(`${equippedAmmo.name} (${current.value}/${current.max})`);
                if (ammoData.blast.radius) props.push(`${game.i18n.localize('SR5.BlastRadius')} ${ammoData.blast.radius}m`);
                if (ammoData.blast.dropoff) props.push(`${game.i18n.localize('SR5.Dropoff')} $ammoData.blast.dropoff}/m`);
                if (spare_clips && spare_clips.max) props.push(`${game.i18n.localize('SR5.SpareClips')} (${spare_clips.value}/${spare_clips.max})`);
            }
        }

        if (data.technology?.conceal?.value) {
            props.push(`${game.i18n.localize('SR5.Conceal')} ${data.technology.conceal.value}`);
        }

        if (data.category === 'range') {
            if (data.range.rc) {
                let rcString = `${game.i18n.localize('SR5.RecoilCompensation')} ${data.range.rc.value}`;
                if (item?.actor) {
                    rcString += ` (${game.i18n.localize('SR5.Total')} ${item.actor.getRecoilCompensation()})`;
                }
                props.push(rcString);
            }
            if (data.range.modes) {
                const newModes: string[] = [];
                const { modes } = data.range;
                if (modes.single_shot) newModes.push('SR5.WeaponModeSingleShotShort');
                if (modes.semi_auto) newModes.push('SR5.WeaponModeSemiAutoShort');
                if (modes.burst_fire) newModes.push('SR5.WeaponModeBurstFireShort');
                if (modes.full_auto) newModes.push('SR5.WeaponModeFullAutoShort');
                props.push(newModes.map((m) => game.i18n.localize(m)).join('/'));
            }
            if (data.range.ranges) props.push(Array.from(Object.values(data.range.ranges)).join('/'));
        } else if (data.category === 'melee') {
            if (data.melee.reach) {
                const reachString = `${game.i18n.localize('SR5.Reach')} ${data.melee.reach}`;
                // find accuracy in props and insert ourselves after it
                const accIndex = props.findIndex((p) => p.includes('Accuracy'));
                if (accIndex > -1) {
                    props.splice(accIndex + 1, 0, reachString);
                } else {
                    props.push(reachString);
                }
            }
        } else if (data.category === 'thrown') {
            const { blast } = data.thrown;
            if (blast?.radius) props.push(`${game.i18n.localize('SR5.BlastRadius')} ${blast.radius}m`);
            if (blast?.dropoff) props.push(`${game.i18n.localize('SR5.Dropoff')} ${blast.dropoff}/m`);

            if (data.thrown.ranges) {
                const mult = data.thrown.ranges.attribute && item?.actor ? item.actor.data.data.attributes[data.thrown.ranges.attribute].value : 1;
                const ranges = [data.thrown.ranges.short, data.thrown.ranges.medium, data.thrown.ranges.long, data.thrown.ranges.extreme];
                props.push(ranges.map((v) => v * mult).join('/'));
            }
        }

        const equippedMods = item.getEquippedMods();
        if (equippedMods) {
            equippedMods.forEach((mod) => {
                props.push(`${mod.name}`);
            });
        }
    },
};
