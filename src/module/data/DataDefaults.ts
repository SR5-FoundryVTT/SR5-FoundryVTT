import FireModeData = Shadowrun.FireModeData;
import DataSchema = foundry.data.fields.DataSchema;
const { SchemaField } = foundry.data.fields;
import { ActionRollData, DamageData, MinimalActionData } from "../types/item/ActionModel";
import { AttributeField } from "../types/template/AttributesModel";
import { ArmorData } from "../types/template/ArmorModel";
import { DescriptionData } from "../types/template/DescriptionModel";
import { LimitField } from "../types/template/LimitsModel";
import { RangeData } from "../types/item/WeaponModel";
import { SkillField } from "../types/template/SkillsModel";
import { SourceEntityField } from "../types/item/HostModel";
import { TechnologyData } from "../types/template/TechnologyModel";
import { Track } from "../types/template/ConditionMonitorsModel";
import { ValueField } from "../types/template/BaseModel";

const schemaMap = {
    action_roll: ActionRollData(),
    armor: ArmorData(),
    attribute_field: AttributeField(),
    damage: DamageData(),
    description: DescriptionData(),
    limit_field: LimitField(),
    minimal_action: MinimalActionData(),
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
