declare namespace Shadowrun {
    export interface SR5ActorSheetData {
        config: typeof SR5CONFIG
        system: ShadowrunActorDataData
        filters: SR5SheetFilters
        isCharacter: boolean
        isSpirit: boolean
        isCritter: boolean
        isVehicle: boolean
        awakened: boolean
        emerged: boolean
        woundTolerance: number
        vehicle: SR5VehicleSheetData
        hasSkills: boolean
        canAlterSpecial: boolean
        hasFullDefense: boolean
        effects: any[]
    }

    type AllEnabledEffectsSheetData = any[];

    export interface SR5SheetFilters {
        skills: string
        showUntrainedSkills
    }

    // Use to target a specific owned item anywhere in Foundry.
    export interface TargetedDocument {
        target: any // The Foundry Document marked.
    }

    // Use to display Matrix Marks which Foundry Document their placed on.
    export interface MarkedDocument extends TargetedDocument {
        marks: number // The amount of marks placed.
        markId: string // For example <sceneId>/<targetId>/<itemId>. See Helpers.buildMarkId
    }
}
