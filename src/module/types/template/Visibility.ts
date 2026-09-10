const { SchemaField, BooleanField, StringField } = foundry.data.fields;

export type ThermographicSignature = 'none' | 'cold' | 'warm' | 'hot';

export interface PerceptionCapabilities {
    physical: {
        lowLight: boolean;
        thermographic: boolean;
        ultrasound: boolean;
    };
    astral: {
        perception: boolean;
        projection: boolean;
    };
    matrix: {
        perception: boolean;
    };
}

export interface PerceptionTargets {
    physical: {
        thermographic: ThermographicSignature;
    };
    astral: {
        hasAura: boolean;
        astralActive: boolean;
        affectedBySpell: boolean;
    };
    matrix: {
        hasIcon: boolean;
        runningSilent: boolean;
    };
}

export const VisibilityChecks = (...spaces: (Shadowrun.SpaceTypes | 'astralActive')[]) => ({
    capabilities: new SchemaField({
        physical: new SchemaField({
            lowLight: new BooleanField(),
            thermographic: new BooleanField(),
            ultrasound: new BooleanField(),
        }),
        astral: new SchemaField({
            perception: new BooleanField({ initial: spaces.includes('astralActive') }),
            projection: new BooleanField(),
        }),
        matrix: new SchemaField({
            perception: new BooleanField({ initial: spaces.includes('matrix') }),
        }),
    }),
    targets: new SchemaField({
        physical: new SchemaField({
            thermographic: new StringField({
                required: true,
                initial: spaces.includes('meatspace') ? 'warm' : 'none',
                choices: {
                    none: 'SR5.Vision.ThermographicSignatures.None',
                    cold: 'SR5.Vision.ThermographicSignatures.Cold',
                    warm: 'SR5.Vision.ThermographicSignatures.Warm',
                    hot: 'SR5.Vision.ThermographicSignatures.Hot',
                },
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
    }),
});
