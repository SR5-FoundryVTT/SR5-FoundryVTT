import { ValueMaxPair, ModifiableValue } from "./Base";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

const Living = () => ({
    wounds: new NumberField({ required: true, nullable: false, initial: 0 }),
    pain_tolerance: new NumberField({ required: true, nullable: false, initial: 0 }),
});

export const Track = () => ({
    ...ValueMaxPair(),
    ...ModifiableValue(),
    label: new StringField({ required: true }),
    disabled: new BooleanField() // does it used?
});

const OverflowTrack = () => ({
    ...Track(),
    overflow: new SchemaField(ValueMaxPair()),
});

type TrackTypes = 'matrix' | 'physical' | 'stun';
export const Tracks = <
    T extends TrackTypes[] = ['matrix', 'physical', 'stun']
>(...types: T) => {
    const stunTrack = {
        stun: new SchemaField({ ...Track(), ...Living() })
    };

    const physicalTrack = {
        physical: new SchemaField({ ...OverflowTrack(), ...Living() })
    };

    const matrixTrack = {
        matrix: new SchemaField(Track())
    };

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {
        ...( types.includes('matrix') ? matrixTrack : {} ),
        ...( types.includes('physical') ? physicalTrack : {} ),
        ...( types.includes('stun') ? stunTrack : {} ),
    } as (
        T extends readonly any[] ?
            ('matrix' extends T[number] ? typeof matrixTrack : unknown) &
            ('physical' extends T[number] ? typeof physicalTrack : unknown) &
            ('stun' extends T[number] ? typeof stunTrack : unknown)
        : never
    );
};

export type TrackType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof Track>>;
export type OverflowTrackType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof OverflowTrack>>;
