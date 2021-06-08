/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export type BiowareData = BiowarePartData & DescriptionPartData & TechnologyPartData & ActionPartData & ArmorPartData;

    export type BiowarePartData = {
        essence: number;
        capacity: number;
        grade: string;
    };
}
