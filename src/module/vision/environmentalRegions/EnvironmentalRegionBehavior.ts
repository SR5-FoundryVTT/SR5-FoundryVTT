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
        // Every field has a SR5.Vision.EnvironmentalRegions.<name>.Label and .Hint localization.
        const labels = (name: string) => ({
            label: `SR5.Vision.EnvironmentalRegions.${name}.Label`,
            hint: `SR5.Vision.EnvironmentalRegions.${name}.Hint`,
        });
        const rating = (name: string) => new NumberField({
            required: true,
            nullable: false,
            integer: true,
            min: 0,
            initial: 0,
            ...labels(name),
        });
        const level = (name: string) => new StringField({
            required: true,
            nullable: false,
            initial: 'none',
            choices: {
                none: 'SR5.Vision.EnvironmentalRegions.Level.None',
                light: 'SR5.Vision.EnvironmentalRegions.Level.Light',
                moderate: 'SR5.Vision.EnvironmentalRegions.Level.Moderate',
                heavy: 'SR5.Vision.EnvironmentalRegions.Level.Heavy',
            },
            ...labels(name),
        });

        return {
            backgroundCount: rating('BackgroundCount'),
            matrixNoise: rating('MatrixNoise'),
            visibility: level('Visibility'),
            light: level('Light'),
            wind: level('Wind'),
        };
    }
}

export const registerEnvironmentalRegionBehaviors = () => {
    CONFIG.RegionBehavior.dataModels[ENVIRONMENT_REGION_BEHAVIOR] = EnvironmentalRegionBehavior;
    CONFIG.RegionBehavior.typeIcons[ENVIRONMENT_REGION_BEHAVIOR] = 'fa-solid fa-cloud-sun';
    CONFIG.RegionBehavior.typeLabels[ENVIRONMENT_REGION_BEHAVIOR] =
        'SR5.Vision.EnvironmentalRegions.Environment.Label';
};
