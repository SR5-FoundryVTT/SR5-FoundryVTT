const { BooleanField, StringField } = foundry.data.fields;

export const ImportFlagData = () => ({
    isFreshImport: new BooleanField(),
    name: new StringField({ required: true }),
    category: new StringField({ required: true }),
    sourceid: new StringField({ required: true }),
});

export type ImportFlagType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ImportFlagData>>;
