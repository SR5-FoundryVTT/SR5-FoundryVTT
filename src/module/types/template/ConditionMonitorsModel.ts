const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { ValueMaxPair, ModifiableValue } from "./BaseModel";

const Living = () => ({
    wounds: new NumberField({ required: true, initial: 0 }),
    pain_tolerance: new NumberField({ required: true, initial: 0 }),
});

const Overflow = () => ({
    overflow: new SchemaField(ValueMaxPair()),
});

export const TrackType = () => ({
    ...ValueMaxPair(),
    ...ModifiableValue(),
    base: new NumberField({ required: true, initial: 0 }),
    label: new StringField({ required: true, blank: true, initial: '' }),
    disabled: new BooleanField({ required: false, initial: false })
});

export const OverflowTrackType = () => ({
    ...TrackType(),
    ...Overflow(),
});

export const PhysicalTrack = () => ({
    ...OverflowTrackType(),
    ...Living(),
});

export const StunTrack = () => ({
    ...TrackType(),
    ...Living(),
});

export const MatrickTrack = () => ({
    ...TrackType()
});

export const MatrixTracks = () => ({
    matrix: new SchemaField(MatrickTrack())
});

export const Tracks = () => ({
    stun: new SchemaField(StunTrack()),
    physical: new SchemaField(PhysicalTrack()),
});
