import { SR5 } from '@/module/config';
import { TagifyField } from '@/module/types/fields/TagifyField';

const { SchemaField, BooleanField, StringField } = foundry.data.fields;

type ActiveEffectChangeSchema = {
    key: foundry.data.fields.StringField;
    type: foundry.data.fields.StringField;
    value: foundry.data.fields.AnyField;
    phase: foundry.data.fields.StringField;
    priority: foundry.data.fields.NumberField;
};

const SR5ActiveEffectData = {
    applyTo: new StringField({
        required: true,
        initial: 'actor',
        choices: SR5.effectApplyTo,
    }),

    appliedByTest: new BooleanField(),
    onlyForEquipped: new BooleanField(),
    onlyForWireless: new BooleanField(),
    onlyForItemTest: new BooleanField(),

    selection_attributes: new TagifyField(
        new SchemaField({
            value: new StringField({ required: true, nullable: false }),
            id: new StringField({ required: true, nullable: false }),
        })
    ),
    selection_categories: new TagifyField(
        new SchemaField({
            value: new StringField({ required: true, nullable: false }),
            id: new StringField({ required: true, nullable: false }),
        })
    ),
    selection_limits: new TagifyField(
        new SchemaField({
            value: new StringField({ required: true, nullable: false }),
            id: new StringField({ required: true, nullable: false }),
        })
    ),
    selection_skills: new TagifyField(
        new SchemaField({
            value: new StringField({ required: true, nullable: false }),
            id: new StringField({ required: true, nullable: false }),
        })
    ),
    selection_tests: new TagifyField(
        new SchemaField({
            value: new StringField({ required: true, nullable: false }),
            id: new StringField({ required: true, nullable: false }),
        })
    ),
}

// TODO: fvtt - v14 - Extend V14 datamodel with v13 types.
type SR5ActiveEffectSchema = typeof SR5ActiveEffectData & {
    changes: foundry.data.fields.ArrayField<foundry.data.fields.SchemaField<ActiveEffectChangeSchema>>;
};
const foundryRuntime = Reflect.get(globalThis as object, 'foundry') as { data: object };
const FoundryActiveEffectTypeDataModel = Reflect.get(
    foundryRuntime.data,
    'ActiveEffectTypeDataModel'
) as typeof foundry.abstract.TypeDataModel<SR5ActiveEffectSchema, never>;

export class ActiveEffectDM extends FoundryActiveEffectTypeDataModel {
    static override defineSchema(): SR5ActiveEffectSchema {
        const baseSchema = FoundryActiveEffectTypeDataModel.defineSchema() as SR5ActiveEffectSchema;
        return {
            ...baseSchema,
            ...SR5ActiveEffectData,
        };
    }

    static override LOCALIZATION_PREFIXES = ["SR5.ActiveEffect"];
}
