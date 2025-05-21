import { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

const Living: DataSchema = {
    wounds: new NumberField({ required: true, initial: 0 }),
    pain_tolerance: new NumberField({ required: true, initial: 0 }),
}

const Overflow: DataSchema = {
    overflow: new SchemaField(SM.ValueMaxPair),
}

const TrackType: DataSchema = {
    ...SM.ValueMaxPair,
    ...SM.ModifiableValue,
    label: new StringField({ required: false, initial: '' }),
    disable: new BooleanField({ required: false, initial: false })
}

const OverflowTrackType: DataSchema = {
    ...TrackType,
    ...Overflow,
}

const PhysicalTrack: DataSchema = {
    ...OverflowTrackType,
    ...Living,
}

const StunTrack: DataSchema = {
    ...TrackType,
    ...Living,
}

const MatrickTrack: DataSchema = {
    ...TrackType
}

export const MatrixTracks: DataSchema = {
    matrix: new SchemaField(MatrickTrack)
}

export const Tracks: DataSchema = {
    physical: new SchemaField(PhysicalTrack),
    stun: new SchemaField(StunTrack),
}
