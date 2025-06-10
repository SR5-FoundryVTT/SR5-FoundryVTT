import { ValueMaxPair, ModifiableValue } from "./Base";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

const Living = () => ({
    wounds: new NumberField({ required: true, nullable: false, initial: 0 }),
    pain_tolerance: new NumberField({ required: true, nullable: false, initial: 0 }),
});

const Overflow = () => ({
    overflow: new SchemaField(ValueMaxPair()),
});

export const Track = () => ({
    ...ValueMaxPair(),
    ...ModifiableValue(),
    base: new NumberField({ required: true, nullable: false, initial: 0 }), // Does if use it?
    label: new StringField({ required: true, initial: '' }),
    disabled: new BooleanField({ required: false, initial: false })
});

export const OverflowTrack = () => ({
    ...Track(),
    ...Overflow(),
});

export const PhysicalTrack = () => ({
    ...OverflowTrack(),
    ...Living(),
});

export const StunTrack = () => ({
    ...Track(),
    ...Living(),
});

export const MatrickTrack = () => ({
    ...Track()
});

export const MatrixTracks = () => ({
    matrix: new SchemaField(MatrickTrack())
});

export const Tracks = () => ({
    stun: new SchemaField(StunTrack()),
    physical: new SchemaField(PhysicalTrack()),
});

export type TrackType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof Track>>;
export type OverflowTrackType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof OverflowTrack>>;
