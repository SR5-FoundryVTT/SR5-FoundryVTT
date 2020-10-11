declare namespace Shadowrun {
    export type RangesDescription = {
        short: RangeDescription,
        medium: RangeDescription,
        long: RangeDescription,
        extreme: RangeDescription,
    }

    export type RangeDescription =
        LabelField &
        ModifierField & {
        distance: number
    }
}