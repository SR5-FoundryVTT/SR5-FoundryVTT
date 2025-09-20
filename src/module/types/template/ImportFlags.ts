const { BooleanField, StringField } = foundry.data.fields;

export const ImportFlagData = () => ({
    name: new StringField({ required: true }),
    type: new StringField({ required: true }),
    subType: new StringField({ required: true }),
    isImported: new BooleanField(),
    isFreshImport: new BooleanField(),
});

export type ImportFlagType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ImportFlagData>>;
