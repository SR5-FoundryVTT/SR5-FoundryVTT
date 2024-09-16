/// <reference path="../Shadowrun.d.ts" />
declare namespace Shadowrun {
    export type Tracks = {
        physical: PhysicalTrack;
        stun: StunTrack;
    };

    export type MatrixTracks = {
        matrix: MatrickTrack
    }

    /**
     * Individual tracks with additional fields depending on track use case and rules
     */
    export type PhysicalTrack = OverflowTrackType & Living;
    export type StunTrack = TrackType & Living;
    export type MatrickTrack = TrackType;

    /**
     * These kinds of tracks are the basis for all other tracks.
     */
    export type TrackType = 
        ValueMaxPair<number> &
        LabelField &
        DisableField &
        ModifiableValue
    /**
     * A basic track including overflow handling.
     */
    export type OverflowTrackType = TrackType & Overflow;

    /**
     * Add overflow fields to a TrackType
     */
    export type Overflow = {
        overflow: ValueMaxPair<number>;
    };

    /**
     * Add wound / pain / living fields to a TrackType
     */
    export type Living = {
        // Amount of wounds for this track, will be used to calculate wound modifier.
        wounds: number
        // Pain tolerance for this track, will be used to calculate ignored damage for wound modifier.
        pain_tolerance: number
    }
}
