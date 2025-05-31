import {SKILL_DEFAULT_NAME} from "../constants";
import FireModeData = Shadowrun.FireModeData;
import SourceEntityField = Shadowrun.SourceEntityField;
import ValueField = Shadowrun.ValueField;
import RangeData = Shadowrun.RangeData;
import DataSchema = foundry.data.fields.DataSchema;
const { SchemaField } = foundry.data.fields;
import { DamageData, MinimalActionData, ActionRollData } from "../types/item/ActionModel";
import { ArmorData } from "../types/template/ArmorModel";
import { Track } from "../types/template/ConditionMonitorsModel";
import { LimitField } from "../types/template/LimitsModel";
import { SkillField } from "../types/template/SkillsModel";

const schemaMap = {
    armor: ArmorData(),
    damage: DamageData(),
    minimal_action: MinimalActionData(),
    action_roll: ActionRollData(),
    limit_field: LimitField(),
    skill_field: SkillField(),
    track: Track(),
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

    static createData<K extends keyof typeof schemaMap>(
        key: K,
        createData: schemaCreateData[K] = {}
    ): schemaInitializedData[K] {
        const schema = schemaMap[key] as DataSchema;
        return new SchemaField(schema).getInitialValue(createData) as schemaInitializedData[K];
    }

    /**
     * Build a damage track field for use in document data.
     * @param partialTrackData Injet any track property
     * @returns 
     */
    static trackData(partialTrackData: Partial<TrackType> = {}): TrackType {
        return foundry.utils.mergeObject({
            value: 0,
            max: 0,
            label: '',
            mod: [],
            disabled: false,
            wounds: 0
        }, partialTrackData) as TrackType;
    }

    /**
     * Data structure used to reference other document types.
     * 
     * Example usage:
     * Host references other IC actors it's able to start in combat.
     * 
     * TODO: This uses the v8 old style Document.id pattern instead of v9 style uuid pattern.
     * 
     * @param partialSourceEntityData 
     * @returns 
     */
    static sourceItemData(partialSourceEntityData: Partial<SourceEntityField> = {}): SourceEntityField {
        return foundry.utils.mergeObject({
            id: '',
            name: '',
            pack: null,
            type: 'Actor',
            // @ts-expect-error
            system: partialSourceEntityData.system || undefined
        }, partialSourceEntityData) as SourceEntityField;
    }

    /**
     * Build a numerical value field for use anywhere necessary
     * 
     * @param partialValueData Inject any value property
     */
    static valueData(partialValueData: Partial<ValueField> = {}) {
        return foundry.utils.mergeObject({
            base: 0,
            value: 0,
            temp: 0,
            mod: [],
            label: ''
        }, partialValueData) as ValueField;
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

    static weaponRangeData(partialRangeData: Partial<RangeData> = {}): RangeData {
        return foundry.utils.mergeObject({
            short: 0,
            medium: 0,
            long: 0,
            extreme: 0,
            category: 'manual',
        }, partialRangeData);
    }

    /**
     * Build a description data segment
     * 
     * @param partialDescriptionData 
     * @returns 
     */
    static descriptionData(partialDescriptionData: Partial<Shadowrun.DescriptionData> = {}) {
        return foundry.utils.mergeObject({
            value: '',
            chat: '',
            source: ''
        }, partialDescriptionData) as Shadowrun.DescriptionData;
    }

    /**
     * Build a technology data segment
     * 
     * @param partialTechnologyData 
     * @returns 
     */
    static technologyData(partialTechnologyData: Partial<Shadowrun.TechnologyData> = {}) {
        return foundry.utils.mergeObject({
            rating: '',
            availability: '',
            quantity: 1,
            cost: 0,
            equipped: false,
            conceal: {
                base: 0,
                value: 0,
                mod: [],
            },
            condition_monitor: {
                label: '',
                value: 0,
                max: 0,
            },
            wireless: true,
            networkController: undefined
        }, partialTechnologyData) as Shadowrun.TechnologyData;
    }

    /**
     * Build a attribute data segment.
     * 
     * @param partialAttributeData
     * @returns Merged of partial and basic attribute data
     */
    static attributeData(partialAttributeData: Partial<Shadowrun.AttributeField> = {}) {
        return foundry.utils.mergeObject({
            value: 0,
            mod: [],
            base: 0,
            label: '',
            hidden: false,
            device_att: '',
            temp: 0,
            limit: ''
        }, partialAttributeData) as Shadowrun.AttributeField;
    }
}