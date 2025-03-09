/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export interface CyberwareData extends
        CyberwarePartData,
        DescriptionPartData,
        TechnologyPartData,
        ActionPartData,
        ImportFlags,
        ArmorPartData {

    }

    export interface CyberwarePartData {
        essence: BaseValuePair<number>;
        capacity: number;
        grade: string;
    }
}
