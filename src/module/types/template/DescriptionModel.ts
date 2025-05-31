const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

export const DescriptionData = () => ({
    value: new StringField({ required: true, initial: '' }),
    chat: new StringField({ required: true, initial: '' }),
    source: new StringField({ required: true, initial: '' }),
});

export const DescriptionPartData = () => ({
    description: new SchemaField(DescriptionData(), { required: true }),
});
