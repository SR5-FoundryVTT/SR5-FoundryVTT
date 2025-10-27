import { SR5 } from '@/module/config';
import { TagifyField } from '@/module/types/fields/TagifyField';

const { SchemaField, BooleanField, StringField } = foundry.data.fields;

const ActiveEffectData = {
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

export class ActiveEffectDM extends foundry.abstract.TypeDataModel<typeof ActiveEffectData, ActiveEffect.Implementation> {
    static override defineSchema() {
        return ActiveEffectData;
    }

    static override LOCALIZATION_PREFIXES = ["SR5.ActiveEffect"];
}
