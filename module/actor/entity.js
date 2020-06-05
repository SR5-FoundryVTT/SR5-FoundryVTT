var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { DiceSR } from '../dice.js';
import { Helpers } from '../helpers.js';
export class SR5Actor extends Actor {
    update(data, options) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.update.call(this, data, options);
            // trigger update for all items with action
            // needed for rolls to properly update when items or attributes update
            const itemUpdates = [];
            for (let item of this.data.data.items) {
                if (item && item.data.action) {
                    itemUpdates.push(item);
                }
            }
            yield this.updateEmbeddedEntity('OwnedItem', itemUpdates);
            return this;
        });
    }
    getOverwatchScore() {
        const os = this.getFlag('shadowrun5e', 'overwatchScore');
        return os !== undefined ? os : 0;
    }
    setOverwatchScore(value) {
        return __awaiter(this, void 0, void 0, function* () {
            const num = parseInt(value);
            if (!isNaN(num)) {
                return this.setFlag('shadowrun5e', 'overwatchScore', num);
            }
        });
    }
    prepareData() {
        var _a, _b, _c;
        super.prepareData();
        const actorData = this.data;
        const items = actorData.data.items;
        const data = actorData.data;
        const attrs = data.attributes;
        const armor = data.armor;
        const { limits } = data;
        const { language } = data.skills;
        const { active } = data.skills;
        const { knowledgeSkills } = data;
        const { track } = data;
        attrs.magic.hidden = !(data.special === 'magic');
        attrs.resonance.hidden = !(data.special === 'resonance');
        if (!data.modifiers)
            data.modifiers = {};
        const mods = {};
        let modifiers = [
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
        modifiers.sort();
        modifiers.unshift('global');
        for (let item of modifiers) {
            mods[item] = data.modifiers[item] || 0;
        }
        data.modifiers = mods;
        let totalEssence = 6;
        armor.value = 0;
        armor.mod = 0;
        for (const element of Object.keys(CONFIG.SR5.elementTypes)) {
            armor[element] = 0;
        }
        // DEFAULT MATRIX ATTS TO MOD VALUE
        const matrix = data.matrix;
        matrix.firewall.value = matrix.firewall.mod;
        matrix.data_processing.value = matrix.data_processing.mod;
        matrix.attack.value = matrix.attack.mod;
        matrix.sleaze.value = matrix.sleaze.mod;
        matrix.condition_monitor.max = 0;
        matrix.rating = 0;
        matrix.name = '';
        matrix.device = '';
        // PARSE WEAPONS AND SET VALUES AS NEEDED
        for (let item of Object.values(items)) {
            const itemData = item.data;
            const type = item.type;
            const equipped = (_a = itemData.technology) === null || _a === void 0 ? void 0 : _a.equipped;
            if (equipped) {
                if (itemData.armor && itemData.armor.value) {
                    if (itemData.armor.mod)
                        armor.mod += itemData.armor.value;
                    // if it's a mod, add to the mod field
                    else
                        armor.value = itemData.armor.value; // if not a mod, set armor.value to the items value
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
            if (item.type === 'device' && ((_b = itemData.technology) === null || _b === void 0 ? void 0 : _b.equipped)) {
                matrix.device = item._id;
                matrix.condition_monitor.max = ((_c = itemData.condition_monitor) === null || _c === void 0 ? void 0 : _c.max) || 0;
                matrix.rating = itemData.technology.rating;
                matrix.is_cyberdeck = itemData.category === 'cyberdeck';
                matrix.name = item.name;
                matrix.item = itemData;
                if (itemData.category === 'cyberdeck' && itemData.atts) {
                    for (let [key, att] of Object.entries(itemData.atts)) {
                        matrix[att.att].value += att.value;
                        matrix[att.att].device_att = key;
                    }
                }
                else {
                    matrix.firewall.value += matrix.rating;
                    matrix.data_processing.value += matrix.rating;
                }
            }
        }
        // ATTRIBUTES
        for (let [, att] of Object.entries(attrs)) {
            if (!att.hidden) {
                if (!att.mod)
                    att.mod = {};
                att.value = att.base + Helpers.totalMods(att.mod);
            }
        }
        if (language) {
            if (!language.value)
                language.value = {};
            language.attribute = 'intuition';
        }
        for (const skill of Object.values(active)) {
            if (!skill.hidden) {
                if (!skill.mod)
                    skill.mod = {};
                skill.value = skill.base + Helpers.totalMods(skill.mod);
            }
        }
        {
            const entries = Object.entries(data.skills.language.value);
            // remove entries which are deleted TODO figure out how to delete these from the data
            entries.forEach(([key, val]) => val._delete && delete data.skills.language.value[key]);
        }
        for (let skill of Object.values(language.value)) {
            if (!skill.mod)
                skill.mod = {};
            skill.value = skill.base + Helpers.totalMods(skill.mod);
        }
        for (let [, group] of Object.entries(knowledgeSkills)) {
            const entries = Object.entries(group.value);
            // remove entries which are deleted TODO figure out how to delete these from the data
            group.value = entries
                .filter(([, val]) => !val._delete)
                .reduce((acc, [id, skill]) => {
                if (!skill.mod)
                    skill.mod = {};
                skill.value = skill.base + Helpers.totalMods(skill.mod);
                acc[id] = skill;
                return acc;
            }, {});
        }
        // TECHNOMANCER LIVING PERSONA
        if (data.special === 'resonance') {
            // if value is equal to mod, we don't have an item equipped TODO this is horrible
            if (matrix.firewall.value === matrix.firewall.mod) {
                // we should use living persona
                matrix.firewall.value += attrs.willpower.value;
                matrix.data_processing.value += attrs.logic.value;
                matrix.rating = attrs.resonance.value;
                matrix.attack.value += attrs.charisma.value;
                matrix.sleaze.value += attrs.intuition.value;
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
        attrs.firewall = {
            value: matrix.firewall.value,
            base: matrix.firewall.base,
            mod: matrix.firewall.mod,
            hidden: true,
        };
        attrs.data_processing = {
            value: matrix.data_processing.value,
            base: matrix.data_processing.base,
            mod: matrix.data_processing.mod,
            hidden: true,
        };
        attrs.attack = {
            value: matrix.attack.value,
            base: matrix.attack.base,
            mod: matrix.attack.mod,
            hidden: true,
        };
        attrs.sleaze = {
            value: matrix.sleaze.value,
            base: matrix.sleaze.base,
            mod: matrix.sleaze.mod,
            hidden: true,
        };
        // SET ARMOR
        armor.value += armor.mod + mods['armor'];
        // SET ESSENCE
        actorData.data.attributes.essence.value = +(totalEssence + mods['essence']).toFixed(3);
        // SETUP LIMITS
        limits.physical.value =
            Math.ceil((2 * attrs.strength.value + attrs.body.value + attrs.reaction.value) / 3) +
                mods['physical_limit'];
        limits.mental.value =
            Math.ceil((2 * attrs.logic.value + attrs.intuition.value + attrs.willpower.value) / 3) +
                mods['mental_limit'];
        limits.social.value =
            Math.ceil((2 * attrs.charisma.value + attrs.willpower.value + attrs.essence.value) / 3) + mods['social_limit'];
        // MOVEMENT
        const movement = data.movement;
        movement.walk.value = attrs.agility.value * (2 + mods['walk']);
        movement.run.value = attrs.agility.value * (4 + mods['run']);
        // CONDITION_MONITORS
        track.physical.max = 8 + Math.ceil(attrs.body.value / 2) + mods['physical_track'];
        track.physical.overflow.max = attrs.body.value;
        track.stun.max = 8 + Math.ceil(attrs.willpower.value / 2) + mods['stun_track'];
        // CALCULATE RECOIL
        data.recoil_compensation = 1 + Math.ceil(attrs.strength.value / 3);
        // INITIATIVE
        const init = data.initiative;
        init.meatspace.base.base = attrs.intuition.value + attrs.reaction.value;
        init.meatspace.dice.base = 1;
        init.astral.base.base = attrs.intuition.value * 2;
        init.astral.dice.base = 2;
        init.matrix.base.base = attrs.intuition.value + data.matrix.data_processing.value;
        init.matrix.dice.base = data.matrix.hot_sim ? 4 : 3;
        if (init.perception === 'matrix')
            init.current = init.matrix;
        else if (init.perception === 'astral')
            init.current = init.astral;
        else {
            init.current = init.meatspace;
            init.perception = 'meatspace';
        }
        init.current.dice.value = init.current.dice.base + mods['initiative_dice'];
        if (init.edge)
            init.current.dice.value = 5;
        init.current.dice.value = Math.min(5, init.current.dice.value); // maximum of 5d6 for initiative
        init.current.dice.text = `${init.current.dice.value}d6`;
        init.current.base.value = init.current.base.base + mods['initiative'];
        const soak = attrs.body.value + armor.value + mods['soak'];
        const drainAtt = attrs[data.magic.attribute];
        data.rolls = Object.assign(Object.assign({}, data.rolls), { defense: attrs.reaction.value + attrs.intuition.value + mods['defense'], drain: attrs.willpower.value + (drainAtt ? drainAtt.value : 0) + mods['drain'], fade: attrs.willpower.value + attrs.resonance.value + mods['fade'], soak: {
                default: soak,
                cold: soak + armor.cold,
                fire: soak + armor.fire,
                acid: soak + armor.acid,
                electricity: soak + armor.electricity,
                radiation: soak + armor.radiation,
            }, composure: attrs.charisma.value + attrs.willpower.value + mods['composure'], judge_intentions: attrs.charisma.value + attrs.intuition.value + mods['judge_intentions'], lift_carry: attrs.strength.value + attrs.body.value + mods['lift_carry'], memory: attrs.willpower.value + attrs.logic.value + mods['memory'] });
        {
            const count = 3 + mods['wound_tolerance'];
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
        for (let [a, att] of Object.entries(attrs)) {
            att.label = CONFIG.SR5.attributes[a];
        }
        // tracks
        for (let [t, tr] of Object.entries(track)) {
            tr.label = CONFIG.SR5.damageTypes[t];
        }
    }
    addKnowledgeSkill(category, skill) {
        const defaultSkill = {
            name: '',
            specs: [],
            base: 0,
            value: 0,
            mod: 0,
        };
        skill = Object.assign(Object.assign({}, defaultSkill), skill);
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
        skill = Object.assign(Object.assign({}, defaultSkill), skill);
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
    rollFade(options = {}, incoming = -1) {
        const wil = this.data.data.attributes.willpower;
        const res = this.data.data.attributes.resonance;
        const data = this.data.data;
        const parts = {};
        parts[wil.label] = wil.value;
        parts[res.label] = res.value;
        if (data.modifiers.fade)
            parts['SR5.Bonus'] = data.modifiers.fade;
        let title = 'Fade';
        if (incoming >= 0)
            title += ` (${incoming} incoming)`;
        DiceSR.rollTest({
            event: options.event,
            parts,
            actor: this,
            title: title,
            wounds: false,
        });
    }
    rollDrain(options = {}, incoming = -1) {
        const wil = this.data.data.attributes.willpower;
        const drainAtt = this.data.data.attributes[this.data.data.magic.attribute];
        const parts = {};
        parts[wil.label] = wil.value;
        parts[drainAtt.label] = drainAtt.value;
        if (this.data.data.modifiers.drain)
            parts['SR5.Bonus'] = this.data.data.modifiers.drain;
        let title = 'Drain';
        if (incoming >= 0)
            title += ` (${incoming} incoming)`;
        DiceSR.rollTest({
            event: options.event,
            parts,
            actor: this,
            title: title,
            wounds: false,
        });
    }
    rollArmor(options = {}) {
        const armor = this.data.data.armor.value;
        const parts = {};
        parts['SR5.Armor'] = armor;
        return DiceSR.rollTest({
            event: options.event,
            actor: this,
            parts,
            title: 'Armor',
            wounds: false,
        });
    }
    rollDefense(options = {}) {
        let dialogData = {
            defense: this.data.data.rolls.defense,
            fireMode: options.fireModeDefense,
            cover: options.cover,
        };
        let template = 'systems/shadowrun5e/templates/rolls/roll-defense.html';
        let special = '';
        let cancel = true;
        return new Promise((resolve) => {
            renderTemplate(template, dialogData).then((dlg) => {
                new Dialog({
                    title: 'Defense',
                    content: dlg,
                    buttons: {
                        normal: {
                            label: game.i18n.localize('Normal'),
                            callback: () => (cancel = false),
                        },
                        full_defense: {
                            label: `${game.i18n.localize('SR5.FullDefense')} (+${this.data.data.attributes.willpower.value})`,
                            callback: () => {
                                special = 'full_defense';
                                cancel = false;
                            },
                        },
                    },
                    default: 'normal',
                    close: (html) => __awaiter(this, void 0, void 0, function* () {
                        if (cancel)
                            return;
                        const rea = this.data.data.attributes.reaction;
                        const int = this.data.data.attributes.intuition;
                        const parts = {};
                        parts[rea.label] = rea.value;
                        parts[int.label] = int.value;
                        if (this.data.data.modifiers.defense)
                            parts['SR5.Bonus'] = this.data.data.modifiers.defense;
                        let fireMode = Helpers.parseInputToNumber($(html).find('[name=fireMode]').val());
                        let cover = Helpers.parseInputToNumber($(html).find('[name=cover]').val());
                        if (special === 'full_defense')
                            parts['SR5.FullDefense'] = this.data.data.attributes.willpower.value;
                        if (special === 'dodge')
                            parts['SR5.Dodge'] = this.data.data.skills.active.gymnastics.value;
                        if (special === 'block')
                            parts['SR5.Block'] = this.data.data.skills.active.unarmed_combat.value;
                        if (fireMode)
                            parts['SR5.FireMode'] = fireMode;
                        if (cover)
                            parts['SR5.Cover'] = cover;
                        resolve(DiceSR.rollTest({
                            event: options.event,
                            actor: this,
                            parts,
                            title: 'Defense',
                        }).then((roll) => __awaiter(this, void 0, void 0, function* () {
                            this.unsetFlag('shadowrun5e', 'incomingAttack');
                            if (options.incomingAttack && roll) {
                                let defenderHits = roll.total;
                                let attack = options.incomingAttack;
                                let attackerHits = attack.hits || 0;
                                let netHits = attackerHits - defenderHits;
                                if (netHits >= 0) {
                                    let damage = options.incomingAttack.damage + netHits;
                                    let damageType = options.incomingAttack.damageType;
                                    let ap = options.incomingAttack.ap;
                                    // ui.notifications.info(`Got Hit: DV${damage}${damageType ? damageType.charAt(0).toUpperCase() : ''} ${ap}AP`);
                                    this.setFlag('shadowrun5e', 'incomingDamage', {
                                        damage,
                                        damageType,
                                        ap,
                                    });
                                    this.rollSoak({
                                        event: options.event,
                                        damage,
                                        damageType,
                                        ap,
                                    });
                                }
                            }
                        })));
                    }),
                }).render(true);
            });
        });
    }
    rollSoak(options) {
        let dialogData = {
            damage: options === null || options === void 0 ? void 0 : options.damage,
            ap: options === null || options === void 0 ? void 0 : options.ap,
            soak: this.data.data.rolls.soak.default,
        };
        let id = '';
        let cancel = true;
        let template = 'systems/shadowrun5e/templates/rolls/roll-soak.html';
        return new Promise((resolve) => {
            renderTemplate(template, dialogData).then((dlg) => {
                new Dialog({
                    title: 'Soak Test',
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
                    close: (html) => __awaiter(this, void 0, void 0, function* () {
                        this.unsetFlag('shadowrun5e', 'incomingDamage');
                        if (cancel)
                            return;
                        const body = this.data.data.attributes.body;
                        const armor = this.data.data.armor;
                        const parts = {};
                        parts[body.label] = body.value;
                        parts['SR5.Armor'] = armor.value;
                        if (this.data.data.modifiers.soak)
                            parts['SR5.Bonus'] = this.data.data.modifiers.soak;
                        const armorId = id === 'default' ? '' : id;
                        const bonusArmor = armor[armorId] || 0;
                        if (bonusArmor)
                            parts[Helpers.label(armorId)] = bonusArmor;
                        const ap = Helpers.parseInputToNumber($(html).find('[name=ap]').val());
                        if (ap) {
                            let armorVal = armor.value + bonusArmor;
                            // don't take more AP than armor
                            parts['SR5.AP'] = Math.max(ap, -armorVal);
                        }
                        const label = Helpers.label(id);
                        let title = `Soak - ${label}`;
                        if (options === null || options === void 0 ? void 0 : options.damage)
                            title += ` - Incoming Damage: ${options.damage}`;
                        resolve(DiceSR.rollTest({
                            event: options === null || options === void 0 ? void 0 : options.event,
                            actor: this,
                            parts,
                            title: title,
                            wounds: false,
                        }));
                    }),
                }).render(true);
            });
        });
    }
    rollSingleAttribute(attId, options) {
        const attr = this.data.data.attributes[attId];
        const parts = {};
        parts[attr.label] = attr.value;
        this._addMatrixParts(parts, [attr]);
        this._addGlobalParts(parts);
        return DiceSR.rollTest({
            event: options === null || options === void 0 ? void 0 : options.event,
            actor: this,
            parts,
            title: Helpers.label(attId),
        });
    }
    rollTwoAttributes([id1, id2], options) {
        const attr1 = this.data.data.attributes[id1];
        const attr2 = this.data.data.attributes[id2];
        const label1 = Helpers.label(id1);
        const label2 = Helpers.label(id2);
        const parts = {};
        parts[attr1.label] = attr1.value;
        parts[attr2.label] = attr2.value;
        this._addMatrixParts(parts, [attr1, attr2]);
        this._addGlobalParts(parts);
        return DiceSR.rollTest({
            event: options === null || options === void 0 ? void 0 : options.event,
            actor: this,
            parts,
            title: `${label1} + ${label2}`,
        });
    }
    rollNaturalRecovery(track, options) {
        let id1 = 'body';
        let id2 = 'willpower';
        let title = 'Natural Recover';
        if (track === 'physical') {
            id2 = 'body';
            title += ' - Physical - 1 Day';
        }
        else {
            title += ' - Stun - 1 Hour';
        }
        let att1 = this.data.data.attributes[id1];
        let att2 = this.data.data.attributes[id2];
        const parts = {};
        parts[att1.label] = att1.value;
        parts[att2.label] = att2.value;
        return DiceSR.rollTest({
            event: options === null || options === void 0 ? void 0 : options.event,
            actor: this,
            parts,
            title: title,
            extended: true,
            after: (roll) => __awaiter(this, void 0, void 0, function* () {
                if (!roll)
                    return;
                let hits = roll.total;
                let current = this.data.data.track[track].value;
                current = Math.max(current - hits, 0);
                let key = `data.track.${track}.value`;
                let u = {};
                u[key] = current;
                yield this.update(u);
            }),
        });
    }
    rollMatrixAttribute(attr, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let matrix_att = this.data.data.matrix[attr];
            let title = game.i18n.localize(CONFIG.SR5.matrixAttributes[attr]);
            const parts = {};
            parts[CONFIG.SR5.matrixAttributes[attr]] = matrix_att.value;
            if (options && options.event && options.event[CONFIG.SR5.kbmod.SPEC])
                parts['SR5.Specialization'] = 2;
            if (Helpers.hasModifiers(options === null || options === void 0 ? void 0 : options.event)) {
                return DiceSR.rollTest({
                    event: options === null || options === void 0 ? void 0 : options.event,
                    actor: this,
                    parts,
                    title: title,
                });
            }
            const attributes = Helpers.filter(this.data.data.attributes, ([, value]) => value.value > 0);
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
            renderTemplate('systems/shadowrun5e/templates/rolls/matrix-roll.html', dialogData).then((dlg) => {
                new Dialog({
                    title: `${title} Test`,
                    content: dlg,
                    buttons: buttons,
                    close: (html) => __awaiter(this, void 0, void 0, function* () {
                        if (cancel)
                            return;
                        const newAtt = Helpers.parseInputToString($(html).find('[name=attribute]').val());
                        let att = undefined;
                        if (newAtt) {
                            att = this.data.data.attributes[newAtt];
                            title += ` + ${game.i18n.localize(CONFIG.SR5.attributes[newAtt])}`;
                        }
                        if (att !== undefined) {
                            if (att.value && att.label)
                                parts[att.label] = att.value;
                            this._addMatrixParts(parts, true);
                            this._addGlobalParts(parts);
                            return DiceSR.rollTest({
                                event: options === null || options === void 0 ? void 0 : options.event,
                                actor: this,
                                parts,
                                title: title,
                            });
                        }
                    }),
                }).render(true);
            });
        });
    }
    promptRoll(options) {
        return DiceSR.rollTest({
            event: options === null || options === void 0 ? void 0 : options.event,
            actor: this,
            dialogOptions: {
                prompt: true,
            },
        });
    }
    rollAttributesTest(rollId, options) {
        const title = game.i18n.localize(CONFIG.SR5.attributeRolls[rollId]);
        const atts = this.data.data.attributes;
        const modifiers = this.data.data.modifiers;
        const parts = {};
        if (rollId === 'composure') {
            parts[atts.charisma.label] = atts.charisma.value;
            parts[atts.willpower.label] = atts.willpower.value;
            if (modifiers.composure)
                parts['SR5.Bonus'] = modifiers.composure;
        }
        else if (rollId === 'judge_intentions') {
            parts[atts.charisma.label] = atts.charisma.value;
            parts[atts.intuition.label] = atts.intuition.value;
            if (modifiers.judge_intentions)
                parts['SR5.Bonus'] = modifiers.judge_intentions;
        }
        else if (rollId === 'lift_carry') {
            parts[atts.strength.label] = atts.strength.value;
            parts[atts.body.label] = atts.body.value;
            if (modifiers.lift_carry)
                parts['SR5.Bonus'] = modifiers.lift_carry;
        }
        else if (rollId === 'memory') {
            parts[atts.willpower.label] = atts.willpower.value;
            parts[atts.logic.label] = atts.logic.value;
            if (modifiers.memory)
                parts['SR5.Bonus'] = modifiers.memory;
        }
        return DiceSR.rollTest({
            event: options === null || options === void 0 ? void 0 : options.event,
            actor: this,
            parts,
            // base: roll,
            title: `${title} Test`,
        });
    }
    rollSkill(skill, options) {
        var _a;
        let att = this.data.data.attributes[skill.attribute];
        let title = skill.label;
        if (options === null || options === void 0 ? void 0 : options.attribute)
            att = this.data.data.attributes[options.attribute];
        let limit = this.data.data.limits[att.limit];
        const parts = {};
        parts[skill.label] = skill.value;
        if ((options === null || options === void 0 ? void 0 : options.event) && Helpers.hasModifiers(options === null || options === void 0 ? void 0 : options.event)) {
            parts[att.label] = att.value;
            if (options.event[CONFIG.SR5.kbmod.SPEC])
                parts['SR5.Specialization'] = 2;
            this._addMatrixParts(parts, att);
            this._addGlobalParts(parts);
            return DiceSR.rollTest({
                event: options.event,
                actor: this,
                parts,
                limit: limit ? limit.value : undefined,
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
        if ((_a = skill.specs) === null || _a === void 0 ? void 0 : _a.length) {
            skill.specs.forEach((s) => (buttons[s] = {
                label: s,
                callback: () => {
                    cancel = false;
                    spec = s;
                },
            }));
        }
        renderTemplate('systems/shadowrun5e/templates/rolls/skill-roll.html', dialogData).then((dlg) => {
            new Dialog({
                title: `${title} Test`,
                content: dlg,
                buttons,
                close: (html) => __awaiter(this, void 0, void 0, function* () {
                    if (cancel)
                        return;
                    const newAtt = Helpers.parseInputToNumber($(html).find('[name="attribute"]').val());
                    const newLimit = Helpers.parseInputToNumber($(html).find('[name="attribute.limit"]').val());
                    att = this.data.data.attributes[newAtt];
                    title += ` + ${game.i18n.localize(CONFIG.SR5.attributes[newAtt])}`;
                    limit = this.data.data.limits[newLimit];
                    parts[att.label] = att.value;
                    if (skill.value === 0)
                        parts['SR5.Defaulting'] = -1;
                    if (spec)
                        parts['SR5.Specialization'] = 2;
                    // let count = (skill.value > 0 ? skill.value : -1) + att.value;
                    this._addMatrixParts(parts, att);
                    this._addGlobalParts(parts);
                    return DiceSR.rollTest({
                        event: options === null || options === void 0 ? void 0 : options.event,
                        actor: this,
                        parts,
                        limit: limit ? limit.value : undefined,
                        title: `${title} Test`,
                    });
                }),
            }).render(true);
        });
    }
    rollKnowledgeSkill(catId, skillId, options) {
        const category = this.data.data.skills.knowledge[catId];
        const skill = duplicate(category.value[skillId]);
        skill.attribute = category.attribute;
        skill.label = skill.name;
        this.rollSkill(skill, options);
    }
    rollLanguageSkill(skillId, options) {
        const skill = duplicate(this.data.data.skills.language.value[skillId]);
        skill.attribute = 'intuition';
        skill.label = skill.name;
        this.rollSkill(skill, options);
    }
    rollActiveSkill(skillId, options) {
        const skill = this.data.data.skills.active[skillId];
        skill.label = game.i18n.localize(CONFIG.SR5.activeSkills[skillId]);
        this.rollSkill(skill, options);
    }
    rollAttribute(attId, options) {
        let title = game.i18n.localize(CONFIG.SR5.attributes[attId]);
        const att = this.data.data.attributes[attId];
        const atts = this.data.data.attributes;
        const parts = {};
        parts[att.label] = att.value;
        let dialogData = {
            attrribute: att,
            attributes: atts,
        };
        let cancel = true;
        renderTemplate('systems/shadowrun5e/templates/rolls/single-attribute.html', dialogData).then((dlg) => {
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
                close: (html) => __awaiter(this, void 0, void 0, function* () {
                    if (cancel)
                        return;
                    let limit = undefined;
                    const att2Id = Helpers.parseInputToString($(html).find('[name=attribute2]').val());
                    let att2 = undefined;
                    if (att2Id !== 'none') {
                        att2 = atts[att2Id];
                        if (att2 === null || att2 === void 0 ? void 0 : att2.label) {
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
                    return DiceSR.rollTest({
                        event: options === null || options === void 0 ? void 0 : options.event,
                        title: `${title} Test`,
                        actor: this,
                        parts,
                        limit: limit,
                    });
                }),
            }).render(true);
        });
    }
    _addMatrixParts(parts, atts) {
        if (Helpers.isMatrix(atts)) {
            const m = this.data.data.matrix;
            if (m.hot_sim)
                parts['SR5.HotSim'] = 2;
            if (m.running_silent)
                parts['SR5.RunningSilent'] = -2;
        }
    }
    _addGlobalParts(parts) {
        if (this.data.data.modifiers.global) {
            parts['SR5.Global'] = this.data.data.modifiers.global;
        }
    }
    static pushTheLimit(roll) {
        return __awaiter(this, void 0, void 0, function* () {
            let title = roll.find('.flavor-text').text();
            let msg = game.messages.get(roll.data().messageId);
            if (msg && msg.data && msg.data.speaker && msg.data.speaker.actor) {
                let actor = game.actors.get(msg.data.speaker.actor);
                return DiceSR.rollTest({
                    event: { shiftKey: true, altKey: true },
                    title: `${title} - Push the Limit`,
                    actor: actor,
                    wounds: false,
                });
            }
        });
    }
    static secondChance(roll) {
        return __awaiter(this, void 0, void 0, function* () {
            let formula = roll.find('.dice-formula').text();
            let hits = parseInt(roll.find('.dice-total').text());
            let title = roll.find('.flavor-text').text();
            let re = /(\d+)d6/;
            let matches = formula.match(re);
            if (matches[1]) {
                let match = matches[1];
                let pool = parseInt(match.replace('d6', ''));
                if (!isNaN(pool) && !isNaN(hits)) {
                    let msg = game.messages.get(roll.data().messageId);
                    if (msg && msg.data && msg.data.speaker && msg.data.speaker.actor) {
                        let actor = game.actors.get(msg.data.speaker.actor);
                        const parts = {};
                        parts['SR5.OriginalDicePool'] = pool;
                        parts['SR5.Successes'] = -hits;
                        return DiceSR.rollTest({
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
        });
    }
}
