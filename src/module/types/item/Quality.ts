/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
      export interface QualityData extends
          QualityPartData,
          DescriptionPartData,
          ActionPartData {

      }

    export interface QualityPartData {
        type: 'positive' | 'negative' | '';
    }
}
