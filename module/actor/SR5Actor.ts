import { ShadowrunRoller } from '../rolls/ShadowrunRoller';
import { Helpers } from '../helpers';
import { SR5Item } from '../item/SR5Item';
import ItemData = Shadowrun.ItemData;
import Attributes = Shadowrun.Attributes;
import Skills = Shadowrun.Skills;
import KnowledgeSkillList = Shadowrun.KnowledgeSkillList;
import KnowledgeSkills = Shadowrun.KnowledgeSkills;
import Limits = Shadowrun.Limits;
import Tracks = Shadowrun.Tracks;
import ActorRollOptions = Shadowrun.ActorRollOptions;
import DefenseRollOptions = Shadowrun.DefenseRollOptions;
import SoakRollOptions = Shadowrun.SoakRollOptions;
import AttributeField = Shadowrun.AttributeField;
import SkillRollOptions = Shadowrun.SkillRollOptions;
import Matrix = Shadowrun.Matrix;
import SkillField = Shadowrun.SkillField;
import ValueMaxPair = Shadowrun.ValueMaxPair;
import ModList = Shadowrun.ModList;
import BaseValuePair = Shadowrun.BaseValuePair;
import ModifiableValue = Shadowrun.ModifiableValue;
import LabelField = Shadowrun.LabelField;

export class SR5Actor extends Actor {
    async update(data, options?) {
        await super.update(data, options);
        // trigger update for all items with action
        // needed for rolls to properly update when items or attributes update
        const itemUpdates: Item[] = [];
        // @ts-ignore
        for (let item of this.data.items) {
            if (item && item.data.action) {
                itemUpdates.push(item);
            }
        }
        await this.updateEmbeddedEntity('OwnedItem', itemUpdates);
        return this;
    }

    getOverwatchScore() {
        const os = this.getFlag('shadowrun5e', 'overwatchScore');
        return os !== undefined ? os : 0;
    }

    async setOverwatchScore(value) {
        const num = parseInt(value);
        if (!isNaN(num)) {
            return this.setFlag('shadowrun5e', 'overwatchScore', num);
        }
    }

