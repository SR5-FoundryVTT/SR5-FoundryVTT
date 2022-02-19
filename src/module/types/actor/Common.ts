/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export interface CommonData {
        attributes: Attributes
        limits: Limits
        skills: CharacterSkills
        special: SpecialTrait
        initiative: Initiative
        modifiers: Modifiers
        /**
         * Actor inventories allow to show items separated out into different places / inventories.
         */
        inventories: InventoriesData
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
        marks: MatrixMarks
    }

    // A interchangeable list of device attributes.
    export interface MatrixAttributes {
        att1: DeviceAttribute;
        att2: DeviceAttribute;
        att3: DeviceAttribute;
        att4: DeviceAttribute;
    }

    export interface MatrixAttributeField extends AttributeField {
        // Track which device attribute has been selected. Can be att1 through att4.
        device_att: string
    }

    export interface MatrixTrackActorData {
        track: MatrixTracks
    }

    export interface NPCData {
        is_grunt: boolean
        professional_rating: number
    }

    /**
     * Matrix Marks are stored using a single string to identify the target, scene and item id the marks have been placed
     * on.
     */
    export interface MatrixMarks extends Record<string, number>{}

    export type InventoriesData = Record<string, InventoryData>
    /**
     * An inventory is a set of items with a name.
     */
    export interface InventoryData {
        name: string  // Internal name.
        label: string // Displayed name, can be the same as 'name' when user created.
        itemIds: string[] // Item ids to show within this inventory.
    }
}