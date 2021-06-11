/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export interface CommonData {
        attributes: Attributes
        limits: Limits
        skills: CharacterSkills
        special: SpecialTrait
        initiative: Initiative
        modifiers: Modifiers
    }

    export interface MagicData {
        attribute: ActorAttribute,
        projecting: boolean
        drain: BaseValuePair<number> & ModifiableValue
    }

     export interface MatrixData {
        dice: BaseValuePair<number> & ModifiableValue
        base: BaseValuePair<number> & ModifiableValue

        attack: MatrixAttributeField
        sleaze: MatrixAttributeField
        data_processing: MatrixAttributeField
        firewall: MatrixAttributeField

        condition_monitor: ConditionData
        rating: NumberOrEmpty
        name: string
        device: string
        is_cyberdeck: boolean
        hot_sim: boolean
        running_silent: boolean
        item?: any
    }

    export interface MatrixAttributeField extends AttributeField {
        device_att: string
    }

    export interface MatrixTrackActorData {
        track: MatrixTracks
    }

    export interface NPCData {
        is_grunt: boolean
        professional_rating: number
    }
}