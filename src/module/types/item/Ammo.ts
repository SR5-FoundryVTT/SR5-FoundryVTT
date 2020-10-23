/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export type Ammo = SR5ItemData<AmmoData> & {
        type: 'ammo';
    };

    export type AmmoData = AmmoPartData & DescriptionPartData & TechnologyPartData;

    export type AmmoPartData = {
        element: DamageElement;
        ap: number;
        damage: number;
        damageType: DamageType;
        blast: BlastData;
    };
}
