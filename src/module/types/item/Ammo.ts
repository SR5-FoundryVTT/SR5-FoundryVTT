/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export interface AmmoData extends AmmoPartData, DescriptionPartData, TechnologyPartData {

    }

    /**
     * Fields provided by ammunition to modify matching weapon fields with
     */
    export interface AmmoPartData {
        element: DamageElement
        ap: number
        damage: number
        damageType: DamageType
        blast: BlastData
        accuracy: number
    }
}
