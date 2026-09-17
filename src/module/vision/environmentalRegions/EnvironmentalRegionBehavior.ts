export const ENVIRONMENT_REGION_BEHAVIOR = 'shadowrun5e.environment';

export const ENVIRONMENT_LEVELS = ['none', 'light', 'moderate', 'heavy'] as const;
export type EnvironmentLevel = typeof ENVIRONMENT_LEVELS[number];

export interface EnvironmentalRegionBehaviorData {
    backgroundCount: number;
    matrixNoise: number;
    visibility: EnvironmentLevel;
    light: EnvironmentLevel;
    wind: EnvironmentLevel;
}

type EnvironmentalRegionSchema = {
    backgroundCount: foundry.data.fields.NumberField;
    matrixNoise: foundry.data.fields.NumberField;
    visibility: foundry.data.fields.StringField;
    light: foundry.data.fields.StringField;
    wind: foundry.data.fields.StringField;
};

export class EnvironmentalRegionBehavior
    extends foundry.data.regionBehaviors.RegionBehaviorType<EnvironmentalRegionSchema> {
    static override LOCALIZATION_PREFIXES = ['SR5.Vision.EnvironmentalRegions.Environment'];

    static override defineSchema() {
        const { NumberField, StringField } = foundry.data.fields;
        const rating = (label: string, hint: string) => new NumberField({
            required: true,
            nullable: false,
            integer: true,
            min: 0,
            initial: 0,
            label,
            hint,
        });
        const level = (label: string, hint: string) => new StringField({
            required: true,
            nullable: false,
            initial: 'none',
            choices: {
                none: 'SR5.Vision.EnvironmentalRegions.Level.None',
                light: 'SR5.Vision.EnvironmentalRegions.Level.Light',
                moderate: 'SR5.Vision.EnvironmentalRegions.Level.Moderate',
                heavy: 'SR5.Vision.EnvironmentalRegions.Level.Heavy',
            },
            label,
            hint,
        });

        return {
            backgroundCount: rating(
                'SR5.Vision.EnvironmentalRegions.BackgroundCount.Label',
                'SR5.Vision.EnvironmentalRegions.BackgroundCount.Hint',
            ),
            matrixNoise: rating(
                'SR5.Vision.EnvironmentalRegions.MatrixNoise.Label',
                'SR5.Vision.EnvironmentalRegions.MatrixNoise.Hint',
            ),
            visibility: level(
                'SR5.Vision.EnvironmentalRegions.Visibility.Label',
                'SR5.Vision.EnvironmentalRegions.Visibility.Hint',
            ),
            light: level(
                'SR5.Vision.EnvironmentalRegions.Light.Label',
                'SR5.Vision.EnvironmentalRegions.Light.Hint',
            ),
            wind: level(
                'SR5.Vision.EnvironmentalRegions.Wind.Label',
                'SR5.Vision.EnvironmentalRegions.Wind.Hint',
            ),
        };
    }
}

export const registerEnvironmentalRegionBehaviors = () => {
    CONFIG.RegionBehavior.dataModels[ENVIRONMENT_REGION_BEHAVIOR] = EnvironmentalRegionBehavior;
    CONFIG.RegionBehavior.typeIcons[ENVIRONMENT_REGION_BEHAVIOR] = 'fa-solid fa-cloud-sun';
    CONFIG.RegionBehavior.typeLabels[ENVIRONMENT_REGION_BEHAVIOR] =
        'SR5.Vision.EnvironmentalRegions.Environment.Label';
};
