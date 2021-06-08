/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export interface BiowareData extends
        BiowarePartData,
        DescriptionPartData,
        TechnologyPartData,
        ActionPartData,
        ArmorPartData {

    }

    export interface BiowarePartData {
        essence: number;
        capacity: number;
        grade: string;
    }
}
