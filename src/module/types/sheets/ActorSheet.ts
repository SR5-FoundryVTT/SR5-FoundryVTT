declare namespace Shadowrun {
    export interface SR5ActorSheetData {
        config: typeof SR5CONFIG
        data: ShadowrunActorDataData
        filters: SR5SheetFilters
        isCharacter: boolean
        isSpirit: boolean
        isCritter: boolean
        awakened: boolean
        emerged: boolean
        woundTolerance: number
        vehicle: SR5VehicleSheetData
        hasSkills: boolean
        hasSpecial: boolean
        hasFullDefense: boolean
        effects: EffectsSheetData
    }

    interface EffectsSheetData {
        temporary: EffectsCategoryData
        passive: EffectsCategoryData
        inactive: EffectsCategoryData
    }

    interface EffectsCategoryData {
        type: "temporary"|"passive"|"inactive"
        label: string
        effects: any[] // TODO: How to include ActiveEffect type here...
    }

    export interface SR5SheetFilters {
        skills: string
        showUntrainedSkills
    }

    // Use to target a specific owned item anywhere in Foundry.
    export interface TargetedDocument {
        scene: Scene // The Foundry Scene the target/item can be found on.
        target: any // The Foundry Document marked.
        item: any|undefined // The Foundry Item marked..
    }

    // Use to display Matrix Marks which Foundry Document their placed on.
    export interface MarkedDocument extends TargetedDocument {
        marks: number // The amount of marks placed.
        markId: string // For example <sceneId>/<targetId>/<itemId>. See Helpers.buildMarkId
    }
}