import { SanitizedModel } from "../fields/SanitizedModel";
const { ArrayField, SchemaField, BooleanField, StringField } = foundry.data.fields;

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

    selection_categories: new ArrayField(
        new SchemaField({
            value: new StringField({ required: true, nullable: false }),
            id: new StringField({ required: true, nullable: false }),
        })
    ),
    selection_tests: new ArrayField(
        new SchemaField({
            value: new StringField({ required: true, nullable: false }),
            id: new StringField({ required: true, nullable: false }),
        })
    ),
    selection_skills: new ArrayField(
        new SchemaField({
            value: new StringField({ required: true, nullable: false }),
            id: new StringField({ required: true, nullable: false }),
        })
    ),
    selection_attributes: new ArrayField(
        new SchemaField({
            value: new StringField({ required: true, nullable: false }),
            id: new StringField({ required: true, nullable: false }),
        })
    ),
}

export class ActiveEffectDM extends SanitizedModel<typeof ActiveEffectData, ActiveEffect.Implementation> {
    static override defineSchema() {
        return ActiveEffectData;
    }
}
