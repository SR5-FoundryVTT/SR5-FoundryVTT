declare namespace Shadowrun {
    export interface SR5ActorSheetData extends ActorSheet.Data {
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
    }

    export interface SR5SheetFilters {
        skills: string
        showUntrainedSkills
    }
}