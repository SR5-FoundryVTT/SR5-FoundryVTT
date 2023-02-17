import DamageData = Shadowrun.DamageData;
import ActorArmorData = Shadowrun.ActorArmorData;
import FireModeData = Shadowrun.FireModeData;
import TechnologyData = Shadowrun.TechnologyData;
import DescriptionData = Shadowrun.DescriptionData;
import EquipmentData = Shadowrun.EquipmentData;
import ProgramItemData = Shadowrun.ProgramItemData;
import QualityData = Shadowrun.QualityData;
import ActionRollData = Shadowrun.ActionRollData;
import LimitData = Shadowrun.LimitData;
import LimitField = Shadowrun.LimitField;
import OpposedTestData = Shadowrun.OpposedTestData;
import SkillField = Shadowrun.SkillField;
import TrackType = Shadowrun.TrackType;
import HostData = Shadowrun.HostData;
import DevicePartData = Shadowrun.DevicePartData;
import SourceEntityField = Shadowrun.SourceEntityField;
import ActionResultData = Shadowrun.ActionResultData;
import {SKILL_DEFAULT_NAME} from "../constants";
import EquipmentItemData = Shadowrun.EquipmentItemData;
import DeviceItemData = Shadowrun.DeviceItemData;
import ValueField = Shadowrun.ValueField;
import GenericValueField = Shadowrun.GenericValueField;
import MinimalActionData = Shadowrun.MinimalActionData;


interface MinimalItemData {
    // Whatever name you want to give but not ''.
    name?: string
    // Whatever item type you want to have.
    type: string
}
export class DataDefaults {
    /**
     * Return a base item data structure with minimal necessary FoundryVTT ItemDataModel fields.
     * 
     * @param name Whatever name you want to give but not ''.
     * @param type Whatever item type you want to have
     * @param systemData Whatever partial item system data you want to inject into general model system data.
     * @returns A minimum viable item data structure to use with Item#create
     */
    static baseItemData<ItemData>(itemData: MinimalItemData, systemData: Partial<ItemData>={}) {
        const name = itemData.name ?? 'Unnamed';
        const type = itemData.type;

        //@ts-ignore foundry-vtt-type v10
        const modelSystemData = game.model['Item'][type];
        if (!modelSystemData) throw new Error(`FoundryVTT doesn't have item type: ${type} registered`);
        return {
            name, type,
            system: mergeObject(modelSystemData, systemData)
        } as ItemData;
    }
    /**
     *
     * @param partialDamageData give partial DamageData fields to overwrite default values
     */
    static damageData(partialDamageData: Partial<DamageData> = {}): DamageData {
        const data: DamageData = {
            type: {
                base: 'physical',
                value: 'physical',
            },
            element: {
                base: '',
                value: '',
            },
            base: 0,
            value: 0,
            ap: {
                base: 0,
                value: 0,
                mod: [],
            },
            attribute: '',
            mod: [],
            base_formula_operator: 'add',
            source: {
                actorId: '',
                itemId: '',
                itemType: '',
                itemName: ''
            }
        }
        return mergeObject(data, partialDamageData) as DamageData;
    }

    static actorArmorData(partialActorArmorData: Partial<ActorArmorData> = {}): ActorArmorData {
        return mergeObject({
            value: 0,
            mod: [],
            base: 0,
            label: '',
        }, partialActorArmorData) as ActorArmorData;
    }

    static equipmentData(partialEquipmentData: Partial<EquipmentData> = {}): EquipmentData {
        return mergeObject({
            description: this.descriptionData(),
            technology: this.technologyData(),
        }, partialEquipmentData) as EquipmentData;
    }

    static qualityData(partialQualityData: Partial<QualityData> = {}): QualityData {
        return mergeObject({
            type: '',
            description: this.descriptionData(),
            action: this.actionRollData(),
        }, partialQualityData) as QualityData;
    }

    static technologyData(partialTechnologyData: Partial<TechnologyData> = {}): TechnologyData {
        return mergeObject({
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
        }, partialTechnologyData) as TechnologyData;
    }

    static descriptionData(partialDescriptionData: Partial<DescriptionData> = {}): DescriptionData {
        return mergeObject({
            value: '',
            chat: '',
            source: ''
        }, partialDescriptionData) as DescriptionData;
    }

    static matrixData(partialMatrixData: Partial<DevicePartData> = {}): DevicePartData {
        // Remove incomplete properties for ease of use of callers.
        if (partialMatrixData.category === undefined) delete partialMatrixData.category;
        if (partialMatrixData.atts === undefined) delete partialMatrixData.atts;

        return mergeObject({
            category: "",
            atts: {
                att1: {
                    value: 0,
                    att: "attack",
                    editable: true
                },
                att2: {
                    value: 0,
                    att: "attack",
                    editable: true
                },
                att3: {
                    value: 0,
                    att: "attack",
                    editable: true
                },
                att4: {
                    value: 0,
                    att: "attack",
                    editable: true
                }
            },
            networkDevices: []
        }, partialMatrixData) as DevicePartData;
    }

    /**
     * Build a action data capable of rolling a test.
     * 
     * This is used instead of game.model.Item.action.action as fields like armor don't mesh well with TestCreator._mergeMinimalActionDataInOrder
     * 
     * @param partialActionRollData 
     * @returns 
     */
    static actionRollData(partialActionRollData: Partial<ActionRollData> = {}): ActionRollData {
        return mergeObject({
            type: '',
            category: '',
            attribute: '',
            attribute2: '',
            skill: '',
            spec: false,
            mod: 0,
            mod_description: '',
            damage: this.damageData(),
            modifiers: [],
            limit: this.limitData(),
            threshold: {
                value: 0,
                base: 0
            },
            extended: false,
            opposed: this.opposedTestData(),
            followed: {
                test: '',
                attribute: '',
                attribute2: '',
                skill: '',
                mod: 0,
            },
            alt_mod: 0,
            dice_pool_mod: []
        }, partialActionRollData) as ActionRollData;
    }

    static actionResultData(partialActionResultData: Partial<ActionResultData> = {}): ActionResultData {
        // @ts-ignore
        return mergeObject({
            success: {
                matrix: {
                    placeMarks: false
                }
            }
        })
    }

    static limitData(partialLimitData: Partial<LimitData> = {}): LimitData {
        return mergeObject({
            value: 0,
            base: 0,
            attribute: '',
            mod: []
        }, partialLimitData) as LimitData;
    }

    static limitField(partialLimitField: Partial<LimitField> = {}): LimitField {
        return mergeObject({
            value: 0,
            base: 0,
            attribute: '',
            label: '',
            hidden: false,
            mod: []
        }, partialLimitField) as LimitField;
    }

    static opposedTestData(partialOpposedTestData: Partial<OpposedTestData> = {}): OpposedTestData {
        return mergeObject({
            test: '',
            type: '',
            attribute: '',
            attribute2: '',
            skill: '',
            mod: 0,
            description: ''
        }, partialOpposedTestData) as OpposedTestData;
    }

    static skillData(partialSkillData: Partial<SkillField> = {}): SkillField {
        return mergeObject({
            name: SKILL_DEFAULT_NAME,
            base: 0,
            value: 0,
            hidden: false,
            canDefault: false,
            label: '',
            bonus: [],
            specs: [],
            mod: [],
            attribute: ''
        }, partialSkillData) as SkillField;
    }

    static trackData(partialTrackData: Partial<TrackType> = {}): TrackType {
        return mergeObject({
            value: 0,
            max: 0,
            label: '',
            mod: [],
            disabled: false,
            wounds: 0
        }, partialTrackData) as TrackType;
    }

    static hostData(partialHostData: Partial<HostData> = {}): HostData {
        return mergeObject({
            description: DataDefaults.descriptionData(partialHostData.description),
            ...DataDefaults.matrixData({category: partialHostData.category, atts: partialHostData.atts}),
            rating: 0,
            ic: []
        }, partialHostData) as HostData;
    }

    static sourceEntityData(partialSourceEntityData: Partial<SourceEntityField> = {}): SourceEntityField {
        return mergeObject({
            id: '',
            name: '',
            pack: null,
            type: 'Actor',
            system: partialSourceEntityData.data || undefined
        }, partialSourceEntityData) as SourceEntityField;
    }

    static equipmentItemData(partialEquipmentItemData: Partial<EquipmentItemData> = {}): EquipmentItemData {
        return  mergeObject({
            name: '',
            type: 'equipment',
            system: {
                description: DataDefaults.descriptionData(partialEquipmentItemData.data?.description || {}),
                technology: DataDefaults.technologyData(partialEquipmentItemData.data?.technology || {})
            }
        }, partialEquipmentItemData) as EquipmentItemData;
    }

    static programItemData(partial: Partial<ProgramItemData> = {}): ProgramItemData {
        return mergeObject({
            type: "program",
            name: "",
            system: {
                description: {
                    value: "",
                    chat: "",
                    source: ""
                },
                technology: {
                    rating: 1,
                    availability: "",
                    quantity: 1,
                    cost: 0,
                    equipped: false,
                    conceal: {
                        base: 0,
                        value: 0
                    },
                    condition_monitor: {
                        value: 0,
                        max: 9
                    },
                    wireless: true,
                    networkController: null
                },
                type: "common_program"
            }
        }, partial) as ProgramItemData;
    }

    static deviceItemData(partialDeviceItemData: Partial<DeviceItemData> = {}): DeviceItemData {
        return mergeObject({
            name: '',
            type: 'device',
            system: {
                description: DataDefaults.descriptionData(partialDeviceItemData.data?.description || {}),
                technology: DataDefaults.technologyData(partialDeviceItemData.data?.technology || {}),
                ...DataDefaults.matrixData({category: partialDeviceItemData.data?.category, atts: partialDeviceItemData.data?.atts}),
            }
        }, partialDeviceItemData) as DeviceItemData;
    }

    static valueData(partialValueData: Partial<ValueField> = {}) {
        return mergeObject({
            base: 0,
            value: 0,
            temp: 0,
            mod: [],
            label: ''
        }, partialValueData) as ValueField;
    }

    static genericValueData(partialGenericValueData: Partial<GenericValueField> = {}) {
        return mergeObject({
            base: 0,
            value: 0,
            temp: 0,
            mod: [],
            label: ''
        }, partialGenericValueData) as GenericValueField;
    }

    static minimalActionData(partialActionData: Partial<MinimalActionData> = {}) {
        return mergeObject({
            attribute: '',
            attribute2: '',
            skill: '',
            mod: 0,
            armor: false,
            limit: {
                value: 0,
                attribute: '',
                mod: [],
                base: 0,
            }
        }, partialActionData) as MinimalActionData;
    }

    static fireModeData(partialFireModeData: Partial<FireModeData> = {}): FireModeData {
        return mergeObject({
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