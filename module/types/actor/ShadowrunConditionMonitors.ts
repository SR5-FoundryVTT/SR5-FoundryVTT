/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export type Tracks = {
        physical: ValueMaxPair<number> & LabelField & ModifiableValue & Overflow;
        stun: ValueMaxPair<number> & LabelField & ModifiableValue;
    };

    export type Overflow = {
        overflow: ValueMaxPair<number>;
    };
}
