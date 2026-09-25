import { SR5 } from '@/module/config';

const { NumberField, StringField } = foundry.data.fields;

export const ENVIRONMENT_REGION_BEHAVIOR = 'shadowrun5e.environment';

const RatingField = (name: string) => new NumberField({
    required: true,
    nullable: false,
    integer: true,
    min: 0,
    initial: 0,
    label: `SR5.Vision.EnvironmentalRegions.${name}.Label`,
    hint: `SR5.Vision.EnvironmentalRegions.${name}.Hint`,
});

const LevelField = (name: string) => new StringField({
    required: true,
    nullable: false,
    initial: 'none',
    choices: SR5.environmentLevels,
    label: `SR5.Vision.EnvironmentalRegions.${name}.Label`,
    hint: `SR5.Vision.EnvironmentalRegions.${name}.Hint`,
});

const EnvironmentalRegionData = () => ({
    backgroundCount: RatingField('BackgroundCount'),
    matrixNoise: RatingField('MatrixNoise'),
    visibility: LevelField('Visibility'),
    lightGlare: new StringField({
        required: true,
        nullable: false,
        initial: 'none',
        choices: {
            none: 'SR5.Vision.EnvironmentalRegions.Level.None',
            'light-light': 'SR5.EnvModifiersApplication.Light.Light',
            'light-moderate': 'SR5.EnvModifiersApplication.Light.Moderate',
            'light-heavy': 'SR5.EnvModifiersApplication.Light.Heavy',
            'glare-light': 'SR5.EnvModifiersApplication.Glare.Light',
            'glare-moderate': 'SR5.EnvModifiersApplication.Glare.Moderate',
            'glare-heavy': 'SR5.EnvModifiersApplication.Glare.Heavy',
        },
        label: 'SR5.Vision.EnvironmentalRegions.Light.Label',
        hint: 'SR5.Vision.EnvironmentalRegions.Light.Hint',
    }),
    wind: LevelField('Wind'),
});

export class EnvironmentalRegionBehavior
    extends foundry.data.regionBehaviors.RegionBehaviorType<ReturnType<typeof EnvironmentalRegionData>> {
    static override LOCALIZATION_PREFIXES = ['SR5.Vision.EnvironmentalRegions.Environment'];

    static override defineSchema() {
        return EnvironmentalRegionData();
    }
}

export type EnvironmentalRegionType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof EnvironmentalRegionData>>;
export type EnvironmentLevel = keyof typeof SR5.environmentLevels;
