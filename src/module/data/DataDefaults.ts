import DamageData = Shadowrun.DamageData;
import ActorArmorData = Shadowrun.ActorArmorData;
import TechnologyData = Shadowrun.TechnologyData;
import DescriptionData = Shadowrun.DescriptionData;
import EquipmentData = Shadowrun.EquipmentData;
import QualityData = Shadowrun.QualityData;
import ActionRollData = Shadowrun.ActionRollData;
import LimitData = Shadowrun.LimitData;
import OpposedTestData = Shadowrun.OpposedTestData;
import SkillField = Shadowrun.SkillField;
import TrackType = Shadowrun.TrackType;
import HostData = Shadowrun.HostData;
import DevicePartData = Shadowrun.DevicePartData;
import SourceEntityField = Shadowrun.SourceEntityField;
import ActionResultData = Shadowrun.ActionResultData;
import {SKILL_DEFAULT_NAME} from "../constants";
import DeviceData = Shadowrun.DeviceData;
import EquipmentItemData = Shadowrun.EquipmentItemData;
import DeviceItemData = Shadowrun.DeviceItemData;


export class DefaultValues {
    /**
     *
     * @param partialDamageData give partial DamageData fields to overwrite default values
     */
    static damageData(partialDamageData: Partial<DamageData> = {}): DamageData {
        return mergeObject({
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
        }, partialDamageData) as DamageData;
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
            limit: this.limitData(),
            extended: false,
            damage: this.damageData(),
            opposed: this.opposedTestData(),
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

    static opposedTestData(partialOpposedTestData: Partial<OpposedTestData> = {}): OpposedTestData {
        return mergeObject({
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
            description: DefaultValues.descriptionData(partialHostData.description),
            ...DefaultValues.matrixData({category: partialHostData.category, atts: partialHostData.atts}),
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
            data: partialSourceEntityData.data || undefined
        }, partialSourceEntityData) as SourceEntityField;
    }

    static equipmentItemData(partialEquipmentItemData: Partial<EquipmentItemData> = {}): EquipmentItemData {
        return  mergeObject({
            name: '',
            type: 'equipment',
            data: {
                description: DefaultValues.descriptionData(partialEquipmentItemData.data?.description || {}),
                technology: DefaultValues.technologyData(partialEquipmentItemData.data?.technology || {})
            }
        }, partialEquipmentItemData) as EquipmentItemData;
    }

    static deviceItemData(partialDeviceItemData: Partial<DeviceItemData> = {}): DeviceItemData {
        return mergeObject({
            name: '',
            type: 'device',
            data: {
                description: DefaultValues.descriptionData(partialDeviceItemData.data?.description || {}),
                technology: DefaultValues.technologyData(partialDeviceItemData.data?.technology || {}),
                ...DefaultValues.matrixData({category: partialDeviceItemData.data?.category, atts: partialDeviceItemData.data?.atts}),
            }
        }, partialDeviceItemData) as DeviceItemData;
    }
}

// TODO: Move these into DefaultValues implementations.
export const DataDefaults = {
    grunt: {
        metatype_modifiers: {
            elf: {
                attributes: {
                    agility: +1,
                    charisma: +2,
                    edge: -1
                }
            },
            ork: {
                attributes: {
                    body: +3,
                    strength: +2,
                    logic: -1,
                    charisma: -1,
                    edge: -1
                }
            },
            troll: {
                attributes: {
                    body: +4,
                    agility: -1,
                    strength: +4,
                    logic: -1,
                    intuition: -1,
                    charisma: -2,
                    edge: -1,
                },
                general: {
                    armor: +1
                }
            },
            dwarf: {
                attributes: {
                    body: +2,
                    reaction: -1,
                    strength: +2,
                    willpower: +1,
                    edge: -1
                }
            }
        }
    },
    damage: DefaultValues.damageData({type: {base: '', value: ''}}),
}