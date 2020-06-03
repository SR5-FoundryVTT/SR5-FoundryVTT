/// <reference path="Shadowrun.ts" />
declare namespace Shadowrun {
    export type Armor = Item & {
        type: "armor",
        data: {
            armor: {
                mod: boolean,
                value: number,
                acid: number,
                cold: number,
                fire: number,
                electricity: number,
                radiation: number
            }
        }
    }
}