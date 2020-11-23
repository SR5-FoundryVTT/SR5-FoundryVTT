declare namespace Shadowrun {
    export type RangesTemplateData = {
        short: RangeTemplateData,
        medium: RangeTemplateData,
        long: RangeTemplateData,
        extreme: RangeTemplateData,
    }

    export type RangeTemplateData =
        LabelField &
        ModifierField & {
        distance: number
    }
}