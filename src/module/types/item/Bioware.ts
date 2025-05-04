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
        essence: NumberOrEmpty;
        capacity: number;
        grade: string;
    }
}
