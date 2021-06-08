/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
      export type QualityData =
          QualityPartData &
          DescriptionPartData &
          ActionPartData;

    export type QualityPartData = {
        type: 'positive' | 'negative' | '';
    };
}
