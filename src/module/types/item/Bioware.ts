/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export interface BiowareData extends
        BiowarePartData,
        DescriptionPartData,
        TechnologyPartData,
        ActionPartData,
        ImportFlags,
        ArmorPartData {

    }

    export interface BiowarePartData {
        baseEssence: number;
        essence: number;
        capacity: number;
        grade: string;
    }
}