    prepareData() {
        super.prepareData();

        const actorData = this.data;
        // @ts-ignore
        const items: SR5Item[] = actorData.items;
        const data = actorData.data;
        const { attributes }: { attributes: Attributes } = data;
        const armor = data.armor;
        const { limits }: { limits: Limits } = data;
        const { language }: { language: KnowledgeSkillList } = data.skills;
        const { active }: { active: Skills } = data.skills;
        const { knowledge: knowledge }: { knowledge: KnowledgeSkills } = data.skills;
        const { track }: { track: Tracks } = data;

        attributes.magic.hidden = !(data.special === 'magic');
        attributes.resonance.hidden = !(data.special === 'resonance');

        if (!data.modifiers) data.modifiers = {};
        const modifiers = {};
        let miscTabModifiers = [
            'soak',
            'drain',
            'armor',
            'physical_limit',
            'social_limit',
            'mental_limit',
            'stun_track',
            'physical_track',
            'initiative',
            'initiative_dice',
            'composure',
            'lift_carry',
            'judge_intentions',
            'memory',
            'walk',
            'run',
            'defense',
            'wound_tolerance',
            'essence',
            'fade',
        ];
        miscTabModifiers.sort();
        miscTabModifiers.unshift('global');

        for (let item of miscTabModifiers) {
            modifiers[item] = data.modifiers[item] || 0;
        }

        data.modifiers = modifiers;

        let totalEssence = 6;
        armor.value = 0;
        armor.mod = {};
        for (const element of Object.keys(CONFIG.SR5.elementTypes)) {
            armor[element] = 0;
        }

        // DEFAULT MATRIX ATTS TO MOD VALUE
        const matrix: Matrix = data.matrix;
        matrix.firewall.value = Helpers.totalMods(matrix.firewall.mod);
        matrix.data_processing.value = Helpers.totalMods(matrix.data_processing.mod);
        matrix.attack.value = Helpers.totalMods(matrix.attack.mod);
        matrix.sleaze.value = Helpers.totalMods(matrix.sleaze.mod);
        matrix.condition_monitor.max = 0;
        matrix.rating = 0;
        matrix.name = '';
        matrix.device = '';

        // PARSE WEAPONS AND SET VALUES AS NEEDED
        for (let item of Object.values(items)) {
            const itemData: ItemData = (item.data as unknown) as ItemData;

            const equipped = itemData.technology?.equipped;
            if (equipped) {
                if (itemData.armor && itemData.armor.value) {
                    // if it's a mod, add to the mod field
                    if (itemData.armor.mod) {
                        armor.mod[item.name] = itemData.armor.value;
                    } // if not a mod, set armor.value to the items value
                    else {
                        armor.base = itemData.armor.value;
                        armor.label = item.name;
                    }
                    for (const element of Object.keys(CONFIG.SR5.elementTypes)) {
                        armor[element] = itemData.armor[element];
                    }
                }
            }
            // MODIFIES ESSENCE
            if (itemData.essence && itemData.technology && itemData.technology.equipped) {
                totalEssence -= itemData.essence;
            }
            // MODIFIES MATRIX ATTRIBUTES
            if (item.type === 'device' && itemData.technology?.equipped) {
                matrix.device = item._id;
                matrix.condition_monitor.max = itemData.condition_monitor?.max || 0;
                matrix.rating = itemData.technology.rating;
                matrix.is_cyberdeck = itemData.category === 'cyberdeck';
                matrix.name = item.name;
                matrix.item = itemData;

                if (itemData.category === 'cyberdeck' && itemData.atts) {
                    for (let [key, att] of Object.entries(itemData.atts)) {
                        matrix[att.att].value += att.value;
                        matrix[att.att].device_att = key;
                    }
                } else {
                    matrix.firewall.value += matrix.rating || 0;
                    matrix.data_processing.value += matrix.rating || 0;
                }
            }
        }

        // SET ARMOR
        armor.value = armor.base + Helpers.totalMods(armor.mod) + modifiers['armor'];

        // ATTRIBUTES
        for (let [, att] of Object.entries(attributes)) {
            if (!att.hidden) {
                if (!att.mod) att.mod = {};
                att.value = att.base + Helpers.totalMods(att.mod);
            }
        }

        if (language) {
            if (!language.value) language.value = {};
            language.attribute = 'intuition';
        }

        for (const skill of Object.values(active)) {
            if (!skill.hidden) {
                if (!skill.mod) skill.mod = {};
                if (!skill.base) skill.base = 0;
                skill.value = skill.base + Helpers.totalMods(skill.mod);
            }
        }

        {
            const entries = Object.entries(data.skills.language.value);
            // remove entries which are deleted TODO figure out how to delete these from the data
            entries.forEach(
                ([key, val]: [string, { _delete?: boolean }]) =>
                    val._delete && delete data.skills.language.value[key]
            );
        }

        for (let skill of Object.values(language.value)) {
            if (!skill.mod) skill.mod = {};
            if (!skill.base) skill.base = 0;
            skill.value = skill.base + Helpers.totalMods(skill.mod);
        }

        for (let [, group] of Object.entries(knowledge)) {
            const entries = Object.entries(group.value);
            // remove entries which are deleted TODO figure out how to delete these from the data
            group.value = entries
                .filter(([, val]) => !val._delete)
                .reduce((acc, [id, skill]) => {
                    if (!skill.mod) skill.mod = {};
                    if (!skill.base) skill.base = 0;
                    skill.value = skill.base + Helpers.totalMods(skill.mod);
                    acc[id] = skill;
                    return acc;
                }, {});
        }

        // TECHNOMANCER LIVING PERSONA
        if (data.special === 'resonance') {
            // if we don't have a device, use living persona
            if (matrix.device === '') {
                // we should use living persona
                matrix.firewall.value += attributes.willpower.value;
                matrix.data_processing.value += attributes.logic.value;
                matrix.rating = attributes.resonance.value;
                matrix.attack.value += attributes.charisma.value;
                matrix.sleaze.value += attributes.intuition.value;
                matrix.name = 'Living Persona';
                matrix.device = '';
                matrix.condition_monitor.max = 0;
            }
        }

        // set matrix condition monitor to max if greater than
        if (matrix.condition_monitor.value > matrix.condition_monitor.max)
            matrix.condition_monitor.value = matrix.condition_monitor.max;

        // ADD MATRIX ATTS TO LIMITS
        limits.firewall = {
            value: matrix.firewall.value,
            base: matrix.firewall.base,
            mod: matrix.firewall.mod,
            hidden: true,
        };
        limits.data_processing = {
            value: matrix.data_processing.value,
            base: matrix.data_processing.base,
            mod: matrix.data_processing.mod,
            hidden: true,
        };
        limits.attack = {
            value: matrix.attack.value,
            base: matrix.attack.base,
            mod: matrix.attack.mod,
            hidden: true,
        };
        limits.sleaze = {
            value: matrix.sleaze.value,
            base: matrix.sleaze.base,
            mod: matrix.sleaze.mod,
            hidden: true,
        };

        attributes.firewall = {
            value: matrix.firewall.value,
            base: matrix.firewall.base,
            mod: matrix.firewall.mod,
            hidden: true,
        };
        attributes.data_processing = {
            value: matrix.data_processing.value,
            base: matrix.data_processing.base,
            mod: matrix.data_processing.mod,
            hidden: true,
        };
        attributes.attack = {
            value: matrix.attack.value,
            base: matrix.attack.base,
            mod: matrix.attack.mod,
            hidden: true,
        };
        attributes.sleaze = {
            value: matrix.sleaze.value,
            base: matrix.sleaze.base,
            mod: matrix.sleaze.mod,
            hidden: true,
        };

        // SET ESSENCE
        actorData.data.attributes.essence.value = +(totalEssence + modifiers['essence']).toFixed(3);

        // SETUP LIMITS
        limits.physical.value =
            Math.ceil(
                (2 * attributes.strength.value +
                    attributes.body.value +
                    attributes.reaction.value) /
                    3
            ) + modifiers['physical_limit'];
        limits.mental.value =
            Math.ceil(
                (2 * attributes.logic.value +
                    attributes.intuition.value +
                    attributes.willpower.value) /
                    3
            ) + modifiers['mental_limit'];
        limits.social.value =
            Math.ceil(
                (2 * attributes.charisma.value +
                    attributes.willpower.value +
                    attributes.essence.value) /
                    3
            ) + modifiers['social_limit'];

        // MOVEMENT
        const movement = data.movement;
        movement.walk.value = attributes.agility.value * (2 + modifiers['walk']);
        movement.run.value = attributes.agility.value * (4 + modifiers['run']);

        // CONDITION_MONITORS
        track.physical.max = 8 + Math.ceil(attributes.body.value / 2) + modifiers['physical_track'];
        track.physical.overflow.max = attributes.body.value;
        track.stun.max = 8 + Math.ceil(attributes.willpower.value / 2) + modifiers['stun_track'];

        // CALCULATE RECOIL
        data.recoil_compensation = 1 + Math.ceil(attributes.strength.value / 3);

        // INITIATIVE
        const init = data.initiative;
        init.meatspace.base.base = attributes.intuition.value + attributes.reaction.value;
        init.meatspace.dice.base = 1;
        init.astral.base.base = attributes.intuition.value * 2;
        init.astral.dice.base = 2;
        init.matrix.base.base = attributes.intuition.value + data.matrix.data_processing.value;
        init.matrix.dice.base = data.matrix.hot_sim ? 4 : 3;
        if (init.perception === 'matrix') init.current = init.matrix;
        else if (init.perception === 'astral') init.current = init.astral;
        else {
            init.current = init.meatspace;
            init.perception = 'meatspace';
        }
        init.current.dice.value = init.current.dice.base + modifiers['initiative_dice'];
        if (init.edge) init.current.dice.value = 5;
        init.current.dice.value = Math.min(5, init.current.dice.value); // maximum of 5d6 for initiative
        init.current.dice.text = `${init.current.dice.value}d6`;
        init.current.base.value = init.current.base.base + modifiers['initiative'];

        const soak = attributes.body.value + armor.value + modifiers['soak'];
        const drainAtt = attributes[data.magic.attribute];
        if (data.magic.drain && !data.magic.drain.mod) data.magic.drain.mod = {};
        data.rolls = {
            ...data.rolls,
            defense: attributes.reaction.value + attributes.intuition.value + modifiers['defense'],
            drain:
                attributes.willpower.value + (drainAtt ? drainAtt.value : 0) + modifiers['drain'],
            fade: attributes.willpower.value + attributes.resonance.value + modifiers['fade'],
            soak: {
                default: soak,
                cold: soak + armor.cold,
                fire: soak + armor.fire,
                acid: soak + armor.acid,
                electricity: soak + armor.electricity,
                radiation: soak + armor.radiation,
            },
            composure:
                attributes.charisma.value + attributes.willpower.value + modifiers['composure'],
            judge_intentions:
                attributes.charisma.value +
                attributes.intuition.value +
                modifiers['judge_intentions'],
            lift_carry: attributes.strength.value + attributes.body.value + modifiers['lift_carry'],
            memory: attributes.willpower.value + attributes.logic.value + modifiers['memory'],
        };

        {
            const count = 3 + modifiers['wound_tolerance'];
            const stunWounds = Math.floor(data.track.stun.value / count);
            const physicalWounds = Math.floor(data.track.physical.value / count);

            data.track.stun.wounds = stunWounds;
            data.track.physical.wounds = physicalWounds;

            data.wounds = {
                value: stunWounds + physicalWounds,
            };
        }

        // limit labels
        for (let [l, limit] of Object.entries(limits)) {
            limit.label = CONFIG.SR5.limits[l];
        }
        // skill labels
        for (let [s, skill] of Object.entries(active)) {
            skill.label = CONFIG.SR5.activeSkills[s];
        }
        // attribute labels
        for (let [a, att] of Object.entries(attributes)) {
            att.label = CONFIG.SR5.attributes[a];
        }
        // tracks
        for (let [t, tr] of Object.entries(track)) {
            tr.label = CONFIG.SR5.damageTypes[t];
        }
    }

    getModifier(modifierName: string): number | undefined {
        return this.data.data.modifiers[modifierName];
    }

    findActiveSkill(skillName?: string): SkillField | undefined {
        if (skillName === undefined) return undefined;
        return this.data.data.skills.active[skillName];
    }

    findAttribute(attributeName?: string): AttributeField | undefined {
        if (attributeName === undefined) return undefined;
        return this.data.data.attributes[attributeName];
    }

    getWounds(): number {
        return this.data.data.wounds?.value || 0;
    }

    getEdge(): AttributeField & ValueMaxPair<number> {
        return this.data.data.attributes.edge;
    }

    getArmor(): BaseValuePair<number> & ModifiableValue & LabelField {
        return this.data.data.armor;
    }

    getOwnedItem(itemId: string): SR5Item | null {
        return (super.getOwnedItem(itemId) as unknown) as SR5Item;
    }

    addKnowledgeSkill(category, skill?) {
        const defaultSkill = {
            name: '',
            specs: [],
            base: 0,
            value: 0,
            mod: 0,
        };
        skill = {
            ...defaultSkill,
            ...skill,
        };

        const id = randomID(16);
        const value = {};
        value[id] = skill;
        const fieldName = `data.skills.knowledge.${category}.value`;
        const updateData = {};
        updateData[fieldName] = value;
        this.update(updateData);
    }

    removeLanguageSkill(skillId) {
        const value = {};
        value[skillId] = { _delete: true };
        this.update({ 'data.skills.language.value': value });
    }

    addLanguageSkill(skill) {
        const defaultSkill = {
            name: '',
            specs: [],
            base: 0,
            value: 0,
            mod: 0,
        };
        skill = {
            ...defaultSkill,
            ...skill,
        };

        const id = randomID(16);
        const value = {};
        value[id] = skill;
        const fieldName = `data.skills.language.value`;
        const updateData = {};
        updateData[fieldName] = value;
        this.update(updateData);
    }

    removeKnowledgeSkill(skillId, category) {
        const value = {};
        const updateData = {};

        const dataString = `data.skills.knowledge.${category}.value`;
        value[skillId] = { _delete: true };
        updateData[dataString] = value;

        this.update(updateData);
    }

    rollFade(options: ActorRollOptions = {}, incoming = -1) {
        const wil = this.data.data.attributes.willpower;
        const res = this.data.data.attributes.resonance;
        const data = this.data.data;

        const parts = {};
        parts[wil.label] = wil.value;
        parts[res.label] = res.value;
        if (data.modifiers.fade) parts['SR5.Bonus'] = data.modifiers.fade;

        let title = `${game.i18n.localize('SR5.Resist')} ${game.i18n.localize('SR5.Fade')}`;
        const incomingDrain = {
            label: 'SR5.Fade',
            value: incoming,
        };
        return ShadowrunRoller.advancedRoll({
            event: options.event,
            parts,
            actor: this,
            title: title,
            wounds: false,
            incomingDrain,
        });
    }

    rollDrain(options: ActorRollOptions = {}, incoming = -1) {
        const wil = this.data.data.attributes.willpower;
        const drainAtt = this.data.data.attributes[this.data.data.magic.attribute];

        const parts = {};
        parts[wil.label] = wil.value;
        parts[drainAtt.label] = drainAtt.value;
        if (this.data.data.modifiers.drain) parts['SR5.Bonus'] = this.data.data.modifiers.drain;

        let title = `${game.i18n.localize('SR5.Resist')} ${game.i18n.localize('SR5.Drain')}`;
        const incomingDrain = {
            label: 'SR5.Drain',
            value: incoming,
        };
        return ShadowrunRoller.advancedRoll({
            event: options.event,
            parts,
            actor: this,
            title: title,
            wounds: false,
            incomingDrain,
        });
    }

    rollArmor(options: ActorRollOptions = {}, parts: ModList<number> = {}) {
        this._addArmorParts(parts);
        return ShadowrunRoller.advancedRoll({
            event: options.event,
            actor: this,
            parts,
            title: game.i18n.localize('SR5.Armor'),
            wounds: false,
        });
    }

