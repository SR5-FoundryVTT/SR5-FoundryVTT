/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
      export interface QualityData extends
          QualityPartData,
          DescriptionPartData,
          ImportFlags,
          ActionPartData {

      }

    export interface QualityPartData {
        type: 'positive' | 'negative' | '';
        rating: number;
    }
}
