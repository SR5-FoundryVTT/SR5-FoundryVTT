/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export type Ammo = SR5ItemType & {
        type: 'ammo';
        data: {
            element: DamageElement;
            ap: number;
            damage: number;
            damageType: DamageType;
            blast: BlastData;
        };
    };
}
