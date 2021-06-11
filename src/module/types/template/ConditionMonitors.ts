/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export type Tracks = {
        physical: TrackType & Overflow;
        stun: TrackType;
    };

    export type MatrixTracks = {
        matrix: TrackType
    }

    export type PhysicalTrack = OverflowTrackType;
    export type StunTrack = TrackType;

    export type TrackType = ValueMaxPair<number> &
        LabelField &
        ModifiableValue &
        DisableField & {
            wounds: number;
        };

    export type OverflowTrackType = TrackType & Overflow;

    export type Overflow = {
        overflow: ValueMaxPair<number>;
    };
}
