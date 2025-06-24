const { SchemaField, BooleanField, StringField } = foundry.data.fields;

export const ImportFlagData = () => ({
    name: new StringField({ required: true, initial: '' }),
    type: new StringField({ required: true, initial: '' }),
    subType: new StringField({ required: true, initial: '' }),
    isImported: new BooleanField({ required: true, initial: false }),
    isFreshImport: new BooleanField({ required: true, initial: false }),
});

export const ImportFlags = () => ({
    importFlags: new SchemaField(ImportFlagData())
});

export type ImportFlagType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ImportFlagData>>;
