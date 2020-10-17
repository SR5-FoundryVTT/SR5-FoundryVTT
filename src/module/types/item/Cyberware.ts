/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export type Cyberware = SR5ItemData<CyberwareData> & {
        type: 'cyberware';
    };

    export type CyberwareData = CyberwarePartData & DescriptionPartData & TechnologyPartData & ActionPartData & ArmorPartData;

    export type CyberwarePartData = {
        essence: number;
        capacity: number;
        grade: string;
    };
}
