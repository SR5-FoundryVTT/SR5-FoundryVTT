declare namespace Shadowrun {
    /** These modifiers define a situation around an actor
     */
    export type SituationModifiers = {
        environmental: EnvironmentalModifiers;
    }

    export interface EnvironmentalModifierCategories {
        light: number
        wind: number
        visibility: number
        range: number
        value: number
    }

    /* These modifiers only deal with the selection of which environmental modifiers are active currently.
     */
    export type EnvironmentalModifiers = {
        total: number,
        active: Partial<EnvironmentalModifierCategories>
    }

    /** These levels define the value of each environmental modifier level
     */
    export type EnvironmentalModifierLevels = {
        good: number
        light: number
        moderate: number
        heavy: number
        extreme: number
    }
}