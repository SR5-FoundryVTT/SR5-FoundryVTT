/// <reference path="Shadowrun.ts" />
declare namespace Shadowrun {
    /**
     * A valid weapon with all associated fields. Weapons still have all possible fields, but some
     * may be ignored based on the value of @category.
     */
    export type Weapon = Item & {
        type: "weapon",
        data: {
            action: ActionData,
            category: WeaponCategory,
            ammo: AmmunitionData,
            range: RangeWeaponData,
            melee: MeleeWeaponData,
            thrown: ThrownWeaponData
        }
    };

    /**
     * Weapon action data.
     */
    export type ActionData = {
        type: "varies",
        category: string,
        attribute: ActorAttribute,
        attribute2: ActorAttribute,
        skill: Skill,
        spec: boolean
        mod: number,
        mod_description: string,
        limit: LimitData,
        extended: boolean,
        damage: DamageData,
        opposed: OpposedTestData,
        alt_mod: number,
        dice_pool_mod: ModList<number>
    };
    /**
     * Action limit data.
     */
    export type LimitData = ModifiableValueLinked
    /**
     * Action damage data.
     */
    export type DamageData = ModifiableValueLinked & {
        type: BaseValuePair<DamageType>,
        element: BaseValuePair<DamageElement>,
        ap: ModifiableValue
    };
    /**
     * Action opposed test data.
     */
    export type OpposedTestData = {
        type: OpposedType,
        attribute: ActorAttribute,
        attribute2: ActorAttribute,
        skill: Skill,
        mod: number,
        description: string
    };

    /**
     * Weapon categories.
     */
    export type WeaponCategory = "range"|"melee"|"thrown";

    /**
     * Ammunition data for an weapon.
     */
    export type AmmunitionData = {
        spare_clips: ValueMaxPair<number>,
        current: ValueMaxPair<number>
    };

    /**
     * Ranged weapon specific data.
     */
    export type RangeWeaponData = {
        category: "",
        ranges: RangeData,
        rc: ModifiableValue,
        modes: FiringModeData
    };
    /**
     * Weapon ranges data.
     */
    export type RangeData = {
        short: number,
        medium: number,
        long: number,
        extreme: number,
        attribute?: ActorAttribute
    };
    /**
     * Valid firing modes data.
     */
    export type FiringModeData = {
        single_shot: boolean,
        semi_auto: boolean,
        burst_fire: boolean,
        full_auto: boolean
    };

    /**
     * Melee weapon specific data.
     */
    export type MeleeWeaponData = {
        reach: number
    };

    /**
     * Thrown weapon specific data.
     */
    export type ThrownWeaponData = {
        ranges: RangeData,
        blast: BlastData;
    };
    /**
     * Blast data.
     */
    export type BlastData = {
        radius: number,
        dropoff: number
    };
}