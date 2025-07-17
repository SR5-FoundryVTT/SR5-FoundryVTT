import { Action, ActionRollData, DamageData, MinimalActionData } from "../types/item/Action";
import { AttributeField } from "../types/template/Attributes";
import { ValueField } from "../types/template/Base";
import { ConditionData } from "../types/template/Condition";
import { DescriptionData } from "../types/template/Description";
import { FireModeData } from "../types/flags/ItemFlags";
import { Host, SourceEntityField } from "../types/item/Host";
import { LimitField } from "../types/template/Limits";
import { SkillField } from "../types/template/Skills";
import { TechnologyData } from "../types/template/Technology";
import { Track } from "../types/template/ConditionMonitors";
import { RangeData, RangeWeaponData, Weapon } from "../types/item/Weapon";

import { Character } from "../types/actor/Character";
import { Critter } from "../types/actor/Critter";
import { IC } from "../types/actor/IC";
import { Spirit } from "../types/actor/Spirit";
import { Sprite } from "../types/actor/Sprite";
import { Vehicle } from "../types/actor/Vehicle";

import { AdeptPower } from "../types/item/AdeptPower";
import { Ammo } from "../types/item/Ammo";
import { Armor } from "../types/item/Armor";
import { Bioware } from "../types/item/Bioware";
import { CallInAction } from "../types/item/CallInAction";
import { ComplexForm } from "../types/item/ComplexForm";
import { Contact } from "../types/item/Contact";
import { CritterPower } from "../types/item/CritterPower";
import { Cyberware } from "../types/item/Cyberware";
import { Device } from "../types/item/Device";
import { Echo } from "../types/item/Echo";
import { Equipment } from "../types/item/Equipment";
import { Lifestyle } from "../types/item/Lifestyle";
import { Metamagic } from "../types/item/Metamagic";
import { Modification } from "../types/item/Modification";
import { MovementField } from "../types/template/Movement";
import { Program } from "../types/item/Program";
import { Quality } from "../types/item/Quality";
import { Ritual } from "../types/item/Ritual";
import { LicenseData, Sin } from "../types/item/Sin";
import { Spell } from "../types/item/Spell";
import { SpritePower } from "../types/item/SpritePower";

import { ActorArmorData } from "../types/template/Armor";

import DataSchema = foundry.data.fields.DataSchema;
const { SchemaField } = foundry.data.fields;

const systemMap = {
    character: Character,
    critter: Critter,
    ic: IC,
    spirit: Spirit,
    sprite: Sprite,
    vehicle: Vehicle,

    action: Action,
    adept_power: AdeptPower,
    ammo: Ammo,
    armor: Armor,
    bioware: Bioware,
    call_in_action: CallInAction,
    complex_form: ComplexForm,
    contact: Contact,
    critter_power: CritterPower,
    cyberware: Cyberware,
    device: Device,
    echo: Echo,
    equipment: Equipment,
    host: Host,
    lifestyle: Lifestyle,
    metamagic: Metamagic,
    modification: Modification,
    program: Program,
    quality: Quality,
    ritual: Ritual,
    sin: Sin,
    spell: Spell,
    sprite_power: SpritePower,
    weapon: Weapon,
} as const;

export type SystemEntityType = keyof typeof systemMap;
export type SystemConstructorArgs<T extends SystemEntityType> = ConstructorParameters<typeof systemMap[T]>[0];
export type SystemByType<T extends SystemEntityType> = InstanceType<typeof systemMap[T]>;

const schemaMap = {
    action_roll: ActionRollData,
    armor: ActorArmorData,
    attribute_field: AttributeField,
    condition_monitor: ConditionData,
    damage: DamageData,
    description: DescriptionData,
    fire_mode: FireModeData,
    license: LicenseData,
    limit_field: LimitField,
    minimal_action: MinimalActionData,
    movement_field: MovementField,
    range: RangeData,
    range_weapon: RangeWeaponData,
    skill_field: SkillField,
    source_entity_field: SourceEntityField,
    technology: TechnologyData,
    track: Track,
    value_field: ValueField,
} as const;

type schemaCreateData = {
    [K in keyof typeof schemaMap]: foundry.data.fields.SchemaField.CreateData<ReturnType<typeof schemaMap[K]>>;
};

type schemaInitializedData = {
    [K in keyof typeof schemaMap]: foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof schemaMap[K]>>;
};


/**
 * Data Defaults are used for partial template data that can't easily be gotten by instead
 * using game.model.Item.<type>.<whatver> or game.mode.Actor.<type>.<whatever>
 * 
 * This is mostly the case when the system doesn't define data in the system template
 * for fields like track, skill that aren't known during document creation by Foundry.
 * 
 */
export class DataDefaults {    
    /**
     * Creates and initializes data for a given schema key.
     *
     * @template K - The key of the schema to use, constrained to the keys of `schemaMap`.
     * @param key - The schema key for which to create data.
     * @param createData - Optional initial data to populate the schema with. Defaults to an empty object.
     * @returns The initialized data object conforming to the schema associated with the provided key.
     */
    static createData<K extends keyof typeof schemaMap>(
        key: K,
        createData: schemaCreateData[K] = {}
    ): schemaInitializedData[K] {
        const schema = schemaMap[key]() as DataSchema;
        const initialValue = new SchemaField(schema).getInitialValue(createData);
        return foundry.utils.mergeObject(initialValue, createData) as schemaInitializedData[K];
    }

    /**
     * Creates and returns a new instance of a system data class based on the provided entity type.
     *
     * @template EntityType - The type of system entity for which to create the data instance.
     * @param entity - The entity type used to select the appropriate system data class from the system map.
     * @param createData - Optional. An object containing initial data to pass to the system data class constructor.
     * @returns An instance of the system data class corresponding to the specified entity type, typed as `CombinedSystemOfType<EntityType>`.
     *
     * @remarks
     * This method utilizes a mapping (`systemMap`) from entity types to their corresponding system data classes.
     * It is useful for generating default or initial system data objects for various entity types in a type-safe manner.
     */
    static baseSystemData<EntityType extends SystemEntityType>(
        entity: EntityType,
        createData: SystemConstructorArgs<EntityType> = {}
    ): ReturnType<SystemByType<EntityType>['toObject']> {
        return new (systemMap[entity] as any)(createData).toObject();
    }
}
