import { SR5 } from '@/module/config';

const { SchemaField, BooleanField, StringField } = foundry.data.fields;

type SpaceTypes = (Shadowrun.SpaceTypes | 'astralActive')[];

/** Senses an actor perceives with. */
const PerceptionCapabilitiesData = (spaces: SpaceTypes) => ({
    physical: new SchemaField({
        lowLight: new BooleanField(),
        thermographic: new BooleanField(),
        ultrasound: new BooleanField(),
    }),
    astral: new SchemaField({
        perception: new BooleanField({ initial: spaces.includes('astralActive') }),
        projection: new BooleanField(),
    }),
});

/** How an actor can be perceived by others. */
const PerceptionTargetsData = (spaces: SpaceTypes) => ({
    physical: new SchemaField({
        active: new BooleanField({ initial: spaces.includes('meatspace') }),
        thermographic: new StringField({
            required: true,
            initial: spaces.includes('meatspace') ? 'warm' : 'none',
            choices: SR5.thermographicSignatures,
            label: 'SR5.Vision.ThermographicSignature',
            hint: 'SR5.Vision.ThermographicSignatureHint',
        }),
    }),
    astral: new SchemaField({
        hasAura: new BooleanField({ initial: spaces.includes('astral') }),
        astralActive: new BooleanField({ initial: spaces.includes('astralActive') }),
        affectedBySpell: new BooleanField(),
    }),
    matrix: new SchemaField({
        hasIcon: new BooleanField({ initial: spaces.includes('matrix') }),
        runningSilent: new BooleanField(),
    }),
});

export const VisibilityChecks = (...spaces: SpaceTypes) => ({
    capabilities: new SchemaField(PerceptionCapabilitiesData(spaces)),
    targets: new SchemaField(PerceptionTargetsData(spaces)),
});

export type PerceptionCapabilitiesType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof PerceptionCapabilitiesData>>;
export type ThermographicSignature = keyof typeof SR5.thermographicSignatures;
