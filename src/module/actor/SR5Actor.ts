import { Helpers } from '../helpers';
import { SR5Item } from '../item/SR5Item';
import { FLAGS, SKILL_DEFAULT_NAME, SR, SYSTEM_NAME } from '../constants';
import { PartsList } from '../parts/PartsList';
import { DataDefaults } from '../data/DataDefaults';
import { SkillFlow } from "./flows/SkillFlow";
import { SR5 } from "../config";
import { CharacterPrep } from "./prep/CharacterPrep";
import { CritterPrep } from "./prep/CritterPrep";
import { SpiritPrep } from "./prep/SpiritPrep";
import { SpritePrep } from "./prep/SpritePrep";
import { VehiclePrep } from "./prep/VehiclePrep";
import { DocumentSituationModifiers } from "../rules/DocumentSituationModifiers";
import { SkillRules } from "../rules/SkillRules";
import { MatrixRules } from "../rules/MatrixRules";
import { ICPrep } from "./prep/ICPrep";
import { InventoryFlow } from "./flows/InventoryFlow";
import { ModifierFlow } from "./flows/ModifierFlow";
import { TestCreator } from "../tests/TestCreator";
import { AttributeOnlyTest } from "../tests/AttributeOnlyTest";
import { RecoveryRules } from "../rules/RecoveryRules";
import { CombatRules } from '../rules/CombatRules';
import { allApplicableDocumentEffects, allApplicableItemsEffects } from '../effects';
import { ConditionRules, DefeatedStatus } from '../rules/ConditionRules';
import { Translation } from '../utils/strings';
import { TeamworkMessageData } from './flows/TeamworkFlow';
import { SR5ActiveEffect } from '../effect/SR5ActiveEffect';
import AEChangeData = ActiveEffect.ChangeData;
import { ActionRollType, DamageType } from '../types/item/Action';
import { AttributeFieldType, AttributesType, EdgeAttributeFieldType } from '../types/template/Attributes';
import { VehicleStatsType } from '../types/actor/Vehicle';
import { LimitFieldType } from '../types/template/Limits';
import { KnowledgeSkillCategory, SkillFieldType } from '../types/template/Skills';
import { ConditionType } from '../types/template/Condition';
import { OverflowTrackType, TrackType } from '../types/template/ConditionMonitors';
import { ActorArmorType } from '../types/template/Armor';
import { InventoryType } from '../types/actor/Common';
import { SkillRollOptions } from '../types/rolls/ActorRolls';
import { FireModeType } from '../types/flags/ItemFlags';
import { MatrixType } from '../types/template/Matrix';
import { Migrator } from '../migrator/Migrator';
import { OverwatchStorage } from '../storage/OverwatchStorage';
import { MatrixFlow } from '../flows/MatrixFlow';
import { SuccessTest } from '../tests/SuccessTest';
import { DamageApplicationFlow } from './flows/DamageApplicationFlow';
import { MatrixNetworkFlow } from '../item/flows/MatrixNetworkFlow';
import { ActorMarksFlow } from './flows/ActorMarksFlow';
import { SetMarksOptions } from '../storage/MarksStorage';
import { ActorRollDataFlow } from './flows/ActorRollDataFlow';
import { MatrixICFlow } from './flows/MatrixICFlow';
import { RollDataOptions } from '../item/Types';

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
export class SR5Actor<SubType extends Actor.ConfiguredSubType = Actor.ConfiguredSubType> extends Actor<SubType> {
    // This is the default inventory name and label for when no other inventory has been created.
    defaultInventory: InventoryType = {
        name: 'Carried',
        type: '',
        label: 'SR5.Labels.Inventory.Carried',
        itemIds: [],
        showAll: true
    }
    // This is a dummy inventory
    allInventories: InventoryType = {
        name: 'All',
        type: '',
        label: 'SR5.Labels.Inventory.All',
        itemIds: [],
        showAll: true
    }

    // Allow users to access to tests creation.
    tests: typeof TestCreator = TestCreator;

    // Holds all operations related to this actors inventory.
    inventory: InventoryFlow;
    // Holds all operations related to fetching an actors modifiers.
    modifiers: ModifierFlow;

    // Quick access for all items of a type.
    itemsForType = new Map<Item.ConfiguredSubType, SR5Item[]>();

    constructor(data: Actor.CreateData, context?: Actor.ConstructionContext) {
        super(data, context);

        this.inventory = new InventoryFlow(this);
        this.modifiers = new ModifierFlow(this);
    }

    getOverwatchScore() {
        return OverwatchStorage.getOverwatchScore(this);
    }

    async setOverwatchScore(value) {
        return OverwatchStorage.setOverwatchScore(this, value);
    }

    static override migrateData(source: any) {
        Migrator.migrate("Actor", source);
        return super.migrateData(source);
    }

    override async update(
        data: Actor.UpdateData | undefined,
        operation?: Actor.Database.UpdateOperation,
    ) {
        await Migrator.updateMigratedDocument(this);
        return super.update(data, operation);
    }

    /**
     * General data preparation order.
     * Check base, embeddedEntities and derived methods (see super.prepareData implementation for order)
     * Only implement data preparation here that doesn't fall into the other three categories.
     */
    override prepareData() {
        super.prepareData();
        this.prepareItemsForType();
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

        if (this.isType('character'))
            CharacterPrep.prepareBaseData(this.system);
        else if (this.isType('critter'))
            CritterPrep.prepareBaseData(this.system);
        else if (this.isType('spirit'))
            SpiritPrep.prepareBaseData(this.system);
        else if (this.isType('sprite'))
            SpritePrep.prepareBaseData(this.system);
        else if (this.isType('vehicle'))
            VehiclePrep.prepareBaseData(this.system);
        else if (this.isType('ic'))
            ICPrep.prepareBaseData(this.system);
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
    override *allApplicableEffects() {
        for (const effect of allApplicableDocumentEffects(this, { applyTo: ['actor', 'targeted_actor'] })) {
            yield effect;
        }

        for (const effect of allApplicableItemsEffects(this, { applyTo: ['actor'] })) {
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
    override get temporaryEffects(): SR5ActiveEffect[] {
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

        const items = this.items as unknown as SR5Item[];
        // General actor data preparation has been moved to derived data, as it depends on prepared item data.
        if (this.isType('character'))
            CharacterPrep.prepareDerivedData(this.system, items);
        else if (this.isType('critter'))
            CritterPrep.prepareDerivedData(this.system, items);
        else if (this.isType('spirit'))
            SpiritPrep.prepareDerivedData(this.system, items);
        else if (this.isType('sprite'))
            SpritePrep.prepareDerivedData(this.system, items);
        else if (this.isType('vehicle'))
            VehiclePrep.prepareDerivedData(this.system, items);
        else if (this.isType('ic'))
            ICPrep.prepareDerivedData(this.system, items);
    }

    /**
     * Prepare simple to use hash maps to retrieve specific items quickly.
     * 
     * The typical map would match the item type to their items on this actor.
     */
    prepareItemsForType() {
        this.itemsForType = new Map();

        // Prepare with all item types to avoid errors beacuse an actor misses a type.
        for (const type of Object.keys(game.model.Item) as Item.ConfiguredSubType[]) {
            this.itemsForType.set(type, []);
        }

        for (const item of this.items) {
            const items = this.itemsForType.get(item.type) as any[];
            items.push(item);
            this.itemsForType.set(item.type, items);
        }
    }

    /**
     * NOTE: This method is unused at the moment, keep it for future inspiration.
     */
    applyOverrideActiveEffects() {
        const changes = this.effects.reduce((changes: AEChangeData[], effect) => {
            if (effect.disabled) return changes;

            // include changes partially matching given keys.
            const overrideChanges = effect.changes
                .filter(change => change.mode === CONST.ACTIVE_EFFECT_MODES.OVERRIDE)
                .map(origChange => {
                    const change: AEChangeData = {
                        key: String(origChange.key),
                        value: String(origChange.value),
                        mode: Number(origChange.mode) as CONST.ACTIVE_EFFECT_MODES,
                        priority: Number(origChange.priority ?? (Number(origChange.mode) * 10)),
                        effect: effect,
                    };
                    return change;
                });
            return changes.concat(overrideChanges);
        }, []);
        // Sort changes according to priority, in case it's ever needed.
        changes.sort((a, b) => a.priority! - b.priority!);

        for (const change of changes) {
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
    _applyActiveEffectChanges(changes: AEChangeData[]) {
        const overrides = {};

        for (const change of changes) {
            const result = change.effect.apply(this, change);
            if (result !== null) overrides[change.key] = result;
        }

        this.overrides = {...this.overrides, ...foundry.utils.expandObject(overrides)};
    }

    /**
     * Reduce all changes across multiple active effects that match the given set of partial keys
     * @param partialKeys Can either be complete keys or partial keys
     */
    _reduceEffectChangesByKeys(partialKeys: string[]): AEChangeData[] {
        // Collect only those changes matching the given partial keys.
        const changes = this.effects.reduce((changes: AEChangeData[], effect) => {
            if (effect.disabled) return changes;

            // include changes partially matching given keys.
            const overrideChanges = effect.changes
                .filter(change => partialKeys.some(partialKey => change.key.includes(partialKey)))
                .map(origChange => {
                    const change: AEChangeData = {
                        key: String(origChange.key),
                        value: String(origChange.value),
                        mode: Number(origChange.mode) as CONST.ACTIVE_EFFECT_MODES,
                        priority: Number(origChange.priority ?? (Number(origChange.mode) * 10)),
                        effect: effect
                    };
                    return change;
                });

            return changes.concat(overrideChanges);
        }, []);
        // Sort changes according to priority, in case it's ever needed.
        changes.sort((a, b) => a.priority! - b.priority!);

        return changes;
    }

    /**
     * Some actors have skills, some don't. While others don't have skills but derive skill values from their ratings.
     */
    findActiveSkill(skillName?: string): SkillFieldType | undefined {
        // Check for faulty to catch empty names as well as missing parameters.
        if (!skillName) return;

        // Handle legacy skills (name is id)
        const skills = this.getActiveSkills();
        const skill = skills[skillName];
        if (skill) return skill;

        // Handle custom skills (name is not id)
        return Object.values(skills).find(skill => skill.name === skillName);
    }

    findAttribute(id?: string): AttributeFieldType | undefined {
        if (id === undefined) return;
        const attributes = this.getAttributes();
        if (!attributes) return;
        return attributes[id];
    }

    findVehicleStat(statName: string): AttributeFieldType | undefined {
        return this.getVehicleStats()?.[statName];
    }

    findLimitFromAttribute(this: SR5Actor, attributeName?: string): LimitFieldType | undefined {
        if (attributeName === undefined) return undefined;
        const attribute = this.findAttribute(attributeName);
        if (!attribute?.limit) return undefined;
        return this.findLimit(attribute.limit);
    }

    findLimit(this: SR5Actor, limitName?: string): LimitFieldType | undefined {
        if (!limitName || !('limits' in this.system)) return undefined;
        return this.system.limits?.[limitName];
    }

    getWoundModifier(this: SR5Actor): number {
        if (!this.system.wounds?.value) return 0;
        return -1 * this.system.wounds.value;
    }

    /** Use edge on actors that have an edge attribute.
     *
     * NOTE: This doesn't only include characters but spirits, critters and more.
     */
    async useEdge(this: SR5Actor, by: number = -1) {
        const edge = this.getEdge();
        if (edge && edge.value === 0) return;
        // NOTE: There used to be a bug which could lower edge usage below zero. Let's quietly ignore and reset. :)
        const usesLeft = edge.uses > 0 ? edge.uses : by * -1;

        const uses = Math.min(edge.value, usesLeft + by);

        await this.update({ system: { attributes: { edge: { uses } } } });
    }

    getEdge(this: SR5Actor): EdgeAttributeFieldType {
        return this.system.attributes.edge;
    }

    /**
     * Return armor worn by this actor.
     * 
     * @param damage If given will be applied to the armor to get modified armor.
     * @returns Armor or modified armor.
     */
    getArmor(damage?: DamageType): ActorArmorType {
        // Prepare base armor data.
        const armor = !("armor" in this.system) ? 
            DataDefaults.createData('armor') :
            (foundry.utils.duplicate(this.system.armor) as ActorArmorType);
        // Prepare damage to apply to armor.
        damage = damage || DataDefaults.createData('damage');

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

    getMatrixDevice(this: SR5Actor): SR5Item | undefined {
        return this.system.matrix?.device ? this.items.get(this.system.matrix.device) : undefined;
    }

    /**
     * Reboot this actors living or device based persona.
     */
    async rebootPersona() {
        return MatrixFlow.rebootPersona(this);
    }

    /**
     * Given a persona actor, check if this persona is visible to this actor.
     * 
     * This can change change based on distance, if the persona is running silent and if it's been found
     * throuhgh matrix perception or other means.
     * 
     * TODO: Matrix Perception for silent personas
     * TODO: Visible through marks placed by silent persona on this actor
     * 
     * @param persona The persona to check visibility for.
     */
    matrixPersonaIsVisible(persona: SR5Actor) {
        const matrixData = this.matrixData();
        if (!matrixData) return false;

        const targetMatrixData = persona.matrixData();
        if (!targetMatrixData) return false;

        // Assume each actor only has the one token.
        const deckerToken = this.getToken();
        const targetToken = persona.getToken();
        if (!deckerToken || !targetToken) return false;

        // Compare host networks.
        if (persona.network?.isType('host') && persona.network.id !== this.network?.id) return false;

        // TODO: Compare distance with tokens that have been percieved through a matrix perception.
        const distance = Helpers.measureTokenDistance(deckerToken, targetToken);
        if (distance > 100) return false;

        // TODO: Compare running silent with tokens that have been percieved through a matrix perception
        // TODO: Compare running silent with tokens that have been found to have placed marks on this actor
        return !targetMatrixData.running_silent;        
    }

    getFullDefenseAttribute(this: SR5Actor): AttributeFieldType | undefined {
        if (this.isType('vehicle')) {
            return this.findVehicleStat('pilot');
        } else if (this.isType('character')) {
            let att = this.system.full_defense_attribute;
            if (!att) att = 'willpower';
            return this.findAttribute(att);
        }
        return undefined;
    }

    /**
     * Get the Attribute to add when making a Full Matrix Defense
     */
    getMatrixFullDefenseAttribute(this: SR5Actor): AttributeFieldType | undefined {
        if (this.isType('vehicle')) {
            return this.findVehicleStat('pilot');
        } else if (this.isType('character')) {
            let att = this.system.matrix_full_defense_attribute;
            if (!att) att = 'willpower';
            return this.findAttribute(att);
        }
        return undefined;
    }

    getEquippedWeapons(): SR5Item[] {
        return this.items.filter((item: SR5Item) => item.isEquipped() && item.isType('weapon'));
    }

    /**
     * Amount of recoil compensation this actor has available (without the weapon used).
     */
    recoilCompensation(this: SR5Actor): number {
        return this.system.values && "recoil_compensation" in this.system.values ? this.system.values.recoil_compensation.value : 0;
    }

    /**
     * Current recoil compensation with current recoil included.
     * 
     * @returns A positive number or zero.
    */
    get currentRecoilCompensation(): number {
        return Math.max(this.recoilCompensation() - this.recoil(), 0);
    }
    
    /**
     * Amount of progressive recoil this actor has accrued.
     */
    recoil(this: SR5Actor): number {
        return this.system.values && "recoil" in this.system.values ? this.system.values.recoil.value : 0;
    }

    getAttributes(this: SR5Actor): AttributesType {
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
    getAttribute(this:SR5Actor, name: string): AttributeFieldType {
        // First check vehicle stats, as they don't always exist.
        const stats = this.getVehicleStats();
        if (stats?.[name]) return stats[name];

        // Second check general attributes.
        const attributes = this.getAttributes();
        return attributes[name];
    }

    getLimit(this: SR5Actor, name: string): LimitFieldType | undefined {
        return this.system.limits?.[name];
    }

    isGrunt(this: SR5Actor): boolean {
        return Boolean(this.system.is_npc || this.system.npc?.is_grunt);
    }

    /** Return actor type, which can be different kind of actors from 'character' to 'vehicle'.
     *  Please check SR5ActorType for reference.
     */
    isType<ST extends readonly Actor.ConfiguredSubType[]>(this: SR5Actor, ...types: ST): this is SR5Actor<ST[number]> {
        return types.includes(this.type as ST[number]);
    }

    asType<ST extends readonly Actor.ConfiguredSubType[]>(this: SR5Actor, ...types: ST): SR5Actor<ST[number]> | undefined {
        return types.some((t) => this.isType(t)) ? this : undefined;
    }

    /**
     * Determine if this actor is able to have natural damage recovery.
     * @returns true in case of possible natural recovery.
     */
    get hasNaturalRecovery(): boolean {
        return this.isType('character', 'critter');
    }

    getVehicleTypeSkillName() {
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
        }
    }

    getVehicleTypeSkill(): SkillFieldType | undefined {
        if (!this.isType('vehicle')) return;

        const name = this.getVehicleTypeSkillName();
        return this.findActiveSkill(name);
    }

    get hasSkills(): boolean {
        return this.getSkills() !== undefined;
    }

    getSkills(this: SR5Actor): SR5Actor['system']['skills'] {
        return this.system.skills;
    }

    getActiveSkills(this: SR5Actor): SR5Actor['system']['skills']['active'] {
        return this.system.skills.active;
    }

    getMasterUuid(): string | undefined {
        if(!this.isType('vehicle')) return;

        return this.system.master;
    }

    async setMasterUuid(masterLink: string | undefined): Promise<void> {
        if(!this.isType('vehicle')) return;

        await this.update({ system: { master: masterLink }});
    }

    /**
     * Determine if this actor can be part of a network.
     */
    get canBeSlave(): boolean {
        return this.isType('vehicle');
    }

    /**
     * Determine if this actor can be a matrix icon.
     */
    get canBeMatrixIcon(): boolean {
        if (this.isType('vehicle')) return true;
        if (this.hasPersona) return true;

        return false;
    }

    /**
     * Determine if this actor is connected to any matrix network
     * @returns true, if connected to a network
     */
    get hasNetwork() {
        return MatrixNetworkFlow.isSlave(this);
    }

    /**
     * The network (host/grid) this matrix actor is connected to.
     */
    get network() {
        return MatrixNetworkFlow.getMaster(this);
    }

    /**
     * Connect this actor to a host / grid
     *
     * @param network Must be an item of matching type
     */
    async connectNetwork(network: SR5Item) {
        // General connection handling.
        await MatrixNetworkFlow.addSlave(network, this);

        // Actor type specific connection handling.
        switch (this.type) {
            case 'ic':
                await MatrixICFlow.connectToHost(network, this);
                break;
        }
    }

    /**
     * Disconnect this actor from a host / grid
     */
    async disconnectNetwork() {
        // General disconnection handling.
        await MatrixNetworkFlow.disconnectNetwork(this);

        // Actor type specific disconnection handling.
        switch (this.type) {
            case 'ic':
                await MatrixICFlow.disconnectFromHost(this);
                break;
        }
    }

    /**
     * Determine if this actors matrix icon is running silent.
     */
    isRunningSilent(): boolean {
        const matrixData = this.matrixData();
        if (!matrixData) return false;
        return matrixData.running_silent;
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
    isAwakened(this: SR5Actor): boolean {
        return this.system.special === 'magic';
    }

    /**
     * This actor is emerged as a matrix native actor (Technomancers, Sprites)
     *
     */
    isEmerged(this: SR5Actor): boolean {
        if (this.isType('sprite')) return true;
        if (this.isType('character') && this.system.special === 'resonance') return true;

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
    getPool(skillId: string, options = { specialization: false, byLabel: false }): number {
        const skill = options.byLabel ? this.getSkillByLabel(skillId) : this.getSkill(skillId);
        if (!skill?.attribute) return 0;
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
    getSkill(this: SR5Actor, id: string, options = { byLabel: false }): SkillFieldType | undefined {
        if (options.byLabel)
            return this.getSkillByLabel(id);

        const { skills } = this.system;

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

        return this.getSkillByLabel(id);
    }

    /**
     * Search all skills for a matching i18n translation label.
     * NOTE: You should use getSkill if you have the skillId ready. Only use this for ease of use!
     *
     * @param searchedFor The translated output of either the skill label (after localize) or name of the skill in question.
     * @return The first skill found with a matching translation or name.
     */
    getSkillByLabel(searchedFor: string): SkillFieldType | undefined {
        if (!searchedFor) return;

        const possibleMatch = (skill: SkillFieldType): string => skill.label ? game.i18n.localize(skill.label as Translation) : skill.name;

        const skills = this.getSkills();

        for (const [id, skill] of Object.entries(skills.language.value)) {
            if (searchedFor === possibleMatch(skill))
                return {...skill, id};
        }

        // Iterate over all different knowledge skill categories
        for (const categoryKey in skills.knowledge) {
            if (!skills.knowledge.hasOwnProperty(categoryKey)) continue;
            // TODO: check this function Typescript can't follow the flow here...
            const categorySkills = skills.knowledge[categoryKey].value as SkillFieldType[];
            for (const [id, skill] of Object.entries(categorySkills)) {
                if (searchedFor === possibleMatch(skill))
                    return { ...skill, id };
            }
        }

        for (const [id, skill] of Object.entries(skills.active)) {
            if (searchedFor === possibleMatch(skill))
                return { ...skill, id };
        }
        return undefined;
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
    async addKnowledgeSkill(
        this: SR5Actor,
        category: KnowledgeSkillCategory,
        skill: Partial<SkillFieldType> = { name: SKILL_DEFAULT_NAME }
    ): Promise<string|undefined> {
        if (!this.system.skills.knowledge.hasOwnProperty(category)) {
            console.error(`Shadowrun5e | Tried creating knowledge skill with unknown category ${category}`);
            return;
        }

        skill = DataDefaults.createData('skill_field', skill);
        const id = randomID(16);
        const value = {};
        value[id] = skill;
        await this.update({ system: { skills: { knowledge: { [category]: { value } } } } });

        return id;
    }

    /**
     * Add a new active skill.
     * 
     * @param skillData Partially define the SkillField properties needed. Omitted properties will be default.
     * @returns The new active skill id.
     */
    async addActiveSkill(skillData: Partial<SkillFieldType> = { name: SKILL_DEFAULT_NAME }): Promise<string | undefined> {
        const skill = DataDefaults.createData('skill_field', skillData);

        const activeSkillsPath = 'system.skills.active';
        const updateSkillDataResult = Helpers.getRandomIdSkillFieldDataEntry(activeSkillsPath, skill);

        if (!updateSkillDataResult) return;

        const { updateSkillData, id } = updateSkillDataResult;

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
    async removeKnowledgeSkill(skillId: string, category: KnowledgeSkillCategory) {
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
    async rollDeviceRating(this: SR5Actor, options?: Shadowrun.ActorRollOptions) {
        const rating = this.system.matrix?.rating || 0;

        const showDialog = this.tests.shouldShowDialog(options?.event);
        const testCls = this.tests._getTestClass('SuccessTest') as typeof SuccessTest;
        const test = new testCls(TestCreator._minimalTestData(), { actor: this }, { showDialog });

        // Build pool values.
        const pool = new PartsList<number>(test.pool.mod);
        pool.addPart('SR5.Labels.ActorSheet.DeviceRating', rating);
        pool.addPart('SR5.Labels.ActorSheet.DeviceRating', rating);


        // Build modifiers values.
        const mods = new PartsList<number>(test.data.modifiers.mod);
        mods.addUniquePart('SR5.ModifierTypes.Global', this.modifiers.totalFor('global'));

        return test.execute();
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
        return this.tests.fromPackAction(packName, actionName, this, {showDialog});
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

        return test.execute();
    }

    /**
     * Get an action as defined within the systems general action pack.
     * 
     * @param actionName The action with in the general pack.
     * @param options Success Test options 
     */
    async generalActionTest(actionName: Shadowrun.PackActionName, options?: Shadowrun.ActorRollOptions) {
        return this.packActionTest(SR5.packNames.GeneralActionsPack as Shadowrun.PackName, actionName, options);
    }

    /**
     * Get an action as defined within the systems general action pack.
     *
     * @param actionName The action with in the general pack.
     * @param options Success Test options
     */
    async matrixActionTest(actionName: Shadowrun.PackActionName, options?: Shadowrun.ActorRollOptions) {
        return this.packActionTest(SR5.packNames.MatrixActionsPack as Shadowrun.PackName, actionName, options);
    }

    /**
     * Roll an action as defined within the systems general action pack.
     *
     * @param actionName The action with in the general pack.
     * @param options Success Test options
     */
    async rollGeneralAction(actionName: Shadowrun.PackActionName, options?: Shadowrun.ActorRollOptions) {
            const generalPackName = Helpers.getGeneralActionsPackName();
        return this.rollPackAction(generalPackName, actionName, options);
    }

    /**
     * Roll an action as defined within the systems matrix action pack.
     *
     * @param actionName The action with in the general pack.
     * @param options Success Test options
     */
    async rollMatrixAction(actionName: Shadowrun.PackActionName, options?: Shadowrun.ActorRollOptions) {
        return this.rollPackAction(SR5.packNames.MatrixActionsPack as Shadowrun.PackName, actionName, options);
    }

    /**
     * Roll a skill test for a specific skill
     * @param skillId The id or label for the skill. When using a label, the appropriate option must be set.
     * @param options Optional options to configure the roll.
     * @param options.byLabel true to search the skill by label as displayed on the sheet.
     * @param options.specialization true to configure the skill test to use a specialization.
     */
    async rollSkill(skillId: string, options: SkillRollOptions={}) {
        console.info(`Shadowrun5e | Rolling skill test for ${skillId}`);

        const action = this.skillActionData(skillId, options);
        if (!action) return;
        if(options.threshold) {
            action.threshold = options.threshold
        }

        const showDialog = this.tests.shouldShowDialog(options.event);
        const test = await this.tests.fromAction(action, this, {showDialog});
        if (!test) return;

        return test.execute();
    }

    /**
     * Roll a general attribute test with one or two attributes.
     *
     * @param name The attributes name as defined within data
     * @param options Change general roll options.
     */
    async rollAttribute(name, options: Shadowrun.ActorRollOptions = {}) {
        console.info(`Shadowrun5e | Rolling attribute ${name} test from ${this.constructor.name}`);

        // Prepare test from action.
        const action = DataDefaults.createData('action_roll', {attribute: name, test: AttributeOnlyTest.name});
        const showDialog = this.tests.shouldShowDialog(options.event);
        const test = await this.tests.fromAction(action, this, { showDialog });
        if (!test) return;

        return test.execute();
    }

    /**
     * Roll an item action for this actor.
     * @param item The item action to roll
     * @param options General Roll options.
     */
    async rollItem(item: SR5Item, options: Shadowrun.ActorRollOptions = {}) {
        const showDialog = this.tests.shouldShowDialog(options.event);
        const test = await this.tests.fromItem(item, this, { showDialog });
        if (!test) return;

        return test.execute();
    }

    /**
     * Get a test from an item and let the caller handle execution.
     * @param item The action item to create the test from
     * @param options General roll options
     * @returns A test instance ready for execution.
     */
    async testFromItem(item: SR5Item, options: Shadowrun.ActorRollOptions = {}) {
        const showDialog = this.tests.shouldShowDialog(options.event);
        return this.tests.fromItem(item, this, { showDialog});
    }

    /**
     * Roll a skill test for a specific skill
     * @param skillId The id or label for the skill. When using a label, the appropriate option must be set.
     * @param options Optional options to configure the roll.
     * @param options.byLabel true to search the skill by label as displayed on the sheet.
     * @param options.specialization true to configure the skill test to use a specialization.
     */
    async startTeamworkTest(skillId: string, options: SkillRollOptions = {}) {
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
        const content = await renderTemplate('systems/shadowrun5e/dist/templates/rolls/teamwork-test-message.hbs', templateData);
        // Prepare the actual message.
        const messageData =  {
            user: game.user?.id,
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
    async rollTeamworkTest(skillId: string, teamworkData: TeamworkMessageData, options: SkillRollOptions = {}) {
        console.info(`Shadowrun5e | Rolling teamwork test for ${skillId}`);

        const action = this.skillActionData(skillId, options);
        if (!action) return;
        if (!teamworkData.criticalGlitch) {
            action.limit.mod.push({ name: "Teamwork", value: teamworkData.additionalLimit })
        }

        action.dice_pool_mod.push({ name: "Teamwork", value: teamworkData.additionalDice })

        const showDialog = this.tests.shouldShowDialog(options.event);
        const test = await this.tests.fromAction(action, this, {showDialog});
        if (!test) return;

        return test.execute();
    }

    /**
     * Is the given attribute id a matrix attribute
     * @param attribute
     */
    _isMatrixAttribute(attribute: string): boolean {
        return SR5.matrixAttributes.hasOwnProperty(attribute);
    }

    /**
     * Add matrix modifier values to the given modifier parts from whatever Value as part of 
     * matrix success test.
     * 
     * @param parts The Value.mod field as a PartsList
     * @param atts The attributes used for the success test.
     */
    _addMatrixParts(this: SR5Actor, parts: PartsList<number>, atts) {
        if (Helpers.isMatrix(atts)) {
            if (!this.system.matrix) return;

            // Apply general matrix modifiers based on commlink/cyberdeck status.
            const matrix = this.system.matrix;
            if (matrix.hot_sim) parts.addUniquePart('SR5.HotSim', 2);
            if (matrix.running_silent) parts.addUniquePart('SR5.RunningSilent', -2);
        }
    }

    /**
     * Remove matrix modifier values to the given modifier part
     * 
     * @param parts A Value.mod field as a PartsList
     */
    _removeMatrixParts(parts: PartsList<number>) {
        ['SR5.HotSim', 'SR5.RunningSilent'].forEach(part => parts.removePart(part));
    }

    /**
     * Build an action for the given skill id based on it's configured values.
     *
     * @param skillId Any skill, no matter if active, knowledge or language
     * @param options
     */
    skillActionData(skillId: string, options: SkillRollOptions = {}): ActionRollType | undefined {
        const byLabel = options.byLabel || false;
        const skill = this.getSkill(skillId, { byLabel });
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

        return DataDefaults.createData('action_roll', {
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
     * Returns the most appropriate token document for the actor.
     *
     * Priority:
     * 1. Synthetic token (if this actor is synthetic).
     * 2. A controlled linked token on the canvas.
     * 3. Any linked token on the canvas.
     * 4. Null if no token is available.
     *
     * @returns The token document if available, otherwise null.
     */
    getToken(): TokenDocument | null {
        // This is a synthetic actor, return its token.
        if (this.token) return this.token;

        const linkedTokens = this.getActiveTokens(true);
        const controlled = canvas.tokens?.controlled?.find(t => linkedTokens.includes(t));

        // controlled & linked -> linked
        return controlled?.document ?? linkedTokens[0]?.document ?? null;
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

    __addDamageToTrackValue(damage: DamageType, track: TrackType | OverflowTrackType | ConditionType): TrackType | OverflowTrackType | ConditionType {
        if (damage.value === 0) return track;
        if (track.value === track.max) return track;

        //  Avoid cross referencing.
        track = foundry.utils.duplicate(track) as TrackType | OverflowTrackType | ConditionType;

        track.value += damage.value;
        if (track.value > track.max) {
            // dev error, not really meant to be ever seen by users. Therefore no localization.
            console.error("Damage did overflow the track, which shouldn't happen at this stage. Damage has been set to max. Please use applyDamage.")
            track.value = track.max;
        }

        return track;
    }

    async _addDamageToDeviceTrack(damage: DamageType, device: SR5Item) {
        if (!device) return;

        let condition = device.getCondition();
        if (!condition) return damage;

        if (damage.value === 0) return;
        if (condition.value === condition.max) return;

        condition = this.__addDamageToTrackValue(damage, condition);

        await device.update({ system: { technology: { condition_monitor: condition } } });
        return;
    }

    /**
     * Apply damage to an actors main damage monitor / track.
     * 
     * This includes physical and stun for meaty actors and matrix for matrix actors.
     * 
     * Applying damage will also reduce the initiative score of an active combatant.
     * 
     * Handles rule 'Changing Initiative' on SR5#160.
     * 
     * @param damage The damage to be taken.
     * @param track The track to apply that damage to.
     */
    async _addDamageToTrack(damage: DamageType, track: TrackType | OverflowTrackType | ConditionType) {
        if (damage.value === 0) return;
        if (track.value === track.max) return;

        // Allow a wound modifier difference to be calculated after damage has been dealt.
        const woundsBefore = this.getWoundModifier();

        // Apply damage to track and trigger derived value calculation.
        track = this.__addDamageToTrackValue(damage, track);
        await this.update({ system: { track: { [damage.type.value]: track } } });

        // Apply any wounds modifier delta to an active combatant.
        const woundsAfter = this.getWoundModifier();
        const iniAdjustment = CombatRules.initiativeScoreWoundAdjustment(woundsBefore, woundsAfter);

        // Only actors that can have a wound modifier, will have a delta.
        if (iniAdjustment < 0 && game.combat) await game.combat.adjustActorInitiative(this, iniAdjustment);
    }

    /**
     * Apply damage to an actors physical overflow damage monitor / track.
     * 
     * @param damage The damage to overflow.
     * @param track The track to overflow the damage into.
     * @returns 
     */
    async _addDamageToOverflow(damage: DamageType, track: OverflowTrackType) {
        if (damage.value === 0) return;
        if (track.overflow.value === track.overflow.max) return;

        //  Avoid cross referencing.
        const overflow = foundry.utils.duplicate(track.overflow);

        // Don't over apply damage to the track overflow.
        overflow.value += damage.value;
        overflow.value = Math.min(overflow.value, overflow.max);

        await this.update({ system: { track: { [damage.type.value]: { overflow } } } });
    }

    /**
     * Heal damage on a given damage track. Be aware that healing damage doesn't equate to recovering damage
     * and will not adhere to the recovery rules.
     *
     * @param track What track should be healed?
     * @param healing How many boxes of healing should be done?
     */
    async healDamage(this: SR5Actor, track: DamageType['type']['value'], healing: number) {
        console.log(`Shadowrun5e | Healing ${track} damage of ${healing} for actor`, this);

        if (!this.system?.track?.[track]) return;
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
    async addDamage(damage: DamageType) {
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
        return DamageApplicationFlow.setMatrixDamage(this, value);
    }

    getStunTrack(this: SR5Actor): TrackType | undefined {
        return this.system.track && 'stun' in this.system.track ? this.system.track.stun : undefined;
    }

    getPhysicalTrack(this: SR5Actor): OverflowTrackType | undefined {
        return this.system.track && 'physical' in this.system.track ? this.system.track.physical : undefined;
    }

    /**
     * The matrix depends on actor type and possibly equipped matrix device.
     *
     * Use this method for whenever you need to access this actors matrix damage track as it's source might differ.
     */
    getMatrixTrack(this: SR5Actor): ConditionType | undefined {
        // Some actors will have a direct matrix track.
        if (this.system.track && "matrix" in this.system.track)
            return this.system.track.matrix;

        // Some actors will have a personal matrix condition monitor, like a device condition monitor.
        if (this.system.matrix)
            return this.system.matrix.condition_monitor;

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

        defeated ??= ConditionRules.determineDefeatedStatus(this);

        // Remove unapplicable defeated token status.
        await this.removeDefeatedStatus(defeated);

        // Apply the appropriate combatant status.
        if (defeated.unconscious || defeated.dying || defeated.dead) {
            await this.combatant?.update({ defeated: true });
        } else {
            await this.combatant?.update({ defeated: false });
            return;
        }
        const newStatus = defeated.dead ? 'dead' : 'unconscious';
        const effect = CONFIG.statusEffects.find(e => e.id === newStatus);

        // Avoid applying defeated status multiple times.
        if (!effect || this.effects.some(e => e.statuses.size === 1 && e.statuses.has(effect.id)))
            return;

        // Set effect as active, as we've already made sure it isn't.
        await token.object?.toggleEffect(effect, { overlay: true, active: true });
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
            const existing = this.effects.reduce<string[]>((arr, e) => {
                if ((e.statuses.size === 1) && e.statuses.some(status => removeStatus.includes(status)) ) arr.push(e.id as string);
                    return arr; 
            }, []);

            if (existing.length) await this.deleteEmbeddedDocuments('ActiveEffect', existing);
        }
    }

    getModifiedArmor(damage: DamageType): ActorArmorType {
        if (!damage.ap?.value) {
            return this.getArmor();
        }

        const modified = foundry.utils.duplicate(this.getArmor()) as ActorArmorType;
        if (modified) {
            modified.mod = PartsList.AddUniquePart(modified.mod, 'SR5.DV', damage.ap.value);
            modified.value = Helpers.calcTotal(modified, { min: 0 });
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

        const combat = game.combat!;
        const combatant = combat.getActorCombatant(this);

        // Token might not be part of active combat.
        if (!combatant?.initiative) return;

        // While not prohibiting, inform user about missing resource.
        if (combatant.initiative + modifier < 0) {
            ui.notifications?.warn('SR5.MissingRessource.Initiative', {localize: true});
        }

        await combat.adjustInitiative(combatant, modifier);
    }

    /**
     * Determine if this actor is an active combatant in the current combat.
     * 
     * @returns true if the actor is a combatant with an initiative score, false otherwise.
     */
    get combatActive(): boolean {
        if (!game.combat) return false;
        const combatant = game.combat.getActorCombatant(this);
        return !!(combatant && typeof combatant.initiative === "number");
    }

    get combatant() {
        if (!this.combatActive || !game.combat) return null;
        return game.combat.getActorCombatant(this);
    }

    /**
     * Return the initiative score for a currently active combat
     * 
     * @returns The score or zero.
     */
    get combatInitiativeScore(): number {
        if (!game.combat) return 0;
        const combatant = game.combat.getActorCombatant(this);
        return combatant?.initiative ?? 0;
    }

    getVehicleStats(this: SR5Actor) {
        return this.system.vehicle_stats;
    }

    /** Add another actor as the driver of a vehicle to allow for their values to be used in testing.
     *
     * @param uuid An actors id. Should be a character able to drive a vehicle
     */
    async addVehicleDriver(uuid: string) {
        if (!this.isType('vehicle')) return;

        const driver = await fromUuid(uuid) as SR5Actor;
        if (!driver) return;

        // NOTE: In THEORY almost all actor types can drive a vehicle.
        // ... drek, in theory a drone could drive another vehicle even...

        await this.update({ system: { driver: driver.id } });
    }

    async removeVehicleDriver() {
        if (!this.isType('vehicle') || !this.hasDriver()) return;
        await this.update({ system: { driver: '' } });
    }

    hasDriver(): boolean {
        if (!this.isType('vehicle')) return false;

        return this.system.driver.length > 0;
    }

    getVehicleDriver(): SR5Actor | undefined {
        if (!this.isType('vehicle') || !this.hasDriver()) return;

        const driver = game.actors?.get(this.system.driver) as SR5Actor;
        // If no driver id is set, we won't get an actor and should explicitly return undefined.
        if (!driver) return;
        return driver;
    }

    /**
     * Will return true if this ic type actor has been connected to a host.
     */
    hasHost(): boolean {
        if (!this.isType('ic')) return false;
        return MatrixNetworkFlow.isSlave(this);
    }

    /*
     * Is this actor currently using the VR matrix mode?
     */
    get isUsingVR(): boolean {
        const matrixData = this.matrixData();
        if (!matrixData) return false;
        return matrixData.vr;
    }

    /*
     * Is this actor currently using VR hot sim?
     *
     * An actor must be using VR to be able to use hot sim.
     */
    get isUsingHotSim(): boolean {
        if (!this.isUsingVR) return false;
        const matrixData = this.matrixData();
        if (!matrixData) return false;
        return matrixData.hot_sim;
    }

    /*
     * Is this actors persona currently being link locked?
     */
    get isLinkLocked(): boolean {
        const matrixData = this.matrixData();
        if (!matrixData) return false;
        return matrixData.link_locked;
    }

    /**
     * Add an actor as this spirit actor's summoner.
     * @param actor A character actor to be used as summoner
     */
    async addSummoner(actor: SR5Actor) {
        if (!this.isType('spirit') || !actor.isType('character')) return;
        await this.update({ system: { summonerUuid: actor.uuid } });
    }

    /**
     * Remove a summoner from this spirit actor.
     */
    async removeSummoner() {
        if (!this.isType('spirit')) return;
        await this.update({ system: { summonerUuid: null } });
    }

    /**
     * Add an actor as this sprites technomancers.
     * @param actor A character actor to be used as technomancer
     */
    async addTechnomancer(actor: SR5Actor) {
        if (!this.isType('sprite') || !actor.isType('character')) return;
            await this.update({ system: { technomancerUuid: actor.uuid } });
    }

    /**
     * Remove a technomancer from this sprite actor.
     */
    async removeTechnomancer() {
        if (!this.isType('sprite')) return;
            await this.update({ system: { technomancerUuid: '' } });
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
    get isMatrixActor() {
        return 'matrix' in this.system;
    }

       /**
     * Check if the current actor has a Matrix persona.
     */
    get hasPersona(): boolean {
        return this.hasActorPersona || this.hasDevicePersona;
    }

    /**
     * Check if the current actor is a matrix first class citizen.
     *
     * @returns true, when the actor lives in the matrix.
     */
    get hasActorPersona(): boolean {
        return this.isType('vehicle', 'ic') || this.isEmerged();
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
        return !this.hasDevicePersona && this.isEmerged();
    }

    /**
     * Retrieve all matrix devices of this actor that are equipped and set to wireless.
     */
    get wirelessDevices() {
        return this.items.filter(item => item.isMatrixDevice && item.isEquipped() && item.isWireless());
    }

    matrixData(this: SR5Actor) {
        return this.system.matrix;
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
    async setMarks(target: SR5Actor | SR5Item | undefined, marks: number, options: SetMarksOptions = {}) {
        await ActorMarksFlow.setMarks(this, target, marks, options);
    }

    /**
     * Remove ALL marks placed by this actor and maybe disconnect from host / grid if necessary.
     */
    async clearMarks() {
        // Keep marks for later use
        const marks = this.marksData;
        await ActorMarksFlow.clearMarks(this);

        // Check if marks have been used to connect to host/grid
        // TODO: Refactor into MatrixNetworkFlow
        const network = this.network;
        if (!network) return;
        if (!marks) return;

        for (const { uuid } of marks)
            if (network.uuid === uuid)
                return this.disconnectNetwork();
    }

    /**
     * Remove ONE mark. If you want to delete all marks, use clearMarks instead.
     */
    async clearMark(uuid: string) {
        await ActorMarksFlow.clearMark(this, uuid);

        // Check if marks have been used to connect to host/grid
        // TODO: Refactor into MatrixNetworkFlow
        const network = this.network;
        if (!network) return;

        if (this.network?.uuid === uuid)
            return this.disconnectNetwork();
    }

    /**
     * Get all marks placed by this actor.
     * @returns
     */
    get marksData() {
        return this.matrixData()?.marks;
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
    async _getDocumentWithMarks(): Promise<SR5Actor | SR5Item | undefined | null> {
        // CASE - IC marks are stored on their host item.
        if (this.isType('ic')) {
            return this.network;
        }
        // CASE - Vehicle marks are stored on their master actor.
        if (this.isType('vehicle')) {
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
    get master(): SR5Item | null {
        return MatrixNetworkFlow.getMaster(this);
    }

    /**
     * Retrieve all documents this actor has a mark placed on, directly or indirectly.
     */
    async getAllMarkedDocuments(): Promise<Shadowrun.MarkedDocument[]> {
        const marksDevice = await this._getDocumentWithMarks();
        if (!marksDevice) return [];
        const marks = marksDevice.marksData;
        if (!marks) return [];

        return ActorMarksFlow.getMarkedDocuments(marks);
    }

    /**
     * How many previous attacks has this actor been subjected to?
     * 
     * @returns A positive number or zero.
     */
    previousAttacks(this: SR5Actor): number {
        return Math.max('multi_defense' in this.system.modifiers ? this.system.modifiers.multi_defense * -1 : 0, 0);
    }

    /**
     * Apply a new consecutive defense multiplier based on the amount of attacks given
     * 
     * @param previousAttacks Attacks within a combat turn. If left out, will guess based on current modifier.
     */
    async calculateNextDefenseMultiModifier(previousAttacks: number = this.previousAttacks()) {
        console.debug('Shadowrun 5e | Applying consecutive defense modifier for. Last amount of attacks: ', previousAttacks);

        const automateDefenseMod = game.settings.get(SYSTEM_NAME, FLAGS.AutomateMultiDefenseModifier);
        if (!automateDefenseMod || !this.combatActive) return;

        const multiDefenseModi = CombatRules.defenseModifierForPreviousAttacks(previousAttacks + 1);
        await this.update({ system: { modifiers: { multi_defense: multiDefenseModi } } });
    }

    /**
     * Remove the consecutive defense per turn modifier.
     */
    async removeDefenseMultiModifier(this: SR5Actor) {
        const automateDefenseMod = game.settings.get(SYSTEM_NAME, FLAGS.AutomateMultiDefenseModifier);
        if (!automateDefenseMod || !this.combatActive) return;

        if (!('multi_defense' in this.system.modifiers) || this.system.modifiers.multi_defense === 0) return;

        console.debug('Shadowrun 5e | Removing consecutive defense modifier.', this);
        await this.update({ system: { modifiers: { multi_defense: 0 } } });
    }

    /**
     * Add a firemode recoil to the progressive recoil.
     * 
     * @param fireMode Ranged Weapon firemode used to attack with.
     */
    async addProgressiveRecoil(fireMode: FireModeType) {
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
        const base = this.recoil() + additional;
        await this.update({ system: { values: { recoil: { base } } } });
    }

    /**
     * Clear whatever progressive recoil this actor holds.
     */
    async clearProgressiveRecoil() {
        if (!this.hasPhysicalBody) return;
        if (this.recoil() === 0) return;
        await this.update({ system: { values: { recoil: { base: 0 } } } });
    }

    /**
     * Determine if the actor has a physical body
     * 
     * @returns true, if the actor can interact with the physical plane
     */
    get hasPhysicalBody(): boolean {
        return this.isType('character', 'critter', 'spirit', 'vehicle');
    }

    /**
     * Reset damage, edge, etc. and prepare this actor for a new run.
     */
    async resetRunData() {
        console.log(`Shadowrun 5e | Resetting actor ${this.name} (${this.id}) for a new run`);
        
        const updateData: Record<string, any> = {};

        if (this.isType('character', 'critter', 'spirit', 'vehicle')) {
            updateData['system.track.physical.value'] = 0;
            updateData['system.track.physical.overflow.value'] = 0;
        }

        if (this.isType('character', 'critter', 'spirit')) {
            updateData['system.track.stun.value'] = 0;
        }

        if (this.isType('character', 'critter')) {
            updateData['system.attributes.edge.uses'] = this.getEdge().value;
        }

        if (this.isMatrixActor) await this.setMatrixDamage(0);
        if (updateData) await this.update(updateData);

        return this.clearMarks();
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
            await unequipItem.update({ system: { technology: { equipped: !unequipItem.isEquipped() } } });
            return
        }
        
        // For a set of items, assure only the selected is equipped.
        await this.updateEmbeddedDocuments('Item', sameTypeItems.map(item => ({
            _id: item.id,
            system: { technology: { equipped: item.id === unequipItem.id } }
        })));
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
    override getRollData(options: RollDataOptions = {}) {
        // Avoid changing actor system data as Foundry just returns it.
        const rollData = foundry.utils.duplicate(super.getRollData());
        return ActorRollDataFlow.getRollData(this, rollData, options);
    }

    /**
     * Get the amount of damage each extra mark does when getting attacked in the matrix
     */
    getExtraMarkDamageModifier() {
        return 2;
    }
}
