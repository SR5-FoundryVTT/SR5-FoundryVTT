/// <reference path="../Shadowrun.d.ts" />

declare namespace Shadowrun {
    export interface CommonData extends DescriptionPartData {
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
        category_visibility: CategoryVisibility
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
        // Is this actors persona using VR?
        vr: boolean
        // Is this actors persona link locked?
        link_locked: boolean
        // Is this actors using hot sim for their persona?
        hot_sim: boolean
        // Is this actors persona running silently?
        running_silent: boolean
        item?: any
        marks: MatrixMarks
    }

    enum MatrixNetworkTypes {
        HOST = "host",
        GRID = "grid"
    }

    export interface MatrixNetworkData {
        network: {
            // empty string or uuid of used network (host/grid) NOT PAN
            uuid: string
            type: MatrixNetworkTypes
        }
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

    export interface CategoryVisibility {
        default: boolean
    }

    export interface NPCData {
        is_grunt: boolean
        professional_rating: number
    }

    /**
     * Matrix marks are stored as a list of targets to allow
     * - free form mark placements (manual entry)
     * - avoid having to mask uuid, due to Foundries auto extending behavior for keys with . separators
     * 
     * While key-value store would be simpler to access, the small amount of marks placed at any one time,
     * doesn't make it a performance issue. Therefore we can use a simple list.
     */
    export interface MatrixMarkTarget {
        // Optional document uuid
        uuid: string|null
        // Document or free-form name
        name: string
        // Amount of marks placed on
        marks: number
    }
    export type MatrixMarks = MatrixMarkTarget[]

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