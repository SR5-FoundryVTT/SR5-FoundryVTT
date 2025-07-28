const { HTMLField, StringField } = foundry.data.fields;

export const DescriptionData = () => ({
    value: new HTMLField(),
    chat: new StringField({ required: true }),
    source: new StringField({ required: true }),
});

export type DescriptionType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof DescriptionData>>;