    rollDefense(options: DefenseRollOptions = {}, parts: ModList<number> = {}) {
        this._addDefenseParts(parts);
        let dialogData = {
            parts,
            cover: options.cover,
        };
        let template = 'systems/shadowrun5e/templates/rolls/roll-defense.html';
        let special = '';
        let cancel = true;
        const incomingAttack = options.incomingAttack;
        const event = options.event;
        return new Promise((resolve) => {
            renderTemplate(template, dialogData).then((dlg) => {
                new Dialog({
                    title: game.i18n.localize('SR5.Defense'),
                    content: dlg,
                    buttons: {
                        normal: {
                            label: game.i18n.localize('SR5.Normal'),
                            callback: () => (cancel = false),
                        },
                        full_defense: {
                            label: `${game.i18n.localize('SR5.FullDefense')} (+${
                                this.data.data.attributes.willpower.value
                            })`,
                            callback: () => {
                                special = 'full_defense';
                                cancel = false;
                            },
                        },
                    },
                    default: 'normal',
                    close: async (html) => {
                        if (cancel) return;
                        let cover = Helpers.parseInputToNumber($(html).find('[name=cover]').val());
                        if (special === 'full_defense')
                            parts['SR5.FullDefense'] = this.data.data.attributes.willpower.value;
                        if (special === 'dodge')
                            parts['SR5.Dodge'] = this.data.data.skills.active.gymnastics.value;
                        if (special === 'block')
                            parts['SR5.Block'] = this.data.data.skills.active.unarmed_combat.value;
                        if (cover) parts['SR5.Cover'] = cover;

                        resolve(
                            ShadowrunRoller.advancedRoll({
                                event: event,
                                actor: this,
                                parts,
                                title: game.i18n.localize('SR5.DefenseTest'),
                                incomingAttack,
                            }).then(async (roll: Roll | undefined) => {
                                if (incomingAttack && roll) {
                                    let defenderHits = roll.total;
                                    let attackerHits = incomingAttack.hits || 0;
                                    let netHits = attackerHits - defenderHits;

                                    if (netHits >= 0) {
                                        const damage = incomingAttack.damage;
                                        damage.mod['SR5.NetHits'] = netHits;
                                        damage.value = damage.base + Helpers.totalMods(damage.mod);

                                        const soakRollOptions = {
                                            event: event,
                                            damage: incomingAttack.damage,
                                        };
                                        await this.rollSoak(soakRollOptions);
                                    }
                                }
                            })
                        );
                    },
                }).render(true);
            });
        });
    }

    rollSoak(options?: SoakRollOptions, parts: ModList<number> = {}) {
        this._addSoakParts(parts);
        let dialogData = {
            damage: options?.damage,
            parts,
        };
        let id = '';
        let cancel = true;
        let template = 'systems/shadowrun5e/templates/rolls/roll-soak.html';
        return new Promise((resolve) => {
            renderTemplate(template, dialogData).then((dlg) => {
                new Dialog({
                    title: 'SR5.DamageResistanceTest',
                    content: dlg,
                    buttons: {
                        base: {
                            label: 'Base',
                            icon: '<i class="fas fa-shield-alt"></i>',
                            callback: () => {
                                id = 'default';
                                cancel = false;
                            },
                        },
                        acid: {
                            label: 'Acid',
                            icon: '<i class="fas fa-vial"></i>',
                            callback: () => {
                                id = 'acid';
                                cancel = false;
                            },
                        },
                        cold: {
                            label: 'Cold',
                            icon: '<i class="fas fa-snowflake"></i>',
                            callback: () => {
                                id = 'cold';
                                cancel = false;
                            },
                        },
                        electricity: {
                            label: 'Elec',
                            icon: '<i class="fas fa-bolt"></i>',
                            callback: () => {
                                id = 'electricity';
                                cancel = false;
                            },
                        },
                        fire: {
                            label: 'Fire',
                            icon: '<i class="fas fa-fire"></i>',
                            callback: () => {
                                id = 'fire';
                                cancel = false;
                            },
                        },
                        radiation: {
                            label: 'Rad',
                            icon: '<i class="fas fa-radiation"></i>',
                            callback: () => {
                                id = 'radiation';
                                cancel = false;
                            },
                        },
                    },
                    close: async (html) => {
                        if (cancel) return;

                        const armor = this.getArmor();
                        const armorId = id === 'default' ? '' : id;
                        const bonusArmor = armor[armorId] || 0;
                        if (bonusArmor) parts[Helpers.label(armorId)] = bonusArmor;

                        const ap = Helpers.parseInputToNumber($(html).find('[name=ap]').val());
                        if (ap) {
                            let armorVal = armor.value + bonusArmor;

                            // don't take more AP than armor
                            parts['SR5.AP'] = Math.max(ap, -armorVal);
                        }

                        let title = game.i18n.localize('SR5.SoakTest');
                        resolve(
                            ShadowrunRoller.advancedRoll({
                                event: options?.event,
                                actor: this,
                                soak: options?.damage,
                                parts,
                                title: title,
                                wounds: false,
                            })
                        );
                    },
                }).render(true);
            });
        });
    }

    rollSingleAttribute(attId, options: ActorRollOptions) {
        const attr = this.data.data.attributes[attId];
        const parts = {};
        parts[attr.label] = attr.value;
        this._addMatrixParts(parts, attr);
        this._addGlobalParts(parts);
        return ShadowrunRoller.advancedRoll({
            event: options?.event,
            actor: this,
            parts,
            title: Helpers.label(attId),
        });
    }

    rollTwoAttributes([id1, id2], options: ActorRollOptions) {
        const attr1 = this.data.data.attributes[id1];
        const attr2 = this.data.data.attributes[id2];
        const label1 = Helpers.label(id1);
        const label2 = Helpers.label(id2);
        const parts = {};
        parts[attr1.label] = attr1.value;
        parts[attr2.label] = attr2.value;
        this._addMatrixParts(parts, [attr1, attr2]);
        this._addGlobalParts(parts);
        return ShadowrunRoller.advancedRoll({
            event: options?.event,
            actor: this,
            parts,
            title: `${label1} + ${label2}`,
        });
    }

    rollNaturalRecovery(track, options?: ActorRollOptions) {
        let id1 = 'body';
        let id2 = 'willpower';
        let title = 'Natural Recover';
        if (track === 'physical') {
            id2 = 'body';
            title += ' - Physical - 1 Day';
        } else {
            title += ' - Stun - 1 Hour';
        }
        let att1 = this.data.data.attributes[id1];
        let att2 = this.data.data.attributes[id2];
        const parts = {};
        parts[att1.label] = att1.value;
        parts[att2.label] = att2.value;

        return ShadowrunRoller.advancedRoll({
            event: options?.event,
            actor: this,
            parts,
            title: title,
            extended: true,
            after: async (roll: Roll | undefined) => {
                if (!roll) return;
                let hits = roll.total;
                let current = this.data.data.track[track].value;

                current = Math.max(current - hits, 0);

                let key = `data.track.${track}.value`;

                let u = {};
                u[key] = current;
                await this.update(u);
            },
        });
    }

    async rollMatrixAttribute(attr, options?: ActorRollOptions) {
        let matrix_att = this.data.data.matrix[attr];
        let title = game.i18n.localize(CONFIG.SR5.matrixAttributes[attr]);
        const parts = {};
        parts[CONFIG.SR5.matrixAttributes[attr]] = matrix_att.value;
        if (options && options.event && options.event[CONFIG.SR5.kbmod.SPEC])
            parts['SR5.Specialization'] = 2;
        if (Helpers.hasModifiers(options?.event)) {
            return ShadowrunRoller.advancedRoll({
                event: options?.event,
                actor: this,
                parts,
                title: title,
            });
        }
        const attributes = Helpers.filter(
            this.data.data.attributes,
            ([, value]) => value.value > 0
        );
        const attribute = 'willpower';

        let dialogData = {
            attribute: attribute,
            attributes: attributes,
        };
        const buttons = {
            roll: {
                label: 'Continue',
                callback: () => (cancel = false),
            },
        };

        let cancel = true;
        renderTemplate('systems/shadowrun5e/templates/rolls/matrix-roll.html', dialogData).then(
            (dlg) => {
                new Dialog({
                    title: `${title} Test`,
                    content: dlg,
                    buttons: buttons,
                    close: async (html) => {
                        if (cancel) return;
                        const newAtt = Helpers.parseInputToString(
                            $(html).find('[name=attribute]').val()
                        );
                        let att: AttributeField | undefined = undefined;
                        if (newAtt) {
                            att = this.data.data.attributes[newAtt];
                            title += ` + ${game.i18n.localize(CONFIG.SR5.attributes[newAtt])}`;
                        }
                        if (att !== undefined) {
                            if (att.value && att.label) parts[att.label] = att.value;
                            this._addMatrixParts(parts, true);
                            this._addGlobalParts(parts);
                            return ShadowrunRoller.advancedRoll({
                                event: options?.event,
                                actor: this,
                                parts,
                                title: title,
                            });
                        }
                    },
                }).render(true);
            }
        );
    }

    promptRoll(options?: ActorRollOptions) {
        return ShadowrunRoller.advancedRoll({
            event: options?.event,
            parts: {},
            actor: this,
            dialogOptions: {
                prompt: true,
            },
        });
    }

    rollAttributesTest(rollId, options?: ActorRollOptions) {
        const title = game.i18n.localize(CONFIG.SR5.attributeRolls[rollId]);
        const atts = this.data.data.attributes;
        const modifiers = this.data.data.modifiers;
        const parts = {};
        if (rollId === 'composure') {
            parts[atts.charisma.label] = atts.charisma.value;
            parts[atts.willpower.label] = atts.willpower.value;
            if (modifiers.composure) parts['SR5.Bonus'] = modifiers.composure;
        } else if (rollId === 'judge_intentions') {
            parts[atts.charisma.label] = atts.charisma.value;
            parts[atts.intuition.label] = atts.intuition.value;
            if (modifiers.judge_intentions) parts['SR5.Bonus'] = modifiers.judge_intentions;
        } else if (rollId === 'lift_carry') {
            parts[atts.strength.label] = atts.strength.value;
            parts[atts.body.label] = atts.body.value;
            if (modifiers.lift_carry) parts['SR5.Bonus'] = modifiers.lift_carry;
        } else if (rollId === 'memory') {
            parts[atts.willpower.label] = atts.willpower.value;
            parts[atts.logic.label] = atts.logic.value;
            if (modifiers.memory) parts['SR5.Bonus'] = modifiers.memory;
        }

        return ShadowrunRoller.advancedRoll({
            event: options?.event,
            actor: this,
            parts,
            title: `${title} Test`,
        });
    }

    rollSkill(skill, options?: SkillRollOptions) {
        let att = this.data.data.attributes[skill.attribute];
        let title = skill.label;

        if (options?.attribute) att = this.data.data.attributes[options.attribute];
        let limit = this.data.data.limits[att.limit];
        const parts = {};
        parts[skill.label] = skill.value;

        if (options?.event && Helpers.hasModifiers(options?.event)) {
            parts[att.label] = att.value;
            if (options.event[CONFIG.SR5.kbmod.SPEC]) parts['SR5.Specialization'] = 2;

            this._addMatrixParts(parts, [att, skill]);
            this._addGlobalParts(parts);
            return ShadowrunRoller.advancedRoll({
                event: options.event,
                actor: this,
                parts,
                limit,
                title: `${title} Test`,
            });
        }
        let dialogData = {
            attribute: skill.attribute,
            attributes: Helpers.filter(this.data.data.attributes, ([, value]) => value.value > 0),
            limit: att.limit,
            limits: this.data.data.limits,
        };
        let cancel = true;
        let spec = '';

        let buttons = {
            roll: {
                label: 'Normal',
                callback: () => (cancel = false),
            },
        };
        // add specializations to dialog as buttons
        if (skill.specs?.length) {
            skill.specs.forEach(
                (s) =>
                    (buttons[s] = {
                        label: s,
                        callback: () => {
                            cancel = false;
                            spec = s;
                        },
                    })
            );
        }
        renderTemplate('systems/shadowrun5e/templates/rolls/skill-roll.html', dialogData).then(
            (dlg) => {
                new Dialog({
                    title: `${title} Test`,
                    content: dlg,
                    buttons,
                    close: async (html) => {
                        if (cancel) return;
                        const newAtt = Helpers.parseInputToString(
                            $(html).find('[name="attribute"]').val()
                        );
                        const newLimit = Helpers.parseInputToString(
                            $(html).find('[name="attribute.limit"]').val()
                        );
                        att = this.data.data.attributes[newAtt];
                        title += ` + ${game.i18n.localize(CONFIG.SR5.attributes[newAtt])}`;
                        limit = this.data.data.limits[newLimit];
                        parts[att.label] = att.value;
                        if (skill.value === 0) parts['SR5.Defaulting'] = -1;
                        if (spec) parts['SR5.Specialization'] = 2;
                        this._addMatrixParts(parts, [att, skill]);
                        this._addGlobalParts(parts);
                        return ShadowrunRoller.advancedRoll({
                            event: options?.event,
                            actor: this,
                            parts,
                            limit,
                            title: `${title} Test`,
                        });
                    },
                }).render(true);
            }
        );
    }

    rollKnowledgeSkill(catId, skillId, options?: SkillRollOptions) {
        const category = this.data.data.skills.knowledge[catId];
        const skill = duplicate(category.value[skillId]);
        skill.attribute = category.attribute;
        skill.label = skill.name;
        return this.rollSkill(skill, options);
    }

    rollLanguageSkill(skillId, options?: SkillRollOptions) {
        const skill = duplicate(this.data.data.skills.language.value[skillId]);
        skill.attribute = 'intuition';
        skill.label = skill.name;
        return this.rollSkill(skill, options);
    }

    rollActiveSkill(skillId, options?: SkillRollOptions) {
        const skill = this.data.data.skills.active[skillId];
        skill.label = game.i18n.localize(CONFIG.SR5.activeSkills[skillId]);
        return this.rollSkill(skill, options);
    }

