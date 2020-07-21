/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export type Armor = SR5ItemType & {
        type: 'armor';
    };

    export type ArmorData = {
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
