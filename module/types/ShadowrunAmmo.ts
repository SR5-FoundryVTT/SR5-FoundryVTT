/// <reference path="Shadowrun.ts" />
declare namespace Shadowrun {
    export type Ammo = Item & {
        type: "ammo",
        data: {
            element: DamageElement,
            ap: number,
            damage: number,
            damageType: DamageType,
            blast: BlastData
        }
    }
}