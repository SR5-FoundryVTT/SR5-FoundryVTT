const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

const ImportFlagData = () => ({
    name: new StringField({ required: true, initial: '' }),
    type: new StringField({ required: true, initial: '' }),
    subType: new StringField({ required: true, initial: '' }),
    isImported: new BooleanField({ required: true, initial: false }),
    isFreshImport: new BooleanField({ required: true, initial: false }),
});

export const ImportFlags = () => ({
    importFlags: new SchemaField(ImportFlagData())
});
