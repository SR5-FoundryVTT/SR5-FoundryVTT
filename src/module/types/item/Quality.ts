/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export type Quality = SR5ItemData<QualityData> & {
        type: 'quality';
    };

    export type QualityData = QualityPartData & DescriptionPartData & ActionPartData;

    export type QualityPartData = {
        type: 'positive' | 'negative' | '';
    };
}
