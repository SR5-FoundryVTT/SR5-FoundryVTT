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
     * NOTE: We store uuid instead of a document, as
     *       to not store that document when calling SuccessTest.toJSON()
     */
    export interface TargetRangeTemplateData {
        tokenUuid: string
        name: string
        distance: number
        unit: string
        range: RangeTemplateData
    }
}