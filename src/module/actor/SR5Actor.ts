import {Helpers} from '../helpers';
import {SR5Item} from '../item/SR5Item';
import {FLAGS, SKILL_DEFAULT_NAME, SR, SYSTEM_NAME} from '../constants';
import {PartsList} from '../parts/PartsList';
import {SR5Combat} from "../combat/SR5Combat";
import {DataDefaults} from '../data/DataDefaults';
import {SkillFlow} from "./flows/SkillFlow";
import {SR5} from "../config";
import {CharacterPrep} from "./prep/CharacterPrep";
import {SR5ItemDataWrapper} from "../data/SR5ItemDataWrapper";
import {CritterPrep} from "./prep/CritterPrep";
import {SpiritPrep} from "./prep/SpiritPrep";
import {SpritePrep} from "./prep/SpritePrep";
import {VehiclePrep} from "./prep/VehiclePrep";
import {DocumentSituationModifiers} from "../rules/DocumentSituationModifiers";
import {SkillRules} from "../rules/SkillRules";
import {ICPrep} from "./prep/ICPrep";
import {
    EffectChangeData
} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/effectChangeData";
import {InventoryFlow} from "./flows/InventoryFlow";
import {ModifierFlow} from "./flows/ModifierFlow";
import {TestCreator} from "../tests/TestCreator";
import {AttributeOnlyTest} from "../tests/AttributeOnlyTest";
import {RecoveryRules} from "../rules/RecoveryRules";
import { CombatRules } from '../rules/CombatRules';
import { allApplicableDocumentEffects, allApplicableItemsEffects } from '../effects';
import { ConditionRules, DefeatedStatus } from '../rules/ConditionRules';
import { Translation } from '../utils/strings';
import { TeamworkMessageData } from './flows/TeamworkFlow';
import { SR5ActiveEffect } from '../effect/SR5ActiveEffect';
import { MatrixNetworkFlow } from '../item/flows/MatrixNetworkFlow';
import { ActorMarksFlow } from './flows/ActorMarksFlow';
import { SetMarksOptions } from '../flows/MarksStorageFlow';
import { RollDataOptions } from '../item/Types';
import { ActorRollDataFlow } from './flows/ActorRollDataFlow';
import { DamageApplicationFlow } from './flows/DamageApplicationFlow';
import { SuccessTest } from '../tests/SuccessTest';
import { MatrixFlow } from '../flows/MatrixFlow';


/**
 * The general Shadowrun actor implementation, which currently handles all actor types.
 *
 * To easily access ActorData without any typing issues us the SR5Actor.asCritter helpers.
 * They are set up in a way that will handle both error management and type narrowing.
 * Example:
 * <pre><code>
 *     const actor = game.actors.get('randomId');
 *     const critter = actor.asCritter();
 *     if (!critter) return;
 *     // critter.type === 'critter'
 *     // critter.system as CritterData
 * </code></pre>
 *
 */
export class SR5Actor extends Actor {
    // This is the default inventory name and label for when no other inventory has been created.
    defaultInventory: Shadowrun.InventoryData = {
        name: 'Carried',
        label: 'SR5.Labels.Inventory.Carried',
        itemIds: []
    }
    // This is a dummy inventory
    allInventories: Shadowrun.InventoryData = {
        name: 'All',
        label: 'SR5.Labels.Inventory.All',
        itemIds: [],
        showAll: true
    }

    // Allow users to access to tests creation.
    tests: typeof TestCreator = TestCreator;

    // Add v10 type helper
    system: Shadowrun.ShadowrunActorDataData; // TODO: foundry-vtt-types v10

    // Holds all operations related to this actors inventory.
    inventory: InventoryFlow;
    // Holds all operations related to fetching an actors modifiers.
    modifiers: ModifierFlow;

    // TODO: foundry-vtt-types v10. Allows for {system: ...} to be given without type error
    constructor(data, context?) {
        super(data, context);

        this.inventory = new InventoryFlow(this);
        this.modifiers = new ModifierFlow(this);
    }

    getOverwatchScore() {
        const os = this.getFlag(SYSTEM_NAME, 'overwatchScore');
        return os !== undefined ? os : 0;
    }

    async setOverwatchScore(value) {
        const num = parseInt(value);
        if (!isNaN(num)) {
            return await this.setFlag(SYSTEM_NAME, 'overwatchScore', num);
        }
    }

    /**
     * General data preparation order.
     * Check base, embeddedEntities and derived methods (see super.prepareData implementation for order)
     * Only implement data preparation here that doesn't fall into the other three categories.
     */
    override prepareData() {
        super.prepareData();
    }

    /**
     *  Prepare base data. Be careful that this ONLY included data not in need for item access.
     *  Check Actor and ClientDocumentMixin.prepareData for order of data prep.
     *
     *  Shadowrun data preparation is separate from the actor entity see the different <>Prep classes like
     *  CharacterPrep
     */
    override prepareBaseData() {
        super.prepareBaseData();

        switch (this.type) {
            case 'character':
                //@ts-expect-error // TODO: foundry-vtt-types v10
                CharacterPrep.prepareBaseData(this.system);
                break;
            case "critter":
                //@ts-expect-error // TODO: foundry-vtt-types v10
                CritterPrep.prepareBaseData(this.system);
                break;
            case "spirit":
                //@ts-expect-error // TODO: foundry-vtt-types v10
                SpiritPrep.prepareBaseData(this.system);
                break;
            case "sprite":
                //@ts-expect-error // TODO: foundry-vtt-types v10
                SpritePrep.prepareBaseData(this.system);
                break;
            case "vehicle":
                //@ts-expect-error // TODO: foundry-vtt-types v10
                VehiclePrep.prepareBaseData(this.system);
                break;
            case "ic":
                //@ts-expect-error // TODO: foundry-vtt-types v10
                ICPrep.prepareBaseData(this.system);
                break;
        }
    }

    /**
     * prepare embedded entities. Check ClientDocumentMixin.prepareData for order of data prep.
     */
    override prepareEmbeddedDocuments() {
        // This will apply ActiveEffects, which is okay for modify (custom) effects, however add/multiply on .value will be
        // overwritten.
        super.prepareEmbeddedDocuments();

        // NOTE: Hello there! Should you ever be in need of calling the grand parents methods, maybe to avoid applyActiveEffects,
        //       look at this beautiful piece of software and shiver in it's glory.
        // ClientDocumentMixin(class {}).prototype.prepareEmbeddedDocuments.apply(this);
    }

    /**
     * Should some ActiveEffects need to be excluded from the general application, do so here.
     * @override
     */
    override applyActiveEffects() {
        // Shadowrun uses prepareDerivedData to calculate lots of things that don't exist on the data model in full.
        // Errors during change application will stop that process and cause a broken sheet.
        try {
            super.applyActiveEffects();
        } catch (error) {
            console.error(`Shadowrun5e | Some effect changes could not be applied and might cause issues. Check effects of actor (${this.name}) / id (${this.id})`);
            console.error(error);
            ui.notifications?.error(`See browser console (F12): Some effect changes could not be applied and might cause issues. Check effects of actor (${this.name}) / id (${this.id})`);
        }
    }

    /**
     * Get all ActiveEffects applicable to this actor.
     * 
     * The system uses a custom method of determining what ActiveEffect is applicable that doesn't 
     * use default FoundryVTT allApplicableEffect.
     * 
     * The system has additional support for:
     * - taking actor effects from items (apply-To actor)
     * - having effects apply that are part of a targeted action against this actor (apply-To targeted_actor)
     * 
     * NOTE: FoundryVTT applyActiveEffects will check for disabled effects.
     */
    //@ts-expect-error TODO: foundry-vtt-types v10
    override *allApplicableEffects() {
        for (const effect of allApplicableDocumentEffects(this, {applyTo: ['actor', 'targeted_actor']})) {
            yield effect;
        }

        for (const effect of allApplicableItemsEffects(this, {applyTo: ['actor']})) {
            yield effect;
        }
    }

    /**
     * All temporary ActiveEffects that should display on the Token
     * 
     * The shadowrun5e system uses a custom application method with different effect application targets. Some of
     * these effects exist on the actor or one of it's items, however still shouldn't show in their token.
     * 
     * While default Foundry relies on allApplicableEffects, as it only knows apply-to actor effects, we have to 
     * return all effects that are temporary instead, to include none-actor apply-to effects.
     * 
     * NOTE: Foundry also shows disabled effects by default. We behave the same.
     */
    // @ts-expect-error NOTE: I don't fully understand the typing here.
    override get temporaryEffects() {
        // @ts-expect-error // TODO: foundry-vtt-types v10
        const showEffectIcon = (effect: SR5ActiveEffect) => !effect.disabled && !effect.isSuppressed && effect.isTemporary && effect.appliesToLocalActor;

        // Collect actor effects.
        let effects = this.effects.filter(showEffectIcon);

        // Collect item effects.
        for (const item of this.items) {
            effects = effects.concat(item.effects.filter(showEffectIcon));

            // Collect nested item effects.
            for (const nestedItem of item.items) {
                effects = effects.concat(nestedItem.effects.filter(showEffectIcon));
            }
        }

        return effects;
    }

    /**
     * prepare embedded entities. Check ClientDocumentMixin.prepareData for order of data prep.
     *
     * At the moment general actor data preparation has been moved to derived data preparation, due it's dependence
     * on prepareEmbeddedEntities and prepareEmbeddedItems for items modifying attribute values and more.
     */
    override prepareDerivedData() {
        super.prepareDerivedData();

        // General actor data preparation has been moved to derived data, as it depends on prepared item data.
        const itemDataWrappers = this.items.map((item) => new SR5ItemDataWrapper(item as unknown as Shadowrun.ShadowrunItemData));
        switch (this.type) {
            case 'character':
                //@ts-expect-error // TODO: foundry-vtt-types v10
                CharacterPrep.prepareDerivedData(this.system, itemDataWrappers);
                break;
            case "critter":
                //@ts-expect-error // TODO: foundry-vtt-types v10
                CritterPrep.prepareDerivedData(this.system, itemDataWrappers);
                break;
            case "spirit":
                //@ts-expect-error // TODO: foundry-vtt-types v10
                SpiritPrep.prepareDerivedData(this.system, itemDataWrappers);
                break;
            case "sprite":
                //@ts-expect-error // TODO: foundry-vtt-types v10
                SpritePrep.prepareDerivedData(this.system, itemDataWrappers);
                break;
            case "vehicle":
                //@ts-expect-error // TODO: foundry-vtt-types v10
                VehiclePrep.prepareDerivedData(this.system, itemDataWrappers);
                break;
            case "ic":
                //@ts-expect-error // TODO: foundry-vtt-types v10
                ICPrep.prepareDerivedData(this.system, itemDataWrappers);
                break;
        }
    }

    /**
     * NOTE: This method is unused at the moment, keep it for future inspiration.
     */
    applyOverrideActiveEffects() {
        const changes = this.effects.reduce((changes: EffectChangeData[], effect) => {
            if (effect.data.disabled) return changes;

            // include changes partially matching given keys.
            return changes.concat(effect.data.changes
                .filter(change => change.mode === CONST.ACTIVE_EFFECT_MODES.OVERRIDE)
                .map(change => {
                    // @ts-expect-error // Foundry internal code, duplicate doesn't like EffectChangeData
                    change = foundry.utils.duplicate(change);
                    // @ts-expect-error We inject effect for ease of use, using the same method as FoundryVTT core...
                    change.effect = effect;
                    change.priority = change.priority ?? (change.mode * 10);

                    return change;
                }));
        }, []);
        // Sort changes according to priority, in case it's ever needed.
        // @ts-expect-error // a / b can't be null here...
        changes.sort((a, b) => a.priority - b.priority);

        for (const change of changes) {
            // @ts-expect-error We inject effect for ease of use, using the same method as FoundryVTT core...
            change.effect.apply(this, change);
        }
    }

    /**
     * A helper method to only apply a subset of keys instead of all.
     * @param partialKeys Can either be complete keys or partial keys
     */
    _applySomeActiveEffects(partialKeys: string[]) {
        const changes = this._reduceEffectChangesByKeys(partialKeys);
        this._applyActiveEffectChanges(changes);
    }


    /**
     * A helper method to apply a active effect changes collection (which might come from multiple active effects)
     * @param changes
     */
    _applyActiveEffectChanges(changes: EffectChangeData[]) {
        const overrides = {};

        for (const change of changes) {
            // @ts-expect-error We inject effect for ease of use, using the same method as FoundryVTT core...
            const result = change.effect.apply(this, change);
            if (result !== null) overrides[change.key] = result;
        }

        this.overrides = {...this.overrides, ...foundry.utils.expandObject(overrides)};
    }

    /**
     * Reduce all changes across multiple active effects that match the given set of partial keys
     * @param partialKeys Can either be complete keys or partial keys
     */
    _reduceEffectChangesByKeys(partialKeys: string[]): EffectChangeData[] {
        // Collect only those changes matching the given partial keys.
        const changes = this.effects.reduce((changes: EffectChangeData[], effect) => {
            if (effect.data.disabled) return changes;

            // include changes partially matching given keys.
            return changes.concat(effect.data.changes
                .filter(change => partialKeys.some(partialKey => change.key.includes(partialKey)))
                .map(change => {
                    // @ts-expect-error // Foundry internal code, duplicate doesn't like EffectChangeData
                    change = foundry.utils.duplicate(change);
                    // @ts-expect-error We inject effect for ease of use, using the same method as FoundryVTT core...
                    change.effect = effect;
                    change.priority = change.priority ?? (change.mode * 10);

                    return change;
                }));
        }, []);
        // Sort changes according to priority, in case it's ever needed.
        // @ts-expect-error // TODO: foundry-vtt-types v10
        changes.sort((a, b) => a.priority - b.priority);

        return changes;
    }

    /**
     * Some actors have skills, some don't. While others don't have skills but derive skill values from their ratings.
     */
    findActiveSkill(skillName?: string): Shadowrun.SkillField | undefined {
        // Check for faulty to catch empty names as well as missing parameters.
        if (!skillName) return;

        // Handle legacy skills (name is id)
        const skills = this.getActiveSkills();
        const skill = skills[skillName];
        if (skill) return skill;

        // Handle custom skills (name is not id)
        return Object.values(skills).find(skill => skill.name === skillName);
    }

    findAttribute(id?: string): Shadowrun.AttributeField | undefined {
        if (id === undefined) return;
        const attributes = this.getAttributes();
        if (!attributes) return;
        return attributes[id];
    }

    findVehicleStat(statName?: string): Shadowrun.VehicleStat | undefined {
        if (statName === undefined) return;

        const vehicleStats = this.getVehicleStats();
        if (vehicleStats)
            return vehicleStats[statName];
    }

    findLimitFromAttribute(attributeName?: string): Shadowrun.LimitField | undefined {
        if (attributeName === undefined) return undefined;
        const attribute = this.findAttribute(attributeName);
        if (!attribute?.limit) return undefined;
        return this.findLimit(attribute.limit);
    }

    findLimit(limitName?: string): Shadowrun.LimitField | undefined {
        if (!limitName) return undefined;
        return this.system.limits[limitName];
    }

    getWoundModifier(): number {
        if (!("wounds" in this.system)) return 0;
        return -1 * this.system.wounds.value || 0;
    }

    /** Use edge on actors that have an edge attribute.
     *
     * NOTE: This doesn't only include characters but spirits, critters and more.
     */
    async useEdge(by: number = -1) {
        const edge = this.getEdge();
        if (edge && edge.value === 0) return;
        // NOTE: There used to be a bug which could lower edge usage below zero. Let's quietly ignore and reset. :)
        const usesLeft = edge.uses > 0 ? edge.uses : by * -1;

        const uses = Math.min(edge.value, usesLeft + by);

        await this.update({'system.attributes.edge.uses': uses});
    }

    getEdge(): Shadowrun.EdgeAttributeField {
        return this.system.attributes.edge;
    }

    hasArmor(): boolean {
        return "armor" in this.system;
    }

    /**
     * Return armor worn by this actor.
     * 
     * @param damage If given will be applied to the armor to get modified armor.
     * @returns Armor or modified armor.
     */
    getArmor(damage?:Shadowrun.DamageData) {
        // Prepare base armor data.
        const armor = "armor" in this.system ? 
            foundry.utils.duplicate(this.system.armor) : 
            DataDefaults.actorArmor();
        // Prepare damage to apply to armor.
        damage = damage || DataDefaults.damageData();

        Helpers.calcTotal(damage);
        Helpers.calcTotal(damage.ap);

        // Modify by penetration
        if (damage.ap.value !== 0)
            PartsList.AddUniquePart(armor.mod, 'SR5.AP', damage.ap.value);
                
        // Modify by element
        if (damage.element.value !== '') {
            const armorForDamageElement = armor[damage.element.value] || 0;
            if (armorForDamageElement > 0)
                PartsList.AddUniquePart(armor.mod, 'SR5.Element', armorForDamageElement);
        }
        
        Helpers.calcTotal(armor, {min: 0});

        return armor;
    }

    getMatrixDevice(): SR5Item | undefined {
        if (!("matrix" in this.system)) return;
        const matrix = this.system.matrix;
        if (matrix.device) return this.items.get(matrix.device);
    }

    /**
     * Reboot this actors living or device based persona.
     */
    async rebootPersona() {
        await MatrixFlow.rebootPersona(this);
    }

    getFullDefenseAttribute(): Shadowrun.AttributeField | undefined {
        if (this.isVehicle()) {
            return this.findVehicleStat('pilot');
        } else if (this.isCharacter()) {
            const character = this.asCharacter();
            if (character) {
                let att = character.system.full_defense_attribute;
                if (!att) att = 'willpower';
                return this.findAttribute(att);
            }
        }
    }

    getEquippedWeapons(): SR5Item[] {
        return this.items.filter((item: SR5Item) => item.isEquipped() && item.isWeapon);
    }

    /**
     * Amount of recoil compensation this actor has available (without the weapon used).
     */
    get recoilCompensation(): number {
        if(!this.system.values.hasOwnProperty('recoil_compensation')) return 0;
        //@ts-expect-error // We checked above, so let's ignore this typing.
        return this.system.values.recoil_compensation.value;
    }

    
    /**
     * Current recoil compensation with current recoil included.
     * 
     * @returns A positive number or zero.
    */
    get currentRecoilCompensation(): number {
        return Math.max(this.recoilCompensation - this.recoil, 0);
    }
    
    /**
     * Amount of progressive recoil this actor has accrued.
     */
    get recoil(): number {
        if(!this.system.values.hasOwnProperty('recoil')) return 0;
        //@ts-expect-error // We checked above, so let's ignore this typing.
        return this.system.values.recoil.value;
    }

    getDeviceRating(): number {
        if (!("matrix" in this.system)) return 0;
        // @ts-expect-error // parseInt does indeed allow number types.
        return parseInt(this.system.matrix.rating);
    }

    getAttributes(): Shadowrun.Attributes {
        return this.system.attributes;
    }

    /**
     * Return the given attribute, no matter its source.
     *
     * For characters and similar this will only return their attributes.
     * For vehicles this will also return their vehicle stats.

     * @param name An attribute or other stats name.
     * @returns Note, this can return undefined. It is not typed that way, as it broke many things. :)
     */
    getAttribute(name: string): Shadowrun.AttributeField {
        // First check vehicle stats, as they don't always exist.
        const stats = this.getVehicleStats();
        if (stats?.[name]) return stats[name];

        // Second check general attributes.
        const attributes = this.getAttributes();
        return attributes[name];
    }

    getLimits(): Shadowrun.Limits {
        return this.system.limits;
    }

    getLimit(name: string): Shadowrun.LimitField {
        const limits = this.getLimits();
        return limits[name];
    }

    /** Return actor type, which can be different kind of actors from 'character' to 'vehicle'.
     *  Please check SR5ActorType for reference.
     */
    getType(): string {
        return this.type;
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
        if (!("is_npc" in this.system) || !("npc" in this.system)) return false;

        return this.system.is_npc && this.system.npc.is_grunt;
    }

    isCritter() {
        return this.getType() === 'critter';
    }

    isIC() {
        return this.getType() === 'ic';
    }

    /**
     * Determine if this actor is able to have natural damage recovery.
     * @returns true in case of possible natural recovery.
     */
    get hasNaturalRecovery(): boolean {
        return this.isCharacter() || this.isCritter();
    }

    getVehicleTypeSkillName(): string | undefined {
        if (!("vehicleType" in this.system)) return;

        switch (this.system.vehicleType) {
            case 'air':
                return 'pilot_aircraft';
            case 'ground':
                return 'pilot_ground_craft';
            case 'water':
                return 'pilot_water_craft';
            case 'aerospace':
                return 'pilot_aerospace';
            case 'walker':
                return 'pilot_walker';
            case 'exotic':
                return 'pilot_exotic_vehicle';
            default:
                
        }
    }

    getVehicleTypeSkill(): Shadowrun.SkillField | undefined {
        if (!this.isVehicle()) return;

        const name = this.getVehicleTypeSkillName();
        return this.findActiveSkill(name);
    }

    get hasSkills(): boolean {
        return this.getSkills() !== undefined;
    }

    getSkills(): Shadowrun.CharacterSkills {
        return this.system.skills;
    }

    getActiveSkills(): Shadowrun.Skills {
        return this.system.skills.active;
    }

    getMasterUuid(): string|undefined {
        if(!this.isVehicle()) return;

        return this.asVehicle()?.system?.master;
    }

    async setMasterUuid(masterLink: string|undefined): Promise<void> {
        if(!this.isVehicle()) return;

        await this.update({ 'system.master': masterLink });
    }

    get canBeSlave(): boolean {
        return this.isVehicle();
    }

    /**
     * The network (host/grid) this matrix actor is connected to.
     */
    get network(): SR5Item|undefined {
        if (!this.isMatrixActor) return

        // Avoid typing issues by using [''] notation.
        const network = this.system['matrix'].network;
        // Matrix actor without ability to connect to network
        if (!network) return;

        const item = fromUuidSync(network.uuid) as SR5Item;
        if (!item) return;

        return item;
    }

    /**
     * Connect this actor to a host / grid
     * 
     * @param network Must be an item of matching type
     */
    async connectNetwork(network: SR5Item) {
        await MatrixNetworkFlow.connectNetwork(this, network);
    }

    /**
     * Disconnect this actor from a host / grid
     */
    async disconnectNetwork() {
        await MatrixNetworkFlow.disconnectNetwork(this);
    }

    /**
     * Determine if an actor can choose a special trait using the special field.
     */
    get hasSpecial(): boolean {
        return ['character', 'sprite', 'spirit', 'critter'].includes(this.type);
    }

    /**
     * Determine if an actor can alter the special trait
     */
    get canAlterSpecial(): boolean {
        return this.hasSpecial && ['character', 'critter'].includes(this.type);
    }

    /**
     * Determine if an actor can choose a full defense attribute
     */
    get hasFullDefense(): boolean {
        return ['character', 'vehicle', 'sprite', 'spirit', 'critter'].includes(this.type);
    }

    /**
     * Determine if an actor is awakened / magical in some kind.
     */
    get isAwakened(): boolean {
        return this.system.special === 'magic';
    }

    /**
     * This actor is emerged as a matrix native actor (Technomancers, Sprites)
     *
     */
    get isEmerged(): boolean {
        if (this.isSprite()) return true;
        if (this.isCharacter() && this.system.special === 'resonance') return true;

        return false;
    }

    /**
     * Return the full pool of a skill including attribute and possible specialization bonus.
     * @param skillId The ID of the skill. Note that this can differ from what is shown in the skill list. If you're
     *                unsure about the id and want to search
     * @param options An object to change the behavior.
     *                The property specialization will trigger the pool value to be raised by a specialization modifier
     *                The property byLabel will cause the param skillId to be interpreted as the shown i18n label.
     */
    getPool(skillId: string, options = {specialization: false, byLabel: false}): number {
        const skill = options.byLabel ? this.getSkillByLabel(skillId) : this.getSkill(skillId);
        if (!skill || !skill.attribute) return 0;
        if (!SkillFlow.allowRoll(skill)) return 0;

        const attribute = this.getAttribute(skill.attribute);

        // An attribute can have a NaN value if no value has been set yet. Do the skill for consistency.
        const attributeValue = typeof attribute.value === 'number' ? attribute.value : 0;
        const skillValue = typeof skill.value === 'number' ? skill.value : 0;

        if (SkillRules.mustDefaultToRoll(skill) && SkillRules.allowDefaultingRoll(skill)) {
            return SkillRules.defaultingModifier + attributeValue;
        }

        const specializationBonus = options.specialization ? SR.skill.SPECIALIZATION_MODIFIER : 0;
        return skillValue + attributeValue + specializationBonus;
    }

    /**
     * Find a skill either by id or label.
     *
     * Skills are mapped by an id, which can be a either a lower case name (legacy skills) or a short uid (custom, language, knowledge).
     * Legacy skills use their name as the id, while not having a name set on the SkillField.
     * Custom skills use an id and have their name set, however no label. This goes for active, language and knowledge.
     *
     * NOTE: Normalizing skill mapping from active, language and knowledge to a single skills with a type property would
     *       clear this function up.
     *
     * @param id Either the searched id, name or translated label of a skill
     * @param options .byLabel when true search will try to match given skillId with the translated label
     */
    getSkill(id: string, options = {byLabel: false}): Shadowrun.SkillField | undefined {
        if (options.byLabel)
            return this.getSkillByLabel(id);

        const {skills} = this.system;

        // Find skill by direct id to key matching.
        if (skills.active.hasOwnProperty(id)) {
            return skills.active[id];
        }
        if (skills.language.value.hasOwnProperty(id)) {
            return skills.language.value[id];
        }
        // Knowledge skills are de-normalized into categories (street, hobby, ...)
        for (const categoryKey in skills.knowledge) {
            if (skills.knowledge.hasOwnProperty(categoryKey)) {
                const category = skills.knowledge[categoryKey];
                if (category.value.hasOwnProperty(id)) {
                    return category.value[id];
                }
            }
        }

        return this.getSkillByLabel(id)
    }

    /**
     * Search all skills for a matching i18n translation label.
     * NOTE: You should use getSkill if you have the skillId ready. Only use this for ease of use!
     *
     * @param searchedFor The translated output of either the skill label (after localize) or name of the skill in question.
     * @return The first skill found with a matching translation or name.
     */
    getSkillByLabel(searchedFor: string): Shadowrun.SkillField | undefined {
        if (!searchedFor) return;

        const possibleMatch = (skill: Shadowrun.SkillField): string => skill.label ? game.i18n.localize(skill.label as Translation) : skill.name;

        const skills = this.getSkills();

        for (const [id, skill] of Object.entries(skills.language.value)) {
            if (searchedFor === possibleMatch(skill))
                return {...skill, id};
        }

        // Iterate over all different knowledge skill categories
        for (const categoryKey in skills.knowledge) {
            if (!skills.knowledge.hasOwnProperty(categoryKey)) continue;
            // Typescript can't follow the flow here...
            const categorySkills = skills.knowledge[categoryKey].value as Shadowrun.SkillField[];
            for (const [id, skill] of Object.entries(categorySkills)) {
                if (searchedFor === possibleMatch(skill))
                    return {...skill, id};
            }
        }

        for (const [id, skill] of Object.entries(skills.active)) {
            if (searchedFor === possibleMatch(skill))
                return {...skill, id};
        }
    }

    /**
     * For the given skillId as it be would in the skill data structure for either
     * active, knowledge or language skill.
     * 
     * @param skillId Legacy / default skills have human-readable ids, while custom one have machine-readable.
     * @returns The label (not yet translated) OR set custom name.
     */
    getSkillLabel(skillId: string): string {
        const skill = this.getSkill(skillId);
        if (!skill) {
            return '';
        }

        return skill.label ?? skill.name ?? '';
    }

    /**
     * Add a new knowledge skill for a specific category.
     * 
     * Knowledge skills are stored separately from active and language skills and have
     * some values pre-defined by their category (street, professional, ...)
     * 
     * @param category Define the knowledge skill category
     * @param skill  Partially define the SkillField properties needed. Omitted properties will be default.
     * @returns The id of the created knowledge skill.
     */
    async addKnowledgeSkill(category: keyof Shadowrun.KnowledgeSkills, skill: Partial<Shadowrun.SkillField>={name: SKILL_DEFAULT_NAME}): Promise<string|undefined> {
        if (!this.system.skills.knowledge.hasOwnProperty(category)) {
            console.error(`Shadowrun5e | Tried creating knowledge skill with unknown category ${category}`);
            return;
        }
        
        skill = DataDefaults.skillData(skill);
        const id = randomID(16);
        const value = {};
        value[id] = skill;
        const fieldName = `system.skills.knowledge.${category}.value`;
        const updateData = {};
        updateData[fieldName] = value;

        await this.update(updateData);

        return id;
    }

    /**
     * Add a new active skill.
     * 
     * @param skillData Partially define the SkillField properties needed. Omitted properties will be default.
     * @returns The new active skill id.
     */
    async addActiveSkill(skillData: Partial<Shadowrun.SkillField> = {name: SKILL_DEFAULT_NAME}): Promise<string | undefined> {
        const skill = DataDefaults.skillData(skillData);

        const activeSkillsPath = 'system.skills.active';
        const updateSkillDataResult = Helpers.getRandomIdSkillFieldDataEntry(activeSkillsPath, skill);

        if (!updateSkillDataResult) return;

        const {updateSkillData, id} = updateSkillDataResult;

        await this.update(updateSkillData as object);

        return id;
    }

    /**
     * Remove a language skill by it's id.
     * @param skillId What skill id to delete.
     */
    async removeLanguageSkill(skillId: string) {
        const updateData = Helpers.getDeleteKeyUpdateData('system.skills.language.value', skillId);
        await this.update(updateData);
    }

    /**
     * Add a language skill.
     * 
     * @param skill Partially define the SkillField properties needed. Omitted properties will be default.
     * @returns The new language skill id.
     */
    async addLanguageSkill(skill): Promise<string> {
        const defaultSkill = {
            name: '',
            specs: [],
            base: 0,
            value: 0,
            // TODO: BUG ModifiableValue is ModList<number>[] and not number
            mod: 0,
        };
        skill = {
            ...defaultSkill,
            ...skill,
        };

        const id = randomID(16);
        const value = {};
        value[id] = skill;
        const fieldName = `system.skills.language.value`;
        const updateData = {};
        updateData[fieldName] = value;

        await this.update(updateData);

        return id;
    }

    /**
     * Remove a knowledge skill
     * @param skillId What skill id to delete.
     * @param category The matching knowledge skill category for skillId
     */
    async removeKnowledgeSkill(skillId: string, category: keyof Shadowrun.KnowledgeSkills) {
        const updateData = Helpers.getDeleteKeyUpdateData(`system.skills.knowledge.${category}.value`, skillId);
        await this.update(updateData);
    }

    /** 
     * Delete the given active skill by it's id. It doesn't
     *
     * @param skillId Either a random id for custom skills or the skills name used as an id.
     */
    async removeActiveSkill(skillId: string) {
        const activeSkills = this.getActiveSkills();
        if (!activeSkills.hasOwnProperty(skillId)) return;
        const skill = this.getSkill(skillId);
        if (!skill) return;

        // Don't delete legacy skills to allow prepared items to use them, should the user delete by accident.
        // New custom skills won't have a label set also.
        if (skill.name === '' && skill.label !== undefined && skill.label !== '') {
            await this.hideSkill(skillId);
            // NOTE: For some reason unlinked token actors won't cause a render on update?
            //@ts-expect-error // TODO: foundry-vtt-types v10
            if (!this.prototypeToken.actorLink)
                await this.sheet?.render();
            return;
        }

        // Remove custom skills without mercy!
        const updateData = Helpers.getDeleteKeyUpdateData('system.skills.active', skillId);
        await this.update(updateData);
    }

    /**
     * Mark the given skill as hidden.
     *
     * NOTE: Hiding skills has
     *
     * @param skillId The id of any type of skill.
     */
    async hideSkill(skillId: string) {
        if (!skillId) return;
        const skill = this.getSkill(skillId);
        if (!skill) return;

        skill.hidden = true;
        const updateData = Helpers.getUpdateDataEntry(`system.skills.active.${skillId}`, skill);
        await this.update(updateData);
    }

    /**
     * mark the given skill as visible.
     *
     * @param skillId The id of any type of skill.
     */
    async showSkill(skillId: string) {
        if (!skillId) return;
        const skill = this.getSkill(skillId);
        if (!skill) return;

        skill.hidden = false;
        const updateData = Helpers.getUpdateDataEntry(`system.skills.active.${skillId}`, skill);
        await this.update(updateData);
    }

    /**
     * Show all hidden skills.
     * 
     * For hiding/showing skill see SR5Actor#showSkill and SR5Actor#hideSkill.
     */
    async showHiddenSkills() {
        const updateData = {};

        const skills = this.getActiveSkills();
        for (const [id, skill] of Object.entries(skills)) {
            if (skill.hidden) {
                skill.hidden = false;
                updateData[`system.skills.active.${id}`] = skill;
            }
        }

        if (!updateData) return;

        await this.update(updateData);
        // NOTE: For some reason unlinked token actors won't cause a render on update?
        //@ts-expect-error // TODO: foundry-vtt-types v10
        if (!this.prototypeToken.actorLink)
            await this.sheet?.render();
    }

    /**
     * Prompt the current user for a generic roll. 
     */
    async promptRoll() {
        await this.tests.promptSuccessTest();
    }

    /**
     * The general action process has currently no good way of injecting device ratings into the mix.
     * So, let's trick a bit.
     *
     * @param options
     */
    async rollDeviceRating(options?: Shadowrun.ActorRollOptions) {
        const rating = this.getDeviceRating();

        const showDialog = this.tests.shouldShowDialog(options?.event);
        const testCls = this.tests._getTestClass('SuccessTest') as typeof SuccessTest;
        const test = new testCls({}, {actor: this}, {showDialog});

        // Build pool values.
        const pool = new PartsList<number>(test.pool.mod);
        pool.addPart('SR5.Labels.ActorSheet.DeviceRating', rating);
        pool.addPart('SR5.Labels.ActorSheet.DeviceRating', rating);


        // Build modifiers values.
        const mods = new PartsList<number>(test.data.modifiers.mod);
        mods.addUniquePart('SR5.ModifierTypes.Global', this.modifiers.totalFor('global'));

        return await test.execute();
    }

    /**
     * Get an action from any pack with the given name, configured for this actor and let the caller handle it..
     * 
     * @param packName The name of the item pack to search.
     * @param actionName The name within that pack.
     * @param options Success Test options
     * @returns the test instance after configuration and before it's execution.
     */
    async packActionTest(packName: Shadowrun.PackName, actionName: Shadowrun.PackActionName, options?: Shadowrun.ActorRollOptions) {
        const showDialog = this.tests.shouldShowDialog(options?.event);
        return await this.tests.fromPackAction(packName, actionName, this, {showDialog});
    }

    /**
     * Roll an action from any pack with the given name.
     *
     * @param packName The name of the item pack to search.
     * @param actionName The name within that pack.
     * @param options Success Test options
     * @returns the test instance after it's been executed
     */
    async rollPackAction(packName: Shadowrun.PackName, actionName: Shadowrun.PackActionName, options?: Shadowrun.ActorRollOptions) {
        const test = await this.packActionTest(packName, actionName, options);

        if (!test) return console.error('Shadowrun 5e | Rolling pack action failed');

        return await test.execute();
    }

    /**
     * Get an action as defined within the systems general action pack.
     * 
     * @param actionName The action with in the general pack.
     * @param options Success Test options 
     */
    async generalActionTest(actionName: Shadowrun.PackActionName, options?: Shadowrun.ActorRollOptions) {
        return await this.packActionTest(SR5.packNames.generalActions as Shadowrun.PackName, actionName, options);
    }

    /**
     * Roll an action as defined within the systems general action pack.
     *
     * @param actionName The action with in the general pack.
     * @param options Success Test options
     */
    async rollGeneralAction(actionName: Shadowrun.PackActionName, options?: Shadowrun.ActorRollOptions) {
        return await this.rollPackAction(SR5.packNames.generalActions as Shadowrun.PackName, actionName, options);
    }

    /**
     * Roll a skill test for a specific skill
     * @param skillId The id or label for the skill. When using a label, the appropriate option must be set.
     * @param options Optional options to configure the roll.
     * @param options.byLabel true to search the skill by label as displayed on the sheet.
     * @param options.specialization true to configure the skill test to use a specialization.
     */
    async rollSkill(skillId: string, options: Shadowrun.SkillRollOptions={}) {
        console.info(`Shadowrun5e | Rolling skill test for ${skillId}`);

        const action = this.skillActionData(skillId, options);
        if (!action) return;
        if(options.threshold) {
            action.threshold = options.threshold
        }

        const showDialog = this.tests.shouldShowDialog(options.event);
        const test = await this.tests.fromAction(action, this, {showDialog});
        if (!test) return;

        return await test.execute();
    }

    /**
     * Roll a general attribute test with one or two attributes.
     *
     * @param name The attributes name as defined within data
     * @param options Change general roll options.
     */
    async rollAttribute(name, options: Shadowrun.ActorRollOptions={}) {
        console.info(`Shadowrun5e | Rolling attribute ${name} test from ${this.constructor.name}`);

        // Prepare test from action.
        const action = DataDefaults.actionRollData({attribute: name, test: AttributeOnlyTest.name});
        const showDialog = this.tests.shouldShowDialog(options.event);
        const test = await this.tests.fromAction(action, this, {showDialog});
        if (!test) return;

        return await test.execute();
    }

    /**
     * Roll a skill test for a specific skill
     * @param skillId The id or label for the skill. When using a label, the appropriate option must be set.
     * @param options Optional options to configure the roll.
     * @param options.byLabel true to search the skill by label as displayed on the sheet.
     * @param options.specialization true to configure the skill test to use a specialization.
     */
    async startTeamworkTest(skillId: string, options: Shadowrun.SkillRollOptions={}) {
        console.info(`Shadowrun5e | Starting teamwork test for ${skillId}`);

        // Prepare message content.
        const templateData = {
            title: "Teamwork " + Helpers.getSkillTranslation(skillId),
            // Note: While ChatData uses ids, this uses full documents.
            speaker: {
                actor: this,
                token: this.token
            },
            participants: []
        };
        const content = await renderTemplate('systems/shadowrun5e/dist/templates/rolls/teamwork-test-message.html', templateData);
        // Prepare the actual message.
        const messageData =  {
            user: game.user?.id,
            // Use type roll, for Foundry built in content visibility.
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            speaker: {
                actor: this.id,
                alias: game.user?.name,
                token: this.token
            },
            content,
            // Manually build flag data to give renderChatMessage hook flag access.
            // This test data is needed for all subsequent testing based on this chat messages.
            flags: {
                // Add test data to message to allow ChatMessage hooks to access it.
                [SYSTEM_NAME]: {[FLAGS.Test]: {skill: skillId}},
                'core.canPopout': true
            },
            sound: CONFIG.sounds.dice,
        };

        //@ts-expect-error // TODO: foundry-vtt-types v10
        const message = await ChatMessage.create(messageData, options);

        if (!message) return;

        return message;
    }

        /**
     * Roll a skill test for a specific skill
     * @param skillId The id or label for the skill. When using a label, the appropriate option must be set.
     * @param options Optional options to configure the roll.
     * @param options.byLabel true to search the skill by label as displayed on the sheet.
     * @param options.specialization true to configure the skill test to use a specialization.
     */
        async rollTeamworkTest(skillId: string, teamworkData: TeamworkMessageData, options: Shadowrun.SkillRollOptions={}) {
            console.info(`Shadowrun5e | Rolling teamwork test for ${skillId}`);
    
            const action = this.skillActionData(skillId, options);
            if (!action) return;
            if(!teamworkData.criticalGlitch) {
                action.limit.mod.push({name: "Teamwork", value: teamworkData.additionalLimit})
            }

            action.dice_pool_mod.push({name: "Teamwork", value: teamworkData.additionalDice})
    
            const showDialog = this.tests.shouldShowDialog(options.event);
            const test = await this.tests.fromAction(action, this, {showDialog});
            if (!test) return;

    
            return await test.execute();
        }

    /**
     * Build an action for the given skill id based on it's configured values.
     *
     * @param skillId Any skill, no matter if active, knowledge or language
     * @param options
     */
    skillActionData(skillId: string, options: Shadowrun.SkillRollOptions = {}): Shadowrun.ActionRollData|undefined {
        const byLabel = options.byLabel || false;
        const skill = this.getSkill(skillId, {byLabel});
        if (!skill) {
            console.error(`Shadowrun 5e | Skill ${skillId} is not registered of actor ${this.id}`);
            return;
        }

        // When fetched by label, getSkillByLabel will inject the id into SkillField.
        skillId = skill.id || skillId;

        // Derive limit from skill attribute.
        const attribute = this.getAttribute(skill.attribute);
        // TODO: Typing. LimitData is incorrectly typed to ActorAttributes only but including limits.
        const limit = attribute.limit as Shadowrun.ActorAttribute || '';
        // Should a specialization be used?
        const spec = options.specialization || false;

        return DataDefaults.actionRollData({
            skill: skillId,
            spec,
            attribute: skill.attribute,
            limit: {
                base: 0, value: 0, mod: [],
                attribute: limit,
                base_formula_operator: 'add',
            },

            test: 'SkillTest'
        });
    }

    /**
     * Override setFlag to remove the 'SR5.' from keys in modlists, otherwise it handles them as embedded keys
     * @param scope
     * @param key
     * @param value
     */
    //@ts-expect-error // TODO: foundry-vtt-types v10
    async setFlag(scope: string, key: string, value: any): Promise<any> {
        const newValue = Helpers.onSetFlag(value);
        return await super.setFlag(scope, key, newValue);
    }

    /**
     * Override getFlag to add back the 'SR5.' keys correctly to be handled
     * @param scope
     * @param key
     */
    //@ts-expect-error // TODO: foundry-vtt-types v10
    getFlag(scope: string, key: string): any {
        const data = super.getFlag(scope, key);
        return Helpers.onGetFlag(data);
    }

    /** Return either the linked token or the token of the synthetic actor.
     *
     * @return Will return null should no token have been placed on scene.
     */
    getToken(): TokenDocument | null {
        // Linked actors can only have one token, which isn't stored within actor data...
        if (this._isLinkedToToken() && this.hasToken()) {
            const linked = true;
            const tokens = this.getActiveTokens(linked) as unknown as Token[];
            // This assumes for a token to exist and should fail if not.
            return tokens[0].document;
        }

        // Unlinked actors can have multiple active token but each have theirs directly attached...
        return this.token;
    }

    /**
     * There is no need for a token to placed. The prototype token is enough.
     */
    _isLinkedToToken(): boolean {
        //@ts-expect-error // TODO: foundry-vtt-types v10
        // If an actor is linked, all it's copies also contain this linked status, even if they're not.
        return this.prototypeToken.actorLink && !this.token;
    }

    hasToken(): boolean {
        return this.getActiveTokens().length > 0;
    }

    hasActivePlayerOwner(): boolean {
        const players = this.getActivePlayerOwners();
        return players.length > 0;
    }

    getActivePlayer(): User | null {
        if (!game.users) return null;
        if (!this.hasPlayerOwner) return null;

        for (const user of game.users.contents) {
            if (!user.active || user.isGM) {
                continue;
            }
            if (this.id === user.character?.id) {
                return user;
            }
        }

        return null;
    }

    getActivePlayerOwners(): User[] {
        return Helpers.getPlayersWithPermission(this, 'OWNER', true);
    }


    /**
     * Heal damage on a given damage track. Be aware that healing damage doesn't equate to recovering damage
     * and will not adhere to the recovery rules.
     *
     * @param track What track should be healed?
     * @param healing How many boxes of healing should be done?
     */
    async healDamage(track: Shadowrun.DamageType, healing: number) {
        console.log(`Shadowrun5e | Healing ${track} damage of ${healing} for actor`, this);

        // @ts-expect-error // Ease of typing...
        if (!this.system?.track.hasOwnProperty(track)) return

        // @ts-expect-error // Ease of typing...
        const current = Math.max(this.system.track[track].value - healing, 0);

        await this.update({[`system.track.${track}.value`]: current});
    }

    async healStunDamage(healing: number) {
        await this.healDamage('stun', healing);
    }

    async healPhysicalDamage(healing: number) {
        await this.healDamage('physical', healing);
    }

    get canRecoverPhysicalDamage(): boolean {
        const stun = this.getStunTrack();
        if (!stun) return false
        return RecoveryRules.canHealPhysicalDamage(stun.value);
    }

    /**
     * Apply damage of any type to this actor. This should be the main entry method to applying damage.
     * 
     * @param damage Damage to be applied
     */
    async addDamage(damage: Shadowrun.DamageData) {
        await DamageApplicationFlow.addDamage(this, damage);
        await this.applyDefeatedStatus();
    }

    /**
     * Directly set the matrix damage track of this actor to a set amount.
     *
     * This is mainly used for manual user input on an actor sheet.
     *
     * This is done by resetting all tracked damage and applying one manual damage set.
     *
     * @param value The matrix damage to be applied.
     */
    async setMatrixDamage(value: number) {
        DamageApplicationFlow.setMatrixDamage(this, value);
    }

    getStunTrack(): Shadowrun.TrackType | undefined {
        if ("track" in this.system && "stun" in this.system.track)
            return this.system.track.stun;
    }

    getPhysicalTrack(): Shadowrun.OverflowTrackType | undefined {
        if ("track" in this.system && "physical" in this.system.track)
            return this.system.track.physical;
    }

    /**
     * The matrix depends on actor type and possibly equipped matrix device.
     *
     * Use this method for whenever you need to access this actors matrix damage track as it's source might differ.
     */
    getMatrixTrack(): Shadowrun.ConditionData | undefined {
        // Some actors will have a direct matrix track.
        if ("track" in this.system && "matrix" in this.system.track) {
            return this.system.track.matrix;
        }

        // Some actors will have a personal matrix condition monitor, like a device condition monitor.
        if (this.isMatrixActor) {
            // @ts-expect-error isMatrixActor checks for the matrix attribute
            return this.system.matrix.condition_monitor;
        }

        // Fallback to equipped matrix device.
        const device = this.getMatrixDevice();
        if (!device) return undefined;

        return device.getCondition();
    }

    /**
     * Depending on this actors defeated status, apply the correct effect and status.
     * 
     * This will only work when the actor is connected to a token.
     * 
     * @param defeated Optional defeated status to be used. Will be determined if not given.
     */
    async applyDefeatedStatus(defeated?: DefeatedStatus) {
        // TODO: combat-utility-belt seems to replace the default status effects, causing some issue I don't yet understand.
        // thus a setting is added so GMs can turn it off if they handle it in another way

        const token = this.getToken();
        if (!token || !game.settings.get(SYSTEM_NAME, FLAGS.UseDamageCondition)) return;

        defeated = defeated ?? ConditionRules.determineDefeatedStatus(this);

        // Remove unapplicable defeated token status.
        await this.removeDefeatedStatus(defeated);

        // Apply the appropriate combatant status.
        if (defeated.unconscious || defeated.dying || defeated.dead) {
            await this.combatant?.update({defeated: true});
        } else {
            return await this.combatant?.update({ defeated: false });
        }

        let newStatus = 'unconscious';
        if (defeated.dying) newStatus = 'unconscious';
        if (defeated.dead) newStatus = 'dead';

        // Find fitting status and fallback to dead if not found.
        const status = CONFIG.statusEffects.find(e => e.id === newStatus);
        const effect = status || CONFIG.controlIcons.defeated;

        // Avoid applying defeated status multiple times.
        const existing = this.effects.reduce<string[]>((arr, e) => {
            // @ts-expect-error TODO: foundry-vtt-types v10
            if ( (e.statuses.size === 1) && e.statuses.has(effect.id) ) {
                arr.push(e.id as string);
            }
            return arr;
        }, []);

        if (existing.length) return;

        // @ts-expect-error // TODO: foundry-vtt-types v11
        // Set effect as active, as we've already made sure it isn't.
        // Otherwise Foundry would toggle on/off, even though we're still dead.
        await token.object.toggleEffect(effect, { overlay: true, active: true });
    }

    /**
     * Remove defeated status effects from this actor, depending on current status.
     * 
     * @param defeated Optional defeated status to be used. Will be determined if not given.
     */
    async removeDefeatedStatus(defeated?: DefeatedStatus) {
        defeated = defeated ?? ConditionRules.determineDefeatedStatus(this);

        const removeStatus: string[] = [];
        if ((!defeated.unconscious && !defeated.dying) || defeated.dead) removeStatus.push('unconscious');
        if (!defeated.dead) removeStatus.push('dead');
        
        // Remove out old defeated effects.
        if (removeStatus.length) {
            const existing = this.effects.reduce((arr, e) => {
                // @ts-expect-error TODO: foundry-vtt-types v10
                if ( (e.statuses.size === 1) && e.statuses.some(status => removeStatus.includes(status)) ) arr.push(e.id);
                return arr; 
            }, []);

            if (existing.length) await this.deleteEmbeddedDocuments('ActiveEffect', existing);
        }
    }

    getModifiedArmor(damage: Shadowrun.DamageData): Shadowrun.ActorArmorData {
        if (!damage.ap?.value) {
            return this.getArmor();
        }

        const modified = foundry.utils.duplicate(this.getArmor());
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

        const combat: SR5Combat = game.combat as unknown as SR5Combat;
        const combatant = combat.getActorCombatant(this);

        // Token might not be part of active combat.
        if (!combatant) return;
        if (!combatant.initiative) return;

        // While not prohibiting, inform user about missing resource.
        if (combatant.initiative + modifier < 0) {
            ui.notifications?.warn('SR5.MissingRessource.Initiative', {localize: true});
        }

        await combat.adjustInitiative(combatant, modifier);
    }

    /**
     * Determine if this actor is an active combatant.
     * 
     * @returns true, when active. false, when not in combat.
     */
    get combatActive(): boolean {
        if (!game.combat) return false;
        const combatant = (game.combat as SR5Combat).getActorCombatant(this);
        if (!combatant) return false;
        if (!combatant.initiative) return false;

        return true;
    }

    get combatant(): Combatant | undefined {
        if (!this.combatActive) return;
        return (game.combat as SR5Combat).getActorCombatant(this);
    }

    /**
     * Return the initiative score for a currently active combat
     * 
     * @returns The score or zero.
     */
    get combatInitiativeScore(): number {
        if (!game.combat) return 0;
        const combatant = (game.combat as SR5Combat).getActorCombatant(this);
        if (!combatant?.initiative) return 0;
        return combatant.initiative;
    }

    hasDamageTracks(): boolean {
        return "track" in this.system;
    }

    asVehicle(): Shadowrun.VehicleActorData | undefined {
        if (this.isVehicle())
            return this as unknown as Shadowrun.VehicleActorData;
    }

    asCharacter(): Shadowrun.CharacterActorData | undefined {
        if (this.isCharacter())
            return this as unknown as Shadowrun.CharacterActorData;
    }

    asSpirit(): Shadowrun.SpiritActorData | undefined {
        if (this.isSpirit()) {
            return this as unknown as Shadowrun.SpiritActorData;
        }
    }

    asSprite(): Shadowrun.SpriteActorData | undefined {
        if (this.isSprite()) {
            return this as unknown as Shadowrun.SpriteActorData;
        }
    }

    asCritter(): Shadowrun.CritterActorData | undefined {
        if (this.isCritter()) {
            return this as unknown as Shadowrun.CritterActorData;
        }
    }

    asIC(): Shadowrun.ICActorData | undefined {
        if (this.isIC()) {
            return this as unknown as Shadowrun.ICActorData;
        }
    }

    getVehicleStats(): Shadowrun.VehicleStats | undefined {
        if (this.isVehicle() && "vehicle_stats" in this.system) {
            return this.system.vehicle_stats;
        }
    }

    /** Add another actor as the driver of a vehicle to allow for their values to be used in testing.
     *
     * @param uuid An actors id. Should be a character able to drive a vehicle
     */
    async addVehicleDriver(uuid: string) {
        if (!this.isVehicle()) return;

        const driver = await fromUuid(uuid) as SR5Actor;
        if (!driver) return;

        // NOTE: In THEORY almost all actor types can drive a vehicle.
        // ... drek, in theory a drone could drive another vehicle even...

        await this.update({'system.driver': driver.id});
    }

    async removeVehicleDriver() {
        if (!this.hasDriver()) return;

        await this.update({'system.driver': ''});
    }

    hasDriver(): boolean {
        const vehicle = this.asVehicle();
        if (!vehicle) return false;

        //@ts-expect-error // TODO: foundry-vtt-types v10
        return this.system.driver.length > 0;
    }

    getVehicleDriver(): SR5Actor | undefined {
        if (!this.hasDriver()) return;
        const vehicle = this.asVehicle();
        if (!vehicle) return;

        //@ts-expect-error // TODO: foundry-vtt-types v10
        const driver = game.actors?.get(this.system.driver) as SR5Actor;
        // If no driver id is set, we won't get an actor and should explicitly return undefined.
        if (!driver) return;
        return driver;
    }

    /**
     * Add a host to this IC type actor.
     *
     * Currently compendium hosts aren't supported.
     * Any other actor type has no use for this method.
     *
     * @param item The host item
     */
    async addICHost(item: SR5Item) {
        if (!this.isIC()) return;
        if (!item.isHost) return;
        await this._updateICHostData(item);
    }

    async _updateICHostData(host: SR5Item) {
        const hostData = host.asHost;
        if (!hostData) return;

        const updateData = {
            id: host.uuid,
            rating: hostData.system.rating,
            atts: foundry.utils.duplicate(hostData.system.atts)
        }

        // Some host data isn't stored on the IC actor (marks) and won't cause an automatic render.
        await this.update({'system.host': updateData}, {render: false});
        await this.sheet?.render();
    }

    /**
     * Remove a connect Host item from an ic type actor.
     */
    async removeICHost() {
        if (!this.isIC()) return;

        const updateData = {
            id: null,
            rating: 0,
            atts: null
        }

        await this.update({'system.host': updateData});
    }

    /**
     * Will return true if this ic type actor has been connected to a host.
     */
    hasHost(): boolean {
        const ic = this.asIC();
        if (!ic) return false;
        return ic && !!ic.system.host.id;
    }

    /**
     * Return the host this IC actor is connected with.
     * 
     * @returns A item of type host or undefined.
     */
    async getICHost(): Promise<SR5Item | undefined> {
        const ic = this.asIC();
        if (!ic) return;
        // legacy used id, new uses uuid. Try both.
        const document = await fromUuid(ic?.system?.host.id) || game.actors?.get(ic?.system?.host.id);
        if ((document instanceof SR5Item) && document.isHost) return document;
    }

    /**
     * Is this actor currently using the VR matrix mode?
     */
    get isUsingVR(): boolean {
        const matrixData = this.matrixData;
        if (!matrixData) return false;
        return matrixData.vr;
    }

    /**
     * Is this actor currently using VR hot sim?
     * 
     * An actor must be using VR to be able to use hot sim.
     */
    get isUsingHotSim(): boolean {
        if (!this.isUsingVR) return false;
        const matrixData = this.matrixData;
        if (!matrixData) return false;
        return matrixData.hot_sim;
    }

    /**
     * Is this actors persona currently being link locked?
     */
    get isLinkLocked(): boolean {
        const matrixData = this.matrixData;
        if (!matrixData) return false;
        return matrixData.link_locked;
    }

    /**
     * Add an actor as this spirit actor's summoner.
     * @param actor A character actor to be used as summoner
     */
    async addSummoner(actor: SR5Actor) {
        if (!this.isSpirit() || !actor.isCharacter()) return;
        await this.update({ 'system.summonerUuid': actor.uuid });
    }

    /**
     * Remove a summoner from this spirit actor.
     */
    async removeSummoner() {
        if (!this.isSpirit()) return;
        await this.update({ 'system.summonerUuid': null });
    }

    /**
     * Add an actor as this sprites technomancers.
     * @param actor A character actor to be used as technomancer
     */
    async addTechnomancer(actor: SR5Actor) {
        if (!this.isSprite() || !actor.isCharacter()) return;
        await this.update({ 'system.technomancerUuid': actor.uuid });
    }

    /**
     * Remove a technomancer from this sprite actor.
     */
    async removeTechnomancer() {
        if (!this.isSprite()) return;
        await this.update({ 'system.technomancerUuid': '' });
    }

    /** 
     * Get all situational modifiers from this actor.
     * NOTE: These will return selections only without higher level selections applied.
     *       You'll have to manually trigger .applyAll or apply what's needed.
     */
    getSituationModifiers(): DocumentSituationModifiers {
        return DocumentSituationModifiers.getDocumentModifiers(this);
    }

    /**
     * Set all situational modifiers for this actor
     * 
     * @param modifiers The DocumentSituationModifiers instance to save source modifiers from.
     *                  The actor will not be checked, so be careful.
     */
    async setSituationModifiers(modifiers: DocumentSituationModifiers) {
        await DocumentSituationModifiers.setDocumentModifiers(this, modifiers.source);
    }

    /**
     * Check if the current actor has matrix capabilities.
     */
    get isMatrixActor(): boolean {
        return 'matrix' in this.system;
    }

    /**
     * Check if the current actor is a matrix first class citizen.
     * 
     * @returns true, when the actor lives in the matrix.
     */
    get hasActorPersona(): boolean {
        return this.isVehicle() || this.isIC() || this.isEmerged;
    }

    /**
     * Check if the current actor has a normal persona given by an matrix device.
     * 
     * @returns true, when the actor has an active persona.
     */
    get hasDevicePersona(): boolean {
        return this.getMatrixDevice() !== undefined;
    }

    /**
     * Check if the current actor has a active living persona.
     * If a technomancer uses a matrix device to connect with, they don't have a living persona!
     * 
     * @returns true, when a technomancer uses their living persona
     */
    get hasLivingPersona(): boolean {
        return !this.hasDevicePersona && this.isEmerged;
    }

    /**
     * Retrieve all matrix devices of this actor that are equipped and set to wireless.
     */
    get wirelessDevices(): SR5Item[] {
        return this.items.filter((item) => item.isMatrixDevice && item.isEquipped() && item.isWireless());
    }

    get matrixData(): Shadowrun.MatrixData | undefined {
        if (!this.isMatrixActor) return;
        // @ts-expect-error // isMatrixActor handles it, TypeScript doesn't know.
        return this.system.matrix as Shadowrun.MatrixData;
    }

    /**
     * Change the amount of marks on the target by the amount of marks given, while adhering to min/max values.
     *
     *
     * @param target The Document the marks are placed on. This can be an actor (character, technomancer, IC) OR an item (Host)
     * @param marks The amount of marks to be placed
     * @param options Additional options that may be needed
     * @param options.overwrite Replace the current marks amount instead of changing it
     */
    async setMarks(target: Shadowrun.NetworkDevice|undefined, marks: number, options: SetMarksOptions = {}) {
        await ActorMarksFlow.setMarks(this, target, marks, options);
    }

    /**
     * Remove ALL marks placed by this actor and maybe disconnect from host / grid if necessary.
     */
    async clearMarks() {
        // Keep marks for later use
        const marks = this.marksData 

        await ActorMarksFlow.clearMarks(this);

        // Check if marks have been used to connect to host/grid
        // TODO: Refactor into MatrixNetworkFlow
        const network = this.network;
        if (!network) return;
        if (!marks) return;

        for (const {uuid} of marks) {
            if (network.uuid === uuid) {
                return await this.disconnectNetwork();
            }
        }
    }

    /**
     * Remove ONE mark. If you want to delete all marks, use clearMarks instead.
     * 
     * Maybe disconnect from host/grid as well, if necessary
     */
    async clearMark(uuid: string) {
        await ActorMarksFlow.clearMark(this, uuid);

        // Check if marks have been used to connect to host/grid
        // TODO: Refactor into MatrixNetworkFlow
        const network = this.network;
        if (!network) return;

        if (network.uuid === uuid) {
            await this.disconnectNetwork();
        }
    }

    /**
     * Get all marks placed by this actor.
     * @returns 
     */
    get marksData(): Shadowrun.MatrixMarks | undefined {
        return this.matrixData?.marks;
    }

    /**
     * Get amount of Matrix marks placed by this actor on this target.
     * 
     * @param uuid Target uuid
     * @returns Amount of marks placed
     */
    getMarksPlaced(uuid: string) {
        return ActorMarksFlow.getMarksPlaced(this, uuid);
    }

    /**
     * Return the document used to store marks placed for this actor.
     * 
     * For a normal character/technomancer this will be the actor itself, though for others this can differ.
     * 
     * These special cases are possible:
     * - IC with a host connected will provide the host item
     * - IC without a host will provide itself
     * - A vehicle within a PAN will provide the controlling actor
     * 
     * @returns The document to retrieve all marks this actor has access to.
     */
    async _getDocumentWithMarks(): Promise<Shadowrun.NetworkDevice|undefined> {
        // CASE 1 - IC marks are stored on their host item.
        if (this.isIC() && this.hasHost()) {
            return await this.getICHost();
        }
        // CASE 2 - Vehicle marks are stored on their master actor.
        if (this.isVehicle() && this.hasMaster) {
            const master = this.master;
            return master?.actorOwner;
        }
        
        // DEFAULT CASE
        return this;
    }

    /**
     * Check if this actor is part of a Matrix network as a slave.
     */
    get hasMaster(): boolean {
        return this.canBeSlave && !!this.getMasterUuid();
    }

    /**
     * Get the master device of this matrix actor.
     * 
     * This applies only to actors that act as matrix devices (vehicles).
     */
    get master(): SR5Item|undefined {
        const masterUuid = this.getMasterUuid();
        if (!masterUuid) return;
        return fromUuidSync(masterUuid) as SR5Item;
    }

    /**
     * Retrieve all documents this actor has a mark placed on, directly or indirectly.
     */
    async getAllMarkedDocuments(): Promise<Shadowrun.MarkedDocument[]> {
        const marksDevice = await this._getDocumentWithMarks();
        if (!marksDevice) return [];
        const marks = marksDevice.marksData;
        if (!marks) return [];

        return await ActorMarksFlow.getMarkedDocuments(marks);
    }

    /**
     * How many previous attacks has this actor been subjected to?
     * 
     * @returns A positive number or zero.
     */
    get previousAttacks(): number {
        //@ts-expect-error TODO: foundry-vtt-types v10
        return Math.max(this.system.modifiers.multi_defense * -1, 0);
    }
    /**
     * Apply a new consecutive defense multiplier based on the amount of attacks given
     * 
     * @param previousAttacks Attacks within a combat turn. If left out, will guess based on current modifier.
     */
    async calculateNextDefenseMultiModifier(previousAttacks: number=this.previousAttacks) {
        console.debug('Shadowrun 5e | Applying consecutive defense modifier for. Last amount of attacks: ', previousAttacks);

        const automateDefenseMod = game.settings.get(SYSTEM_NAME, FLAGS.AutomateMultiDefenseModifier);
        if (!automateDefenseMod || !this.combatActive) return;

        const multiDefenseModi = CombatRules.defenseModifierForPreviousAttacks(previousAttacks + 1);
        await this.update({'system.modifiers.multi_defense': multiDefenseModi});
    }

    /**
     * Remove the consecutive defense per turn modifier.
     */
    async removeDefenseMultiModifier() {
        const automateDefenseMod = game.settings.get(SYSTEM_NAME, FLAGS.AutomateMultiDefenseModifier);
        if (!automateDefenseMod || !this.combatActive) return;

        if (this.system.modifiers.multi_defense === 0) return;

        console.debug('Shadowrun 5e | Removing consecutive defense modifier.', this);
        await this.update({'system.modifiers.multi_defense': 0});
    }

    /**
     * Add a firemode recoil to the progressive recoil.
     * 
     * @param fireMode Ranged Weapon firemode used to attack with.
     */
    async addProgressiveRecoil(fireMode: Shadowrun.FireModeData) {
        const automateProgressiveRecoil = game.settings.get(SYSTEM_NAME, FLAGS.AutomateProgressiveRecoil);
        if (!automateProgressiveRecoil) return;

        if (!this.hasPhysicalBody) return;
        if (!fireMode.recoil) return;
        
        await this.addRecoil(fireMode.value);
    }

    /**
     * Add a flat value on top of existing progressive recoil
     * @param additional New recoil to be added
     */
    async addRecoil(additional: number) {
        const base = this.recoil + additional;
        await this.update({'system.values.recoil.base': base});
    }

    /**
     * Clear whatever progressive recoil this actor holds.
     */
    async clearProgressiveRecoil() {
        if (!this.hasPhysicalBody) return;
        if (this.recoil === 0) return;
        await this.update({'system.values.recoil.base': 0});
    }

    /**
     * Determine if the actor has a physical body
     * 
     * @returns true, if the actor can interact with the physical plane
     */
    get hasPhysicalBody() {
        return this.isCharacter() || this.isCritter() || this.isSpirit() || this.isVehicle();
    }

    /**
     * Reset damage, edge, etc. and prepare this actor for a new run.
     */
    async resetRunData() {
        console.log(`Shadowrun 5e | Resetting actor ${this.name} (${this.id}) for a new run`);
        
        const updateData: Record<string, any> = {};

        if (this.isCharacter() || this.isCritter() || this.isSpirit() || this.isVehicle()) {
            updateData['system.track.physical.value'] = 0;
            updateData['system.track.physical.overflow.value'] = 0;
        }

        if (this.isCharacter() || this.isCritter() || this.isSpirit()) {
            updateData['system.track.stun.value'] = 0;
        }

        if (this.isCharacter() || this.isCritter()) {
            updateData['system.attributes.edge.uses'] = this.getEdge().value;
        }

        if (this.isMatrixActor) await this.setMatrixDamage(0);
        if (updateData) await this.update(updateData);
    }

    /**
     * Will unequip all other items of the same type as the given item.
     * 
     * It's not necessary for the given item to be equipped.
     * 
     * @param unequipItem Input item that will be equipped while unequipping all others of the same type.
     */
    async equipOnlyOneItemOfType(unequipItem: SR5Item) {
        const sameTypeItems = this.items.filter(item => item.type === unequipItem.type);

        // If the given item is the only of it's type, allow unequipping.
        if (sameTypeItems.length === 1 && sameTypeItems[0].id === unequipItem.id) {
            await unequipItem.update({'system.technology.equipped': !unequipItem.isEquipped()});
            return
        }
        
        // For a set of items, assure only the selected is equipped.
        const updateData = sameTypeItems.map(item => ({
                _id: item.id,
                'system.technology.equipped': item.id === unequipItem.id
        }));

        await this.updateEmbeddedDocuments('Item', updateData);
    }

    /**
     * Transparently build a set of roll data based on this actors type and status.
     * 
     * Values for rolling can depend on other actors and items.
     * 
     * NOTE: Since getRollData is sync by default, we can´t retrieve compendium documents,
     *       resulting in fromUuidSync calls.
     * 
     * @param options System specific options influencing roll data.
     */
    override getRollData(options: RollDataOptions={}): any {
        // Avoid changing actor system data as Foundry just returns it.
        const rollData = foundry.utils.duplicate(super.getRollData());
        return ActorRollDataFlow.getRollData(this, rollData, options);
    }
}
