/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export type Limits = {
        [name: string]: LimitField;
    };

    export type LimitField = BaseValuePair<number> & ModifiableValue & CanHideFiled & LabelField;
}
