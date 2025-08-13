import { TagifyArrayField } from '@/module/types/fields/TagifyArrayField';

const { SchemaField, BooleanField, StringField } = foundry.data.fields;

const ActiveEffectData = {
    applyTo: new StringField({
        required: true,
        initial: 'actor',
        choices: ['actor', 'targeted_actor', 'test_all', 'test_item', 'modifier', 'item'],
    }),

    appliedByTest: new BooleanField(),
    onlyForEquipped: new BooleanField(),
    onlyForWireless: new BooleanField(),
    onlyForItemTest: new BooleanField(),

    selection_attributes: new TagifyArrayField(
        new SchemaField({
            value: new StringField({ required: true, nullable: false }),
            id: new StringField({ required: true, nullable: false }),
        })
    ),
    selection_categories: new TagifyArrayField(
        new SchemaField({
            value: new StringField({ required: true, nullable: false }),
            id: new StringField({ required: true, nullable: false }),
        })
    ),
    selection_limits: new TagifyArrayField(
        new SchemaField({
            value: new StringField({ required: true, nullable: false }),
            id: new StringField({ required: true, nullable: false }),
        })
    ),
    selection_skills: new TagifyArrayField(
        new SchemaField({
            value: new StringField({ required: true, nullable: false }),
            id: new StringField({ required: true, nullable: false }),
        })
    ),
    selection_tests: new TagifyArrayField(
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
