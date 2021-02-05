import {ShadowrunRoll, ShadowrunRoller} from '../rolls/ShadowrunRoller';
import { Helpers } from '../helpers';
import { SR5Item } from '../item/SR5Item';
import ActorRollOptions = Shadowrun.ActorRollOptions;
import DefenseRollOptions = Shadowrun.DefenseRollOptions;
import SoakRollOptions = Shadowrun.SoakRollOptions;
import AttributeField = Shadowrun.AttributeField;
import SkillRollOptions = Shadowrun.SkillRollOptions;
import SkillField = Shadowrun.SkillField;
import ModList = Shadowrun.ModList;
import LimitField = Shadowrun.LimitField;
import {SYSTEM_NAME, FLAGS, SR} from '../constants';
import SR5ActorType = Shadowrun.SR5ActorType;
import { PartsList } from '../parts/PartsList';
import { ActorPrepFactory } from './prep/ActorPrepFactory';
import EdgeAttributeField = Shadowrun.EdgeAttributeField;
import VehicleActorData = Shadowrun.VehicleActorData;
import VehicleStat = Shadowrun.VehicleStat;
import {ShadowrunActorDialogs} from "../apps/dialogs/ShadowrunActorDialogs";
import {createRollChatMessage} from "../chat";
import Attributes = Shadowrun.Attributes;
import Limits = Shadowrun.Limits;
import DamageData = Shadowrun.DamageData;
import TrackType = Shadowrun.TrackType;
import OverflowTrackType = Shadowrun.OverflowTrackType;
import {SR5Combat} from "../combat/SR5Combat";
import SpellDefenseOptions = Shadowrun.SpellDefenseOptions;
import NumberOrEmpty = Shadowrun.NumberOrEmpty;
import CharacterActorData = Shadowrun.CharacterActorData;
import SR5VehicleType = Shadowrun.SR5VehicleType;
import VehicleStats = Shadowrun.VehicleStats;
import SR5CharacterType = Shadowrun.SR5CharacterType;
import ActorArmorData = Shadowrun.ActorArmorData;
import ConditionData = Shadowrun.ConditionData;
import SR5SpiritType = Shadowrun.SR5SpiritType;
import SR5SpriteType = Shadowrun.SR5SpriteType;
import SR5CritterType = Shadowrun.SR5CritterType;

export class SR5Actor extends Actor {
    data: SR5ActorType;

    getOverwatchScore() {
        const os = this.getFlag(SYSTEM_NAME, 'overwatchScore');
        return os !== undefined ? os : 0;
    }

    async setOverwatchScore(value) {
        const num = parseInt(value);
        if (!isNaN(num)) {
            return this.setFlag(SYSTEM_NAME, 'overwatchScore', num);
        }
    }

    prepareData() {
        super.prepareData();

        const actorData = this.data as SR5ActorType;
        const prepper = ActorPrepFactory.Create(actorData);
        if (prepper) {
            prepper.prepare();
        }
    }

    getModifier(modifierName: string): NumberOrEmpty {
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

    findVehicleStat(statName?: string): VehicleStat | undefined {
        if (statName === undefined) return;

        const vehicleStats = this.getVehicleStats();
        if (vehicleStats)
            return vehicleStats[statName];
    }

    findLimitFromAttribute(attributeName?: string): LimitField | undefined {
        if (attributeName === undefined) return undefined;
        const attribute = this.findAttribute(attributeName);
        if (!attribute?.limit) return undefined;
        return this.findLimit(attribute.limit);
    }

    findLimit(limitName?: string): LimitField | undefined {
        if (!limitName) return undefined;
        return this.data.data.limits[limitName];
    }

    getWoundModifier(): number {
        if (!("wounds" in this.data.data)) return 0;
        return -1 * this.data.data.wounds.value || 0;
    }

    /** Use edge on actors that have an edge attribute.
     */
    async useEdge(by: number = 1) {
        const edge = this.getEdge();
        if (edge && edge.value === 0) return;
        // NOTE: There used to be a bug which could lower edge usage below zero. Let's quietly ignore and reset. :)
        const usesLeft = edge.uses > 0 ? edge.uses : 0;
        const uses = Math.min(edge.value, usesLeft + by);

        await this.update({'data.attributes.edge.uses': uses});
    }

    getEdge(): EdgeAttributeField {
        return this.data.data.attributes.edge;
    }

    hasArmor(): boolean {
        return "armor" in this.data.data;
    }

    getArmor(): ActorArmorData | undefined {
        if ("armor" in this.data.data)
            return this.data.data.armor;
    }

    getOwnedSR5Item(itemId: string): SR5Item | null {
        return (super.getOwnedItem(itemId) as unknown) as SR5Item;
    }

    getMatrixDevice(): SR5Item | undefined | null {
        if (!("matrix" in this.data.data)) return;
        const matrix = this.data.data.matrix;
        if (matrix.device) return this.getOwnedSR5Item(matrix.device);
    }

    getFullDefenseAttribute(): AttributeField | undefined {
        if (this.isVehicle()) {
            return this.findVehicleStat('pilot');
        } else if (this.isCharacter()) {
            const character = this.asCharacterData();
            if (character) {
                let att = character.data.full_defense_attribute;
                if (!att) att = 'willpower';
                return this.findAttribute(att);
            }
        }
    }

    getEquippedWeapons(): SR5Item[] {
        // @ts-ignore // TODO: How to define SR5Actor.items as SR5Item[]?
        return this.items.filter((item: SR5Item) => item.isEquipped() && item.isWeapon());
    }

    getRecoilCompensation(): number {
        let total = 1; // always get 1
        const strength = this.findAttribute('strength');
        if (strength) {
            total += Math.ceil(strength.value / 3);
        }
        return total;
    }

    getDeviceRating(): number {
        if (!("matrix" in this.data.data)) return 0;
        // @ts-ignore // parseInt does indeed allow number types.
        return parseInt(this.data.data.matrix.rating);
    }

    getAttributes(): Attributes {
        return this.data.data.attributes;
    }

    getAttribute(name: string): AttributeField {
        const attributes = this.getAttributes();
        return attributes[name];
    }

    getLimits(): Limits {
        return this.data.data.limits;
    }

    getLimit(name: string): LimitField {
        const limits = this.getLimits();
        return limits[name];
    }

    /** Return actor type, which can be different kind of actors from 'character' to 'vehicle'.
     *  Please check SR5ActorType for reference.
     */
    getType(): string {
        return this.data.type;
    }

    isCharacter(): boolean {
        return this.getType() === 'character';
    }

    isSpirit(): boolean {
        return this.getType() === 'spirit';
    }

    isSprite(): boolean {
        return this.getType() === 'sprite';
    }

    isVehicle() {
        return this.getType() === 'vehicle';
    }

    isGrunt() {
        if (!("is_npc" in this.data.data) || !("npc" in this.data.data)) return false;

        return this.data.data.is_npc && this.data.data.npc.is_grunt;
    }

    isCritter() {
        return this.getType() === 'critter';
    }

    getVehicleTypeSkill(): SkillField | undefined {
        let skill: SkillField | undefined;
        if (!("vehicleType" in this.data.data)) return;

        switch (this.data.data.vehicleType) {
            case 'air':
                skill = this.findActiveSkill('pilot_aircraft');
                break;
            case 'ground':
                skill = this.findActiveSkill('pilot_ground_craft');
                break;
            case 'water':
                skill = this.findActiveSkill('pilot_water_craft');
                break;
            case 'aerospace':
                skill = this.findActiveSkill('pilot_aerospace');
                break;
            case 'walker':
                skill = this.findActiveSkill('pilot_walker');
                break;
            case 'exotic':
                skill = this.findActiveSkill('pilot_exotic_vehicle');
                break;
            default:
                break;
        }
        return skill;
    }

    getSkill(skillId: string): SkillField | undefined {
        const { skills } = this.data.data;
        if (skills.active.hasOwnProperty(skillId)) {
            return skills.active[skillId];
        }
        if (skills.language.value.hasOwnProperty(skillId)) {
            return skills.language.value[skillId];
        }
        // Knowledge skills are de-normalized into categories (street, hobby, ...)
        for (const categoryKey in skills.knowledge) {
            if (skills.knowledge.hasOwnProperty(categoryKey)) {
                const category = skills.knowledge[categoryKey];
                if (category.value.hasOwnProperty(skillId)) {
                    return category.value[skillId];
                }
            }
        }
    }

    getSkillLabel(skillId: string): string {
        const skill = this.getSkill(skillId);
        if (!skill) {
            return '';
        }

        return skill.label ? skill.label : skill.name ? skill.name : '';
    }

    async addKnowledgeSkill(category, skill?) {
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

        await this.update(updateData);
    }

    removeLanguageSkill(skillId) {
        const value = {};
        value[skillId] = { _delete: true };
        this.update({ 'data.skills.language.value': value });
    }

    async addLanguageSkill(skill) {
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

        await this.update(updateData);
    }

    async removeKnowledgeSkill(skillId, category) {
        const value = {};
        const updateData = {};

        const dataString = `data.skills.knowledge.${category}.value`;
        value[skillId] = { _delete: true };
        updateData[dataString] = value;

        await this.update(updateData);
    }

    async rollFade(options: ActorRollOptions = {}, incoming = -1): Promise<ShadowrunRoll|undefined> {
        const wil = duplicate(this.data.data.attributes.willpower);
        const res = duplicate(this.data.data.attributes.resonance);
        const data = this.data.data;

        const parts = new PartsList<number>();
        parts.addUniquePart(wil.label, wil.value);
        parts.addUniquePart(res.label, res.value);
        if (data.modifiers.fade) parts.addUniquePart('SR5.Bonus', data.modifiers.fade);

        let title = `${game.i18n.localize('SR5.Resist')} ${game.i18n.localize('SR5.Fade')}`;

        const actor = this;
        const roll = await ShadowrunRoller.advancedRoll({
            parts: parts.list,
            actor,
            title: title,
            wounds: false,
            hideRollMessage: true
        });

        if (!roll) return;

        // Reduce damage by soak roll and inform user.
        const incomingDamage = Helpers.createDamageData(incoming, 'stun');
        const damage = Helpers.modifyDamageByHits(incomingDamage, roll.hits, 'SR5.Fade');

        await createRollChatMessage({title, roll, actor, damage});

        return roll;
    }

    async rollDrain(options: ActorRollOptions = {}, incoming = -1): Promise<ShadowrunRoll|undefined> {
        if (!this.isCharacter()) return;

        const data = this.data.data as CharacterActorData;

        const wil = duplicate(data.attributes.willpower);
        const drainAtt = duplicate(data.attributes[data.magic.attribute]);

        const parts = new PartsList<number>();
        parts.addPart(wil.label, wil.value);
        parts.addPart(drainAtt.label, drainAtt.value);
        if (data.modifiers.drain) parts.addUniquePart('SR5.Bonus', data.modifiers.drain);

        let title = `${game.i18n.localize('SR5.Resist')} ${game.i18n.localize('SR5.Drain')}`;
        const actor = this;
        const roll = await ShadowrunRoller.advancedRoll({
            parts: parts.list,
            title,
            actor,
            wounds: false,
            hideRollMessage: true
        });

        if (!roll) return;

        // Reduce damage by soak roll and inform user.
        const incomingDamage = Helpers.createDamageData(incoming, 'stun');
        const damage = Helpers.modifyDamageByHits(incomingDamage, roll.hits, 'SR5.Drain');

        await createRollChatMessage({title, roll, actor, damage});

        return roll;
    }

    rollArmor(options: ActorRollOptions = {}, partsProps: ModList<number> = []) {
        const parts = new PartsList(partsProps);
        this._addArmorParts(parts);
        return ShadowrunRoller.advancedRoll({
            event: options.event,
            actor: this,
            parts: parts.list,
            title: game.i18n.localize('SR5.Armor'),
            wounds: false,
        });
    }

    /** A ranged defense is anything against visible ranged attacks (ranged weapons, indirect spell attacks, ...)
     */
    async rollRangedDefense(options: DefenseRollOptions = {}, partsProps: ModList<number> = []): Promise<ShadowrunRoll | undefined> {
        const {attack} = options;

        const defenseDialog = await ShadowrunActorDialogs.createDefenseDialog(this, options, partsProps);
        const defenseActionData = await defenseDialog.select();

        if (defenseDialog.canceled) return;

        const roll = await ShadowrunRoller.advancedRoll({
            event: options.event,
            actor: this,
            parts: defenseActionData.parts.list,
            title: game.i18n.localize('SR5.DefenseTest'),
            incomingAttack: attack,
            combat: defenseActionData.combat
        });

        if (!roll) return;

        // Reduce initiative after a successful roll, but before attack handling, to allow for the standalone sheet
        // defense action to still reduce the initiative.
        if (defenseActionData.combat.initiative) {
            await this.changeCombatInitiative(defenseActionData.combat.initiative);
        }

        if (!attack) return;

        // Collect defense information.
        let defenderHits = roll.total;
        let attackerHits = attack.hits || 0;
        let netHits = Math.max(attackerHits - defenderHits, 0);

        if (netHits === 0) return;

        const damage = attack.damage;
        damage.mod = PartsList.AddUniquePart(damage.mod, 'SR5.NetHits', netHits);
        damage.value = Helpers.calcTotal(damage);

        const soakRollOptions = {
            event: options.event,
            damage,
        };

        await this.rollSoak(soakRollOptions);
    }

    async rollDirectSpellDefense(spell: SR5Item, options: SpellDefenseOptions): Promise<ShadowrunRoll | undefined> {
        if (!spell.isDirectCombatSpell()) return;

        // Prepare the actual roll.
        options.hideRollMessage = options.hideRollMessage ?? true;
        const attribute = spell.isManaSpell() ?
            SR.defense.spell.direct.mana :
            SR.defense.spell.direct.physical;

        const roll = await this.rollSingleAttribute(attribute, options);

        // Only proceed on successful roles.
        if (!roll || roll.hits <= 0) return;

        // Prepare the resulting damage message.
        const title = spell.isManaSpell() ?
            game.i18n.localize('SR5.SpellDefenseDirectMana') :
            game.i18n.localize('SR5.SpellDefenseDirectPhysical');
        const modificationLabel = 'SR5.SpellDefense';
        const actor = this;
        const damage = Helpers.modifyDamageByHits(options.attack.damage, roll.hits, modificationLabel);

        await createRollChatMessage({title, roll, actor, damage});

        return roll;
    }

    async rollIndirectSpellDefense(spell: SR5Item, options: SpellDefenseOptions): Promise<ShadowrunRoll | undefined> {
        if (!spell.isIndirectCombatSpell()) return;

        const opposedParts = spell.getOpposedTestMod();

        // TODO: indirect LOS spell defense works like a ranged weapon defense, but indirect LOS(A) spell defense
        //       work like grenade attack (no defense, but soak, with the threshold net hits modifying damage.)
        //       Grenades: SR5#181 Combat Spells: SR5#283
        return await this.rollRangedDefense(options, opposedParts.list);
    }

    // TODO: Abstract handling of const damage : ModifiedDamageData
    async rollSoak(options: SoakRollOptions, partsProps: ModList<number> = []): Promise<ShadowrunRoll|undefined> {
        const soakDialog = await ShadowrunActorDialogs.createSoakDialog(this, options, partsProps);
        const soakActionData = await soakDialog.select();

        if (soakDialog.canceled) return;

        // Show the actual Soak Test.
        const title = game.i18n.localize('SR5.SoakTest');
        const actor = this;
        const roll = await ShadowrunRoller.advancedRoll({
            event: options?.event,
            actor,
            parts: soakActionData.parts.list,
            title,
            wounds: false,
            hideRollMessage: true
        });

        if (!roll) return;

        // Reduce damage by damage resist
        const incoming = soakActionData.soak;
        // Avoid cross referencing.
        const damage = Helpers.modifyDamageByHits(incoming, roll.hits, 'SR5.SoakTest');

        await createRollChatMessage({title, roll, actor, damage});

        return roll;
    }

    rollSingleAttribute(attId, options: ActorRollOptions) {
        const attr = duplicate(this.data.data.attributes[attId]);
        const parts = new PartsList<number>();
        parts.addUniquePart(attr.label, attr.value);
        this._addMatrixParts(parts, attr);
        this._addGlobalParts(parts);

        return ShadowrunRoller.advancedRoll({
            actor: this,
            parts: parts.list,
            event: options?.event,
            title: options.title ?? Helpers.label(attId),
            hideRollMessage: options.hideRollMessage
        });
    }

    rollTwoAttributes([id1, id2], options: ActorRollOptions) {
        const attr1 = duplicate(this.data.data.attributes[id1]);
        const attr2 = duplicate(this.data.data.attributes[id2]);
        const label1 = Helpers.label(id1);
        const label2 = Helpers.label(id2);
        const parts = new PartsList<number>();
        parts.addPart(attr1.label, attr1.value);
        parts.addPart(attr2.label, attr2.value);
        this._addMatrixParts(parts, [attr1, attr2]);
        this._addGlobalParts(parts);

        return ShadowrunRoller.advancedRoll({
            actor: this,
            parts: parts.list,
            event: options?.event,
            title: options.title ?? `${label1} + ${label2}`,
            hideRollMessage: options.hideRollMessage
        });
    }

    rollNaturalRecovery(track, options?: ActorRollOptions) {
        if (!this.isCharacter()) return;

        let id1 = 'body';
        let id2 = 'willpower';
        let title = 'Natural Recover';
        if (track === 'physical') {
            id2 = 'body';
            title += ' - Physical - 1 Day';
        } else {
            title += ' - Stun - 1 Hour';
        }
        let att1 = duplicate(this.data.data.attributes[id1]);
        let att2 = duplicate(this.data.data.attributes[id2]);
        const parts = new PartsList<number>();
        parts.addPart(att1.label, att1.value);
        parts.addPart(att2.label, att2.value);

        return ShadowrunRoller.advancedRoll({
            event: options?.event,
            actor: this,
            parts: parts.list,
            title: title,
            extended: true,
            after: async (roll: Roll | undefined) => {
                if (!roll) return;
                let hits = roll.total;
                const data = this.data.data as CharacterActorData;
                let current = data.track[track].value;

                current = Math.max(current - hits, 0);

                let key = `data.track.${track}.value`;

                let u = {};
                u[key] = current;
                await this.update(u);
            },
        });
    }

    async rollMatrixAttribute(attr, options?: ActorRollOptions) {
        if (!("matrix" in this.data.data)) return;

        let matrix_att = duplicate(this.data.data.matrix[attr]);
        let title = game.i18n.localize(CONFIG.SR5.matrixAttributes[attr]);
        const parts = new PartsList<number>();
        parts.addPart(CONFIG.SR5.matrixAttributes[attr], matrix_att.value);

        if (options && options.event && options.event[CONFIG.SR5.kbmod.SPEC]) parts.addUniquePart('SR5.Specialization', 2);
        if (Helpers.hasModifiers(options?.event)) {
            return ShadowrunRoller.advancedRoll({
                event: options?.event,
                actor: this,
                parts: parts.list,
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
        renderTemplate('systems/shadowrun5e/dist/templates/rolls/matrix-roll.html', dialogData).then((dlg) => {
            new Dialog({
                title: `${title} Test`,
                content: dlg,
                buttons: buttons,
                close: async (html) => {
                    if (cancel) return;
                    const newAtt = Helpers.parseInputToString($(html).find('[name=attribute]').val());
                    let att: AttributeField | undefined = undefined;
                    if (newAtt) {
                        att = this.data.data.attributes[newAtt];
                        title += ` + ${game.i18n.localize(CONFIG.SR5.attributes[newAtt])}`;
                    }
                    if (att !== undefined) {
                        if (att.value && att.label) parts.addPart(att.label, att.value);
                        this._addMatrixParts(parts, true);
                        this._addGlobalParts(parts);
                        return ShadowrunRoller.advancedRoll({
                            event: options?.event,
                            actor: this,
                            parts: parts.list,
                            title: title,
                        });
                    }
                },
            }).render(true);
        });
    }

    promptRoll(options?: ActorRollOptions) {
        const rollProps = {
            event: options?.event,
            title: 'Roll',
            parts: [],
            actor: this
        };
        const dialogOptions = {
            pool: true
        }
        return ShadowrunRoller.advancedRoll(rollProps, dialogOptions);
    }

    rollDeviceRating(options?: ActorRollOptions) {
        const title = game.i18n.localize('SR5.Labels.ActorSheet.DeviceRating');
        const parts = new PartsList<number>();
        const rating = this.getDeviceRating();
        // add device rating twice as this is the most common roll
        parts.addPart(title, rating);
        parts.addPart(title, rating);
        this._addGlobalParts(parts);
        return ShadowrunRoller.advancedRoll({
            event: options?.event,
            title,
            parts: parts.list,
            actor: this,
        });
    }

    rollAttributesTest(rollId, options?: ActorRollOptions) {
        const title = game.i18n.localize(CONFIG.SR5.attributeRolls[rollId]);
        const atts = this.data.data.attributes;
        const modifiers = this.data.data.modifiers;
        const parts = new PartsList<number>();
        if (rollId === 'composure') {
            parts.addUniquePart(atts.charisma.label, atts.charisma.value);
            parts.addUniquePart(atts.willpower.label, atts.willpower.value);
            if (modifiers.composure) parts.addUniquePart('SR5.Bonus', modifiers.composure);
        } else if (rollId === 'judge_intentions') {
            parts.addUniquePart(atts.charisma.label, atts.charisma.value);
            parts.addUniquePart(atts.intuition.label, atts.intuition.value);
            if (modifiers.judge_intentions) parts.addUniquePart('SR5.Bonus', modifiers.judge_intentions);
        } else if (rollId === 'lift_carry') {
            parts.addUniquePart(atts.strength.label, atts.strength.value);
            parts.addUniquePart(atts.body.label, atts.body.value);
            if (modifiers.lift_carry) parts.addUniquePart('SR5.Bonus', modifiers.lift_carry);
        } else if (rollId === 'memory') {
            parts.addUniquePart(atts.willpower.label, atts.willpower.value);
            parts.addUniquePart(atts.logic.label, atts.logic.value);
            if (modifiers.memory) parts.addUniquePart('SR5.Bonus', modifiers.memory);
        }

        this._addGlobalParts(parts);
        return ShadowrunRoller.advancedRoll({
            event: options?.event,
            actor: this,
            parts: parts.list,
            title: `${title} Test`,
        });
    }

    async rollSkill(skill: SkillField, options?: SkillRollOptions) {
        let title = game.i18n.localize(skill.label);

        const attributeName = options?.attribute ? options.attribute : skill.attribute;
        const att = this.getAttribute(attributeName);
        let limit = att.limit ? this.getLimit(att.limit) : undefined;

        // Initialize parts with always needed skill data.
        const parts = new PartsList<number>();
        parts.addUniquePart(skill.label, skill.value);
        this._addMatrixParts(parts, [att, skill]);
        this._addGlobalParts(parts);

        // Directly test, without further skill dialog.
        if (options?.event && Helpers.hasModifiers(options?.event)) {
            parts.addUniquePart(att.label, att.value);
            if (options.event[CONFIG.SR5.kbmod.SPEC]) parts.addUniquePart('SR5.Specialization', 2);

            return ShadowrunRoller.advancedRoll({
                event: options.event,
                actor: this,
                parts: parts.list,
                limit,
                title: `${title} ${game.i18n.localize('SR5.Test')}`,
            });
        }

        // First ask user about skill details.
        const skillRollDialogOptions = {
            skill,
            attribute: attributeName
        }

        const skillDialog = await ShadowrunActorDialogs.createSkillDialog(this, skillRollDialogOptions, parts);
        const skillActionData = await skillDialog.select();

        if (skillDialog.canceled) return;

        return await ShadowrunRoller.advancedRoll({
            event: options?.event,
            actor: this,
            parts: skillActionData.parts.list,
            limit: skillActionData.limit,
            title: skillActionData.title,
        });
    }

    async rollDronePerception(options?: ActorRollOptions) {
        if (!this.isVehicle())
            return;

        const actorData = duplicate(this.data.data) as VehicleActorData;
        if (actorData.controlMode === 'autopilot') {
            const parts = new PartsList<number>();

            const pilot = Helpers.calcTotal(actorData.vehicle_stats.pilot);
            // TODO possibly look for autosoft item level?
            const perception = this.findActiveSkill('perception');
            const limit = this.findLimit('sensor');

            if (perception && limit) {
                parts.addPart('SR5.Vehicle.Clearsight', Helpers.calcTotal(perception));
                parts.addPart('SR5.Vehicle.Stats.Pilot', pilot);

                this._addGlobalParts(parts);

                return ShadowrunRoller.advancedRoll({
                    event: options?.event,
                    actor: this,
                    parts: parts.list,
                    limit,
                    title: game.i18n.localize('SR5.Labels.ActorSheet.RollDronePerception'),
                });
            }
        } else {
            await this.rollActiveSkill('perception', options);
        }
    }

    rollPilotVehicle(options?: ActorRollOptions) {
        if (!this.isVehicle()) {
            return undefined;
        }
        const actorData = duplicate(this.data.data) as VehicleActorData;
        if (actorData.controlMode === 'autopilot') {
            const parts = new PartsList<number>();

            const pilot = Helpers.calcTotal(actorData.vehicle_stats.pilot);
            let skill: SkillField | undefined = this.getVehicleTypeSkill();
            const environment = actorData.environment;
            const limit = this.findLimit(environment);

            if (skill && limit) {
                parts.addPart('SR5.Vehicle.Stats.Pilot', pilot);
                // TODO possibly look for autosoft item level?
                parts.addPart('SR5.Vehicle.Maneuvering', Helpers.calcTotal(skill));

                this._addGlobalParts(parts);

                return ShadowrunRoller.advancedRoll({
                    event: options?.event,
                    actor: this,
                    parts: parts.list,
                    limit,
                    title: game.i18n.localize('SR5.Labels.ActorSheet.RollPilotVehicleTest'),
                });
            }
        } else {
            this.rollActiveSkill('perception', options);
        }
    }

    rollDroneInfiltration(options?: ActorRollOptions) {
        if (!this.isVehicle()) {
            return undefined;
        }
        const actorData = duplicate(this.data.data) as VehicleActorData;
        if (actorData.controlMode === 'autopilot') {
            const parts = new PartsList<number>();

            const pilot = Helpers.calcTotal(actorData.vehicle_stats.pilot);
            // TODO possibly look for autosoft item level?
            const sneaking = this.findActiveSkill('sneaking');
            const limit = this.findLimit('sensor');

            if (sneaking && limit) {
                parts.addPart('SR5.Vehicle.Stealth', Helpers.calcTotal(sneaking));
                parts.addPart('SR5.Vehicle.Stats.Pilot', pilot);

                this._addGlobalParts(parts);

                return ShadowrunRoller.advancedRoll({
                    event: options?.event,
                    actor: this,
                    parts: parts.list,
                    limit,
                    title: game.i18n.localize('SR5.Labels.ActorSheet.RollDroneInfiltration'),
                });
            }
        } else {
            this.rollActiveSkill('sneaking', options);
        }
    }

    rollKnowledgeSkill(catId: string, skillId: string, options?: SkillRollOptions) {
        const category = duplicate(this.data.data.skills.knowledge[catId]);
        const skill = duplicate(category.value[skillId]);
        skill.attribute = category.attribute;
        skill.label = skill.name;
        return this.rollSkill(skill, options);
    }

    rollLanguageSkill(skillId: string, options?: SkillRollOptions) {
        const skill = duplicate(this.data.data.skills.language.value[skillId]);
        skill.attribute = 'intuition';
        skill.label = skill.name;
        return this.rollSkill(skill, options);
    }

    rollActiveSkill(skillId: string, options?: SkillRollOptions) {
        const skill = duplicate(this.data.data.skills.active[skillId]);
        return this.rollSkill(skill, options);
    }

    rollAttribute(attId, options?: ActorRollOptions) {
        let title = game.i18n.localize(CONFIG.SR5.attributes[attId]);
        const att = duplicate(this.data.data.attributes[attId]);
        const atts = duplicate(this.data.data.attributes);
        const parts = new PartsList<number>();
        parts.addUniquePart(att.label, att.value);
        let dialogData = {
            attribute: att,
            attributes: atts,
        };
        let cancel = true;
        renderTemplate('systems/shadowrun5e/dist/templates/rolls/single-attribute.html', dialogData).then((dlg) => {
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

                    const att2Id: string = Helpers.parseInputToString($(html).find('[name=attribute2]').val());
                    let att2: AttributeField | undefined = undefined;
                    if (att2Id !== 'none') {
                        att2 = atts[att2Id];
                        if (att2?.label) {
                            parts.addUniquePart(att2.label, att2.value);
                            const att2IdLabel = game.i18n.localize(CONFIG.SR5.attributes[att2Id]);
                            title += ` + ${att2IdLabel}`;
                        }
                    }
                    if (att2Id === 'default') {
                        parts.addUniquePart('SR5.Defaulting', -1);
                    }
                    this._addMatrixParts(parts, [att, att2]);
                    this._addGlobalParts(parts);
                    return ShadowrunRoller.advancedRoll({
                        event: options?.event,
                        title: `${title} Test`,
                        actor: this,
                        parts: parts.list,
                    });
                },
            }).render(true);
        });
    }

    _addMatrixParts(parts: PartsList<number>, atts) {
        if (Helpers.isMatrix(atts)) {
            if (!("matrix" in this.data.data)) return;

            const matrix = this.data.data.matrix;
            if (matrix.hot_sim) parts.addUniquePart('SR5.HotSim', 2);
            if (matrix.running_silent) parts.addUniquePart('SR5.RunningSilent', -2);
        }
    }
    _addGlobalParts(parts: PartsList<number>) {
        if (this.data.data.modifiers.global) {
            parts.addUniquePart('SR5.Global', this.data.data.modifiers.global);
        }
    }

    _addDefenseParts(parts: PartsList<number>) {
        if (this.isVehicle()) {
            const pilot = this.findVehicleStat('pilot');
            if (pilot) {
                parts.addUniquePart(pilot.label, Helpers.calcTotal(pilot));
            }
            const skill = this.getVehicleTypeSkill();
            if (skill) {
                parts.addUniquePart('SR5.Vehicle.Maneuvering', Helpers.calcTotal(skill));
            }
        } else {
            const reaction = this.findAttribute('reaction');
            const intuition = this.findAttribute('intuition');

            if (reaction) {
                parts.addUniquePart(reaction.label || 'SR5.Reaction', reaction.value);
            }
            if (intuition) {
                parts.addUniquePart(intuition.label || 'SR5.Intuition', intuition.value);
            }
        }

        const mod = this.getModifier('defense');
        if (mod) {
            parts.addUniquePart('SR5.Bonus', mod);
        }
    }

    _addArmorParts(parts: PartsList<number>) {
        const armor = this.getArmor();
        if (armor) {
            parts.addUniquePart(armor.label || 'SR5.Armor', armor.base);
            for (let part of armor.mod) {
                parts.addUniquePart(part.name, part.value);
            }
        }
    }

    _addSoakParts(parts: PartsList<number>) {
        const body = this.findAttribute('body');
        if (body) {
            parts.addUniquePart(body.label || 'SR5.Body', body.value);
        }
        const mod = this.getModifier('soak');
        if (mod) {
            parts.addUniquePart('SR5.Bonus', mod);
        }
        this._addArmorParts(parts);
    }

    static async pushTheLimit(li) {
        let msg: ChatMessage = game.messages.get(li.data().messageId);

        if (msg.getFlag(SYSTEM_NAME, FLAGS.MessageCustomRoll)) {
            let actor = (msg.user.character as unknown) as SR5Actor;
            if (!actor) {
                const tokens = Helpers.getControlledTokens();
                if (tokens.length > 0) {
                    for (let token of tokens) {
                        if (token.actor.owner) {
                            actor = token.actor as SR5Actor;
                            break;
                        }
                    }
                }
            }
            if (actor) {
                const parts = new PartsList<number>();
                parts.addUniquePart('SR5.PushTheLimit', actor.getEdge().value);
                ShadowrunRoller.basicRoll({
                    title: ` - ${game.i18n.localize('SR5.PushTheLimit')}`,
                    parts: parts.list,
                    actor: actor,
                }).then(() => {
                    actor.update({
                        'data.attributes.edge.uses': actor.getEdge().uses - 1,
                    });
                });
            } else {
                // @ts-ignore
                ui.notifications.warn(game.i18n.localize('SR5.SelectTokenMessage'));
            }
        }
    }

    static async secondChance(li) {
        let msg: ChatMessage = game.messages.get(li.data().messageId);
        // @ts-ignore
        let roll: Roll = JSON.parse(msg.data?.roll);
        let formula = roll.formula;
        let hits = roll.total;
        let re = /(\d+)d6/;
        let matches = formula.match(re);
        if (matches && matches[1]) {
            let match = matches[1];
            let pool = parseInt(match.replace('d6', ''));
            if (!isNaN(pool) && !isNaN(hits)) {
                let actor = (msg.user.character as unknown) as SR5Actor;
                if (!actor) {
                    const tokens = Helpers.getControlledTokens();
                    if (tokens.length > 0) {
                        for (let token of tokens) {
                            if (token.actor.owner) {
                                actor = token.actor as SR5Actor;
                                break;
                            }
                        }
                    }
                }
                if (actor) {
                    const parts = new PartsList<number>();
                    parts.addUniquePart('SR5.OriginalDicePool', pool);
                    parts.addUniquePart('SR5.Successes', -hits);

                    return ShadowrunRoller.basicRoll({
                        title: ` - Second Chance`,
                        parts: parts.list,
                        actor: actor,
                    }).then(() => {
                        actor.update({
                            'data.attributes.edge.uses': actor.getEdge().uses - 1,
                        });
                    });
                } else {
                    // @ts-ignore
                    ui.notifications.warn(game.i18n.localize('SR5.SelectTokenMessage'));
                }
            }
        }
    }

    /**
     * Override setFlag to remove the 'SR5.' from keys in modlists, otherwise it handles them as embedded keys
     * @param scope
     * @param key
     * @param value
     */
    setFlag(scope: string, key: string, value: any): Promise<any> {
        const newValue = Helpers.onSetFlag(value);
        return super.setFlag(scope, key, newValue);
    }

    /**
     * Override getFlag to add back the 'SR5.' keys correctly to be handled
     * @param scope
     * @param key
     */
    getFlag(scope: string, key: string): any {
        const data = super.getFlag(scope, key);
        return Helpers.onGetFlag(data);
    }

    /** Return either the linked token or the token of the synthetic actor.
     *
     * @retrun Will return null should no token have been placed on scene.
     */
    getToken(): Token {
        // Linked actors can only have one token, which isn't stored within actor data...
        if (this._isLinkedToToken() && this.hasToken()) {
            const linked = true;
            const tokens = this.getActiveTokens(linked);
            // This assumes for a token to exist and should fail if not.
            return tokens[0];
        }

        // Unlinked actors can have multiple active token but each have theirs directly attached...
        return this.token;
    }

    /**
     * There is no need for a token to placed. The prototype token is enough.
     */
    _isLinkedToToken(): boolean {
        //@ts-ignore
        // If an actor is linked, all it's copies also contain this linked status, even if they're not.
        return this.data.token.actorLink && !this.token;
    }

    hasToken(): boolean {
        return this.getActiveTokens().length > 0;
    }

    hasActivePlayerOwner(): boolean {
        const players = this.getActivePlayerOwners();
        return players.length > 0;
    }

    getActivePlayer(): User|null {
        //@ts-ignore
        if (!this.hasPlayerOwner) {
            return null;
        }

        for (const user of game.users.entities) {
            if (!user.active || user.isGM) {
                continue;
            }
            if (this.id === user.character.id) {
                return user;
            }
        }

        return null;
    }

    getActivePlayerOwners(): User[] {
        //@ts-ignore
        const users = this.getUsers('OWNER');
        return users.filter(user => user.active);
    }

    /** Apply all types of damage to the actor.
     *
     * @param damage
     * @param changeDamageForActor can be changed to directly apply damage without further changes due to armor and more.
     */
    async applyDamage(damage: DamageData, changeDamageForActor: boolean = true) {
        if (damage.value <= 0) return;

        // NOTE: Execution order is important here!

        if (changeDamageForActor) {
            damage = this._applyDamageTypeChangeForActor(damage);
        }

        // Apply damage and resulting overflow to the according track.
        // The amount and type damage can value in the process.
        if (damage.type.value === 'matrix') {
            // TODO: Biofeedback damage model already integrated?
            damage = await this._addMatrixDamage(damage);
        }

        if (damage.type.value === 'stun') {
            damage = await this._addStunDamage(damage);
        }

        if (damage.type.value === 'physical') {
            await this._addPhysicalDamage(damage);
        }

        // NOTE: Currently each damage type updates once. Should this cause issues for long latency, collect
        //       and sum each damage type and update here globally.
        // NOTE: For stuff like healing the last wound by magic, it might also be interesting to store and give
        //       an overview of each damage/wound applied to select from.
        // await this.update({'data.track': this.data.data.track});

        // TODO: Handle changes in actor status (death and such)
    }

    __addDamageToTrackValue(damage: DamageData, track: TrackType|OverflowTrackType|ConditionData): TrackType|OverflowTrackType|ConditionData {
        if (damage.value === 0) return track;
        if (track.value === track.max) return track;

        //  Avoid cross referencing.
        track = duplicate(track);

        track.value += damage.value;
        if (track.value > track.max) {
            // dev error, not really meant to be ever seen by users. Therefore no localization.
            console.error("Damage did overflow the track, which shouldn't happen at this stage. Damage has been set to max. Please use applyDamage.")
            track.value = track.max;
        }

        return track;
    }

    async _addDamageToDeviceTrack(damage: DamageData, device: SR5Item) {
        if (!device) return;

        let condition = device.getCondition();
        if (!condition) return damage;

        if (damage.value === 0) return;
        if (condition.value === condition.max) return;

        condition = this.__addDamageToTrackValue(damage, condition);

        const data = {['data.technology.condition_monitor']: condition};
        await device.update(data);
    }

    async _addDamageToTrack(damage: DamageData, track: TrackType|OverflowTrackType|ConditionData) {
        if (damage.value === 0) return;
        if (track.value === track.max) return;

        track = this.__addDamageToTrackValue(damage, track);
        // //  Avoid cross referencing.
        // track = duplicate(track);
        //
        // track.value += damage.value;
        // if (track.value > track.max) {
        //     // dev error, not really meant to be ever seen by users. Therefore no localization.
        //     console.error("Damage did overflow the track, which shouldn't happen at this stage. Damage has been set to max. Please use applyDamage.")
        //     track.value = track.max;
        // }

        const data = {[`data.track.${damage.type.value}`]: track};
        await this.update(data);
    }

    async _addDamageToOverflow(damage: DamageData, track: OverflowTrackType) {
        if (damage.value === 0) return;
        if (track.overflow.value === track.overflow.max) return;

        //  Avoid cross referencing.
        const overflow = duplicate(track.overflow);

        // Don't over apply damage to the track overflow.
        overflow.value += damage.value;
        overflow.value = Math.min(overflow.value, overflow.max);

        const data = {[`data.track.${damage.type.value}.overflow`]: overflow};
        await this.update(data);
    }

    /** Apply damage to the stun track and get overflow damage for the physical track.
     */
    async _addStunDamage(damage: DamageData): Promise<DamageData> {
        if (damage.type.value !== 'stun') return damage;

        const track = this.getStunTrack();
        if (!track)
            return damage;

        const {overflow, rest} = this._calcDamageOverflow(damage, track);

        // Only change damage type when needed, in order to avoid confusion of callers.
        if (overflow.value > 0) {
            // Apply Stun overflow damage to physical track according to: SR5E#170
            overflow.value = Math.floor(overflow.value / 2);
            overflow.type.value = 'physical';
        }

        await this._addDamageToTrack(rest, track);
        return overflow;
    }

    async _addPhysicalDamage(damage: DamageData) {
        if (damage.type.value !== 'physical') return damage;

        const track = this.getPhysicalTrack();
        if (!track)
            return damage;

        const {overflow, rest} = this._calcDamageOverflow(damage, track);

        await this._addDamageToTrack(rest, track);
        await this._addDamageToOverflow(overflow, track);
    }

    /** Adding damage to a device track instead of an actors track, as they contain their own track within their data.
     */
    async _addMatrixDamage(damage: DamageData): Promise<DamageData> {
        if (damage.type.value !== 'matrix') return damage;

        const device = this.getMatrixDevice();
        if (!device) return damage;

        const track = this.getMatrixTrack();
        // Actor might not have a commlink/cyberdeck equipped.
        if (!track) return damage;

        const {overflow, rest} = this._calcDamageOverflow(damage, track);

        await this._addDamageToDeviceTrack(rest, device);

        // Return overflow for consistency, yet nothing will take overflowing matrix damage.
        return overflow;
    }

    /** Calculate damage overflow only based on max and current track values.
     */
    _calcDamageOverflow(damage: DamageData, track: TrackType|ConditionData): {overflow: DamageData, rest: DamageData} {
        const freeTrackDamage = track.max - track.value;
        const overflowDamage = damage.value > freeTrackDamage ?
            damage.value - freeTrackDamage :
            0;
        const restDamage = damage.value - overflowDamage;

        //  Avoid cross referencing.
        const overflow = duplicate(damage);
        const rest = duplicate(damage);

        overflow.value = overflowDamage;
        rest.value = restDamage;

        return {overflow, rest};
    }

    getStunTrack(): TrackType | undefined {
        if ("track" in this.data.data && "stun" in this.data.data.track)
            return this.data.data.track.stun;
    }

    getPhysicalTrack(): OverflowTrackType | undefined {
        if ("track" in this.data.data)
            return this.data.data.track.physical;
    }

    getMatrixTrack(): ConditionData|undefined {
        const device = this.getMatrixDevice();
        if (!device) return undefined;

        return device.getCondition();
    }

    /** Apply all damage type changes that need to happen for this Actor
     *
     * This doesn't include armor for simplicity reasons.
     */
    _applyDamageTypeChangeForActor(damage: DamageData): DamageData {
        damage = this._applyDamageTypeChangeForGrunt(damage);

        return damage;
    }

    _applyDamageTypeChangeForGrunt(damage: DamageData): DamageData {
        if (!this.isGrunt()) return damage;

        if (damage.type.value === 'stun') {
            // Avoid cross referencing.
            damage = duplicate(damage);

            damage.type.value = 'physical';
        }

        return damage;
    }

    /**
     *
     * @param damage
     */
    _applyDamageTypeChangeForArmor(damage: DamageData): DamageData {
        // TODO: Damage modification should only really apply to characters, but double check ;)
        if (!this.isCharacter()) return damage;

        if (damage.type.value === 'physical') {
            const modifiedArmor = this.getModifiedArmor(damage);
            if (modifiedArmor) {
                const armorWillChangeDamageType = modifiedArmor.value > damage.value;

                if (armorWillChangeDamageType) {
                    // Avoid cross referencing.
                    damage = duplicate(damage);

                    damage.type.value = 'stun';
                }
            }
        }

        return damage;
    }

    getModifiedArmor(damage: DamageData): ActorArmorData|undefined {
        if (!damage.ap?.value) {
            return this.getArmor();
        }

        const modified = duplicate(this.getArmor());
        if (modified) {
            modified.mod = PartsList.AddUniquePart(modified.mod, 'SR5.DV', damage.ap.value);
            modified.value = Helpers.calcTotal(modified, {min: 0});
        }

        return modified;
    }

    /** Reduce the initiative of the actor in the currently open / selected combat.
     * Should a tokens actor be in multiple combats it will also only affect the currently open combat,
     * since that is what's set in game.combat
     *
     * TODO: There is an issue with linked actors that have multiple tokens placed, with each in different combats.
     *       The defense test needs to be done using the correct token, not just by the actor (from the sidebar).
     *       One could argue this to be correct behavior, just confusing with normal linked actor / token usage.
     */
    async changeCombatInitiative(modifier: number) {
        // No change needed for nothing to change.
        if (modifier === 0) return;

        const combat: SR5Combat = game.combat as SR5Combat;
        const combatant = combat.getActorCombatant(this);

        // Token might not be part of active combat.
        if (!combatant) return;

        await combat.adjustInitiative(combatant, modifier);
    }

    hasDamageTracks(): boolean {
        return "track" in this.data.data;
    }

    asVehicleData(): SR5VehicleType | undefined {
        if (this.isVehicle())
            return this.data as SR5VehicleType;
    }

    asCharacterData(): SR5CharacterType | undefined {
        if (this.isCharacter())
            return this.data as SR5CharacterType;
    }

    asSpiritData(): SR5SpiritType | undefined {
        if (this.isSpirit()) {
            return this.data as SR5SpiritType;
        }
    }

    asSpriteData(): SR5SpriteType | undefined {
        if (this.isSprite()) {
            return this.data as SR5SpriteType;
        }
    }

    asCritterData(): SR5CritterType | undefined {
        if (this.isCritter()){
            return this.data as SR5CritterType;
        }
    }

    getVehicleStats(): VehicleStats | undefined {
        if (this.isVehicle() && "vehicle_stats" in this.data.data) {
            return this.data.data.vehicle_stats;
        }
    }
}