    rollAttribute(attId, options?: ActorRollOptions) {
        let title = game.i18n.localize(CONFIG.SR5.attributes[attId]);
        const att = this.data.data.attributes[attId];
        const atts = this.data.data.attributes;
        const parts = {};
        parts[att.label] = att.value;
        let dialogData = {
            attribute: att,
            attributes: atts,
        };
        let cancel = true;
        renderTemplate(
            'systems/shadowrun5e/templates/rolls/single-attribute.html',
            dialogData
        ).then((dlg) => {
            new Dialog({
                title: `${title} Attribute Test`,
                content: dlg,
                buttons: {
                    roll: {
                        label: 'Continue',
                        callback: () => (cancel = false),
                    },
                },
                default: 'roll',
                close: async (html) => {
                    if (cancel) return;

                    const att2Id: string = Helpers.parseInputToString(
                        $(html).find('[name=attribute2]').val()
                    );
                    let att2: AttributeField | undefined = undefined;
                    if (att2Id !== 'none') {
                        att2 = atts[att2Id];
                        if (att2?.label) {
                            parts[att2.label] = att2.value;
                            const att2IdLabel = game.i18n.localize(CONFIG.SR5.attributes[att2Id]);
                            title += ` + ${att2IdLabel}`;
                        }
                    }
                    if (att2Id === 'default') {
                        parts['SR5.Defaulting'] = -1;
                    }
                    this._addMatrixParts(parts, [att, att2]);
                    this._addGlobalParts(parts);
                    return ShadowrunRoller.advancedRoll({
                        event: options?.event,
                        title: `${title} Test`,
                        actor: this,
                        parts,
                    });
                },
            }).render(true);
        });
    }

    _addMatrixParts(parts, atts) {
        if (Helpers.isMatrix(atts)) {
            const m = this.data.data.matrix;
            if (m.hot_sim) parts['SR5.HotSim'] = 2;
            if (m.running_silent) parts['SR5.RunningSilent'] = -2;
        }
    }
    _addGlobalParts(parts) {
        if (this.data.data.modifiers.global) {
            parts['SR5.Global'] = this.data.data.modifiers.global;
        }
    }

    _addDefenseParts(parts) {
        const reaction = this.findAttribute('reaction');
        const intuition = this.findAttribute('intuition');
        const mod = this.getModifier('defense');

        if (reaction) {
            parts[reaction.label || 'SR5.Reaction'] = reaction.value;
        }
        if (intuition) {
            parts[intuition.label || 'SR5.Intuition'] = intuition.value;
        }
        if (mod) {
            parts['SR5.Bonus'] = mod;
        }
    }

    _addArmorParts(parts: ModList<number>) {
        const armor = this.getArmor();
        if (armor) {
            parts[armor.label || 'SR5.Armor'] = armor.base;
            for (let [key, val] of Object.entries(armor.mod)) {
                parts[key] = val;
            }
        }
    }

    _addSoakParts(parts: ModList<number>) {
        const body = this.findAttribute('body');
        if (body) {
            parts[body.label || 'SR5.Body'] = body.value;
        }
        this._addArmorParts(parts);
    }

    static async pushTheLimit(roll) {
        let title = roll.find('.flavor-text').text();
        let msg: ChatMessage = game.messages.get(roll.data().messageId);

        const actor = (msg.user.character as unknown) as SR5Actor;
        if (actor) {
            return ShadowrunRoller.advancedRoll({
                event: { shiftKey: true, altKey: true },
                title: `${title} - Push the Limit`,
                parts: {},
                actor: actor,
                wounds: false,
            });
        }
    }

    static async secondChance(roll) {
        let formula = roll.find('.dice-formula').text();
        let hits = parseInt(roll.find('.dice-total').text());
        let title = roll.find('.flavor-text').text();
        let re = /(\d+)d6/;
        let matches = formula.match(re);
        if (matches[1]) {
            let match = matches[1];
            let pool = parseInt(match.replace('d6', ''));
            if (!isNaN(pool) && !isNaN(hits)) {
                let msg: ChatMessage = game.messages.get(roll.data().messageId);
                const actor = (msg.user.character as unknown) as SR5Actor;

                if (actor) {
                    const parts = {};
                    parts['SR5.OriginalDicePool'] = pool;
                    parts['SR5.Successes'] = -hits;

                    return ShadowrunRoller.advancedRoll({
                        event: { shiftKey: true },
                        title: `${title} - Second Chance`,
                        parts,
                        wounds: false,
                        actor: actor,
                    }).then(() => {
                        actor.update({
                            'data.attributes.edge.value': actor.data.data.attributes.edge.value - 1,
                        });
                    });
                }
            }
        }
    }
}
