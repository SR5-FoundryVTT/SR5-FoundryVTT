/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export interface AmmoData extends AmmoPartData, DescriptionPartData, TechnologyPartData {

    }

    export interface AmmoPartData {
        element: DamageElement;
        ap: number;
        damage: number;
        damageType: DamageType;
        blast: BlastData;
    }
}
