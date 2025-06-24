const { HTMLField, SchemaField, StringField } = foundry.data.fields;

export const DescriptionData = () => ({
    value: new HTMLField({ required: true, initial: '' }),
    chat: new StringField({ required: true, initial: '' }),
    source: new StringField({ required: true, initial: '' }),
});

export const DescriptionPartData = () => ({
    description: new SchemaField(DescriptionData(), { required: true }),
});

export type DescriptionType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof DescriptionData>>;
