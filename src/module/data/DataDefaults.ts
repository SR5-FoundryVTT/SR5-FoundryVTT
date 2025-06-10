import FireModeData = Shadowrun.FireModeData;
import DataSchema = foundry.data.fields.DataSchema;
import { Action, ActionRollData, DamageData, MinimalActionData } from "../types/item/Action";
import { AttributeField } from "../types/template/Attributes";
import { DescriptionData } from "../types/template/Description";
import { LimitField } from "../types/template/Limits";
import { RangeData, Weapon } from "../types/item/Weapon";
import { ConditionData } from "../types/template/Condition";
import { SkillField } from "../types/template/Skills";
import { Host, SourceEntityField } from "../types/item/Host";
import { TechnologyData } from "../types/template/Technology";
import { Track } from "../types/template/ConditionMonitors";
import { ValueField } from "../types/template/Base";

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
import { Lifestyle } from "../types/item/LifeStyle";
import { Metamagic } from "../types/item/Metamagic";
import { Modification } from "../types/item/Modification";
import { MovementField } from "../types/template/Movement";
import { Program } from "../types/item/Program";
import { Quality } from "../types/item/Quality";
import { Ritual } from "../types/item/Ritual";
import { Sin } from "../types/item/Sin";
import { Spell } from "../types/item/Spell";
import { SpritePower } from "../types/item/SpritePower";

import { ActorArmorData } from "../types/template/Armor";
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

const schemaMap = {
    action_roll: ActionRollData,
    armor: ActorArmorData,
    attribute_field: AttributeField,
    condition_monitor: ConditionData,
    damage: DamageData,
    description: DescriptionData,
    limit_field: LimitField,
    minimal_action: MinimalActionData,
    movement_field: MovementField,
    range: RangeData,
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

type CombinedSystemOfType<T extends string> =
    T extends Actor.SubType ? Actor.SystemOfType<T> :
    T extends Item.SubType ? Item.SystemOfType<T> :
    never;


/**
 * Data Defaults are used for partial template data that can't easily be gotten by instead
 * using game.model.Item.<type>.<whatver> or game.mode.Actor.<type>.<whatever>
 * 
 * This is mostly the case when the system doesn't define data in the system template
 * for fields like track, skill that aren't known during document creation by Foundry.
 * 
 */
export class DataDefaults {

    static baseSystemData<EntityType extends SystemEntityType>(
        entity: EntityType,
        createData: object = {}
    ): CombinedSystemOfType<EntityType> {
        return new (systemMap[entity] as any)(createData) as CombinedSystemOfType<EntityType>;
    }

    /**
     * Return a base item data structure with minimal necessary FoundryVTT ItemDataModel fields.
     * 
     * @param name Whatever name you want to give but not ''.
     * @param type Whatever item type you want to have
     * @param systemData Whatever partial item system data you want to inject into general model system data.
     * @returns A minimum viable item data structure to use with Item#create
     */
    static baseEntityData<Type extends SystemEntityType>(
        entityType: Type,
        createData: Actor.CreateData | Item.CreateData = {},
        systemData: object = {}
    ): Actor.CreateData | Item.CreateData {
        const type = createData.type;
        try {
            // foundry.utils.duplicate source to avoid keeping reference to model data.
            const modelSystemData = {
                name: 'Unnamed', type, ...createData
            } as Actor.CreateData | Item.CreateData;
            modelSystemData.system = DataDefaults.baseSystemData(entityType, systemData);
            return modelSystemData;
        } catch (error) {
            throw new Error(`FoundryVTT doesn't have item type: ${type} registered in ${entityType}`);
        }
    }

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
        return new SchemaField(schema).getInitialValue(createData) as schemaInitializedData[K];
    }

    /**
     * Build a fire mode field for use in range weapon data or testing
     * 
     * @param partialFireModeData Inject any fire mode property
     */
    static fireModeData(partialFireModeData: Partial<FireModeData> = {}): FireModeData {
        //@ts-expect-error - Partial data is allowed
        return foundry.utils.mergeObject({
            value: 0,
            label: '',
            defense: 0,
            recoil: false,
            suppression: false,
            mode: 'single_shot',
            action: 'simple'
        }, partialFireModeData);
    }
}
