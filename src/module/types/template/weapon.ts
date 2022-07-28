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

    /**
     * Ranges of targeted TokenDocuments.
     */
    export interface TargetRangeTemplateData {
        uuid: string
        name: string
        distance: number
        unit: string
        range: RangeTemplateData
    }
}