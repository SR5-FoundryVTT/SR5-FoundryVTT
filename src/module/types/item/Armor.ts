/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export interface ArmorData extends
        ArmorPartData,
        DescriptionPartData,
        TechnologyPartData {

    }

    export interface ArmorPartData {
        armor: {
            mod: boolean;
            value: number;
            acid: number;
            cold: number;
            fire: number;
            electricity: number;
            radiation: number;
        };
    }
}
