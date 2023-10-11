/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export interface AmmoData extends
        AmmoPartData,
        DescriptionPartData,
        ImportFlags,
        TechnologyPartData {

    }

    /**
     * Fields provided by ammunition to modify matching weapon fields with
     */
    export interface AmmoPartData {
        element: DamageElement
        ap: number
        damage: number
        damageType: DamageType
        // Allow for ammo to replace weapon damage instead modifying it.
        // This is needed for underbarrel grenades.
        replaceDamage: boolean
        blast: BlastData
        accuracy: number
    }
}
