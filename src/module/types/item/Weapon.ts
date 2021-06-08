/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    /**
     * A valid weapon with all associated fields. Weapons still have all possible fields, but some
     * may be ignored based on the value of @category.
     */
    export type WeaponData =
        WeaponPartData &
        ActionPartData &
        TechnologyPartData &
        DescriptionPartData;

    export type WeaponPartData = {
        category: WeaponCategory;
        subcategory: string;
        ammo: AmmunitionData;
        range: RangeWeaponData;
        melee: MeleeWeaponData;
        thrown: ThrownWeaponData;
    };

    /**
     * Weapon categories.
     */
    export type WeaponCategory = 'range' | 'melee' | 'thrown';

    /**
     * Ammunition data for an weapon.
     */
    export type AmmunitionData = {
        spare_clips: ValueMaxPair<number>;
        current: ValueMaxPair<number>;
    };

    /**
     * Ranged weapon specific data.
     */
    export type RangeWeaponData = {
        category: '';
        ranges: RangeData;
        rc: ModifiableValue;
        modes: FiringModeData;
    };
    /**
     * Weapon ranges data.
     */
    export type RangeData = {
        short: number;
        medium: number;
        long: number;
        extreme: number;
        attribute?: ActorAttribute;
    };
    /**
     * Valid firing modes data.
     */
    export type FiringModeData = {
        single_shot: boolean;
        semi_auto: boolean;
        burst_fire: boolean;
        full_auto: boolean;
    };

    /**
     * Melee weapon specific data.
     */
    export type MeleeWeaponData = {
        reach: number;
    };

    /**
     * Thrown weapon specific data.
     */
    export type ThrownWeaponData = {
        ranges: RangeData;
        blast: BlastData;
    };
    /**
     * Blast data.
     */
    export type BlastData = {
        radius: number;
        dropoff: number;
    };
}
