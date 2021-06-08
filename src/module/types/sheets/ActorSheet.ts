declare namespace Shadowrun {
    export type SR5ActorSheetData = ActorSheet.Data & {
        config: typeof SR5CONFIG;
        data: ShadowrunActorDataData;
        filters: SR5SheetFilters;
        isCharacter: boolean;
        isSpirit: boolean;
        isCritter: boolean;
        awakened: boolean;
        emerged: boolean;
        woundTolerance: number;
        vehicle: SR5VehicleSheetData;
    };

    export type SR5SheetFilters = {
        skills: string;
        showUntrainedSkills
    };
}