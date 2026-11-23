import { SR5 } from '@/module/config';

const { SchemaField, BooleanField, StringField } = foundry.data.fields;

/** How an actor type starts out on each plane. Anything left out starts off. */
interface VisibilityDefaults {
    /** A physical body, which physical senses and sensors pick up. */
    body?: boolean;
    /** The heat thermographic vision shows, also once an astral being materializes. */
    heat?: ThermographicSignature;
    /** A living aura on the astral plane. */
    aura?: boolean;
    /** Active on the astral plane, like a spirit, so it is Awakened to astral perception. */
    astralActive?: boolean;
    /** Perceives the astral plane without any magical type. */
    astralPerception?: boolean;
    /** A Matrix icon. */
    icon?: boolean;
}

/** Senses an actor perceives with. */
const PerceptionCapabilitiesData = (defaults: VisibilityDefaults) => ({
    physical: new SchemaField({
        lowLight: new BooleanField(),
        thermographic: new BooleanField(),
        ultrasound: new BooleanField(),
    }),
    astral: new SchemaField({
        perception: new BooleanField({ initial: !!defaults.astralPerception }),
        projection: new BooleanField(),
    }),
    matrix: new SchemaField({
        // Granted on top of the commlink, cyberdeck or RCC that gives augmented reality.
        augmentedReality: new BooleanField(),
    }),
});

/** How an actor can be perceived by others. */
const PerceptionTargetsData = (defaults: VisibilityDefaults) => ({
    physical: new SchemaField({
        hasBody: new BooleanField({ initial: !!defaults.body }),
        heatSignature: new StringField({
            required: true,
            initial: defaults.heat ?? 'none',
            choices: SR5.thermographicSignatures,
            label: 'SR5.Vision.ThermographicSignature',
            hint: 'SR5.Vision.ThermographicSignatureHint',
        }),
    }),
    astral: new SchemaField({
        hasAura: new BooleanField({ initial: !!defaults.aura }),
        astralActive: new BooleanField({ initial: !!defaults.astralActive }),
        affectedBySpell: new BooleanField(),
    }),
    // Overrides of the icon worked out from the actor's wireless devices.
    matrix: new SchemaField({
        // Without it the actor has no icon, whatever it carries.
        hasIcon: new BooleanField({ initial: !!defaults.icon }),
        // Forces every icon of the actor to run silent.
        runningSilent: new BooleanField(),
    }),
});

export const VisibilityChecks = (defaults: VisibilityDefaults) => ({
    capabilities: new SchemaField(PerceptionCapabilitiesData(defaults)),
    targets: new SchemaField(PerceptionTargetsData(defaults)),
});

export type PerceptionCapabilitiesType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof PerceptionCapabilitiesData>>;
export type ThermographicSignature = keyof typeof SR5.thermographicSignatures;
