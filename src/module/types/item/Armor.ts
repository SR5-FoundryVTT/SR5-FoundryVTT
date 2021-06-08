/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export type ArmorData =
        ArmorPartData &
        DescriptionPartData &
        TechnologyPartData;

    export type ArmorPartData = {
        armor: {
            mod: boolean;
            value: number;
            acid: number;
            cold: number;
            fire: number;
            electricity: number;
            radiation: number;
        };
    };
}
