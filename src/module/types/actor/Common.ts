/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export interface CommonData {
        attributes: Attributes
        limits: Limits
        skills: CharacterSkills
        special: SpecialTrait
        initiative: Initiative
        modifiers: Modifiers
        situation_modifiers: SituationModifiersSourceData
        values: CommonValues
        /**
         * Actor inventories allow to show items separated out into different places / inventories.
         */
        inventories: InventoriesData
        visibilityChecks: VisibilityChecks
    }

    export interface MagicData {
        attribute: ActorAttribute,
        projecting: boolean,
        initiation: number
    }

    export interface MatrixData {
        dice: BaseValuePair<number> & ModifiableValue
        base: BaseValuePair<number> & ModifiableValue

        attack: MatrixAttributeField
        sleaze: MatrixAttributeField
        data_processing: MatrixAttributeField
        firewall: MatrixAttributeField

        condition_monitor: ConditionData
        rating: number
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
        showAll?: boolean // When set to true, show all items from all inventories.
    }

    /**
     * Contains modifable values held by each actor, differs per type.
     */
    export interface CommonValues {string: ModifiableValue}
    
    /**
     * Values used for physical combat actors only
     */
    export interface PhysicalCombatValues extends CommonValues {
        // The current amount of progressive recoil (bullets fired) without any compensation.
        recoil: ModifiableValue
        // The base amount of recoil compensation of an actor, without recoil reducing it.
        recoil_compensation: ModifiableValue
    }

    export interface VisibilityChecks {
        astral : AstralVisibility
        meat: MeatSpaceVisibility
        matrix: MatrixVisibility
    }

    export interface MeatSpaceVisibility {
        hasHeat: boolean
    }

    export interface AstralVisibility {
        hasAura: boolean,
        astralActive : boolean,
        affectedBySpell: boolean
    }

    export interface MatrixVisibility {
        hasIcon: boolean,
        runningSilent: boolean
    }
}