export type RangeTemplateType = {
    distance: number;
    modifier: number;
    label?: string;
};

export type RangesTemplateType = {
    short: RangeTemplateType;
    medium: RangeTemplateType;
    long: RangeTemplateType;
    extreme: RangeTemplateType;
};

export type TargetRangeTemplateType = {
    tokenUuid: string;
    name: string;
    distance: number;
    unit: string;
    range: RangeTemplateType;
};
