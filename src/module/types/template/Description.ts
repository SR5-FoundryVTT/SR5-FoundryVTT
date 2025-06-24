const { HTMLField, SchemaField, StringField } = foundry.data.fields;

export const DescriptionData = () => ({
    value: new HTMLField(),
    chat: new StringField({ required: true }),
    source: new StringField({ required: true }),
});

export const DescriptionPartData = () => ({
    description: new SchemaField(DescriptionData()),
});

export type DescriptionType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof DescriptionData>>;
