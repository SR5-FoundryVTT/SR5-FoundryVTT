/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    /**
     * A valid weapon with all associated fields. Weapons still have all possible fields, but some
     * may be ignored based on the value of @category.
     */
    export interface WeaponData extends
        WeaponPartData,
        ActionPartData,
        TechnologyPartData,
        DescriptionPartData {

    }

    export interface WeaponPartData {
        category: WeaponCategory;
        subcategory: string;
        ammo: AmmunitionData;
        range: RangeWeaponData;
        melee: MeleeWeaponData;
        thrown: ThrownWeaponData;
    }

    /**
     * Weapon categories.
     */
    export type WeaponCategory = 'range' | 'melee' | 'thrown' | '';

    /**
     * Ammunition data for an weapon.
     */
    export interface AmmunitionData {
        spare_clips: ValueMaxPair<number>;
        current: ValueMaxPair<number>;
    }

    /**
     * Ranged weapon specific data.
     */
    export interface RangeWeaponData {
        category: '';
        ranges: RangeData;
        rc: ModifiableValue;
        modes: FiringModeData;
    }
    /**
     * Weapon ranges data.
     */
    export interface RangeData  {
        short: number;
        medium: number;
        long: number;
        extreme: number;
        attribute?: ActorAttribute;
    }
    /**
     * Selection of what reanged weapon modes are available
     */
    export interface FiringModeData  {
        single_shot: boolean;
        semi_auto: boolean;
        burst_fire: boolean;
        full_auto: boolean;
    }
    
    /**
     * Possible firing modes for a ranged weapon.
     */
    export type RangedWeaponMode = keyof FiringModeData;

    /**
     * Melee weapon specific data.
     */
    export interface MeleeWeaponData  {
        reach: number;
    }

    /**
     * Thrown weapon specific data.
     */
    export interface ThrownWeaponData  {
        ranges: RangeData;
        blast: BlastData;
    }
    /**
     * Blast data.
     */
    export interface BlastData  {
        radius: number;
        dropoff: number;
    }
}
