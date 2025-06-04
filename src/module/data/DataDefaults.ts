import FireModeData = Shadowrun.FireModeData;
import DataSchema = foundry.data.fields.DataSchema;
const { SchemaField } = foundry.data.fields;
import { Action, ActionRollData, DamageData, MinimalActionData } from "../types/item/ActionModel";
import { AttributeField } from "../types/template/AttributesModel";
import { DescriptionData } from "../types/template/DescriptionModel";
import { LimitField } from "../types/template/LimitsModel";
import { RangeData, Weapon } from "../types/item/WeaponModel";
import { SkillField } from "../types/template/SkillsModel";
import { Host, SourceEntityField } from "../types/item/HostModel";
import { TechnologyData } from "../types/template/TechnologyModel";
import { Track } from "../types/template/ConditionMonitorsModel";
import { ValueField } from "../types/template/BaseModel";

import { Character } from "../types/actor/CharacterModel";
import { Critter } from "../types/actor/CritterModel";
import { IC } from "../types/actor/ICModel";
import { Spirit } from "../types/actor/SpiritModel";
import { Sprite } from "../types/actor/SpriteModel";
import { Vehicle } from "../types/actor/VehicleModel";

import { AdeptPower } from "../types/item/AdeptPowerModel";
import { Ammo } from "../types/item/AmmoModel";
import { Armor, ArmorData } from "../types/item/ArmorModel";
import { Bioware } from "../types/item/BiowareModel";
import { CallInAction } from "../types/item/CallInActionModel";
import { ComplexForm } from "../types/item/ComplexFormModel";
import { Contact } from "../types/item/ContactModel";
import { CritterPower } from "../types/item/CritterPowerModel";
import { Cyberware } from "../types/item/CyberwareModel";
import { Device } from "../types/item/DeviceModel";
import { Echo } from "../types/item/EchoModel";
import { Equipment } from "../types/item/EquipmentModel";
import { Lifestyle } from "../types/item/LifeStyleModel";
import { Metamagic } from "../types/item/MetamagicModel";
import { Modification } from "../types/item/ModificationModel";
import { MovementField } from "../types/template/MovementModel";
import { Program } from "../types/item/ProgramModel";
import { Quality } from "../types/item/QualityModel";
import { Sin } from "../types/item/SinModel";
import { Spell } from "../types/item/SpellModel";
import { SpritePower } from "../types/item/SpritePowerModel";

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
    sin: Sin,
    spell: Spell,
    sprite_power: SpritePower,
    weapon: Weapon,
} as const;

export type SystemEntityType = keyof typeof systemMap;

const schemaMap = {
    action_roll: ActionRollData(),
    armor: ArmorData(),
    attribute_field: AttributeField(),
    damage: DamageData(),
    description: DescriptionData(),
    limit_field: LimitField(),
    minimal_action: MinimalActionData(),
    movement_field: MovementField(),
    range: RangeData(),
    skill_field: SkillField(),
    source_entity_field: SourceEntityField(),
    technology: TechnologyData(),
    track: Track(),
    value_field: ValueField(),
} as const;

type schemaCreateData = {
    [K in keyof typeof schemaMap]: foundry.data.fields.SchemaField.CreateData<typeof schemaMap[K]>;
};

type schemaInitializedData = {
    [K in keyof typeof schemaMap]: foundry.data.fields.SchemaField.InitializedData<typeof schemaMap[K]>;
};

interface MinimalItemData {
    // Whatever name you want to give but not ''.
    name?: string;
    // Whatever item type you want to have.
    type: string
}

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
    static baseEntityData<EntityData, EntitySystemData>(
        entityType: keyof Game["model"],
        itemData: MinimalItemData,
        systemData: Partial<EntitySystemData>={}
    ) {
        const name = itemData.name ?? 'Unnamed';
        const type = itemData.type;

        try {
            // foundry.utils.duplicate source to avoid keeping reference to model data.
            const modelSystemData = foundry.utils.duplicate(game.model[entityType][type]);
            return {
                name, type,
                system: foundry.utils.mergeObject(modelSystemData, systemData)
            } as EntityData;
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
        const schema = schemaMap[key] as DataSchema;
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
