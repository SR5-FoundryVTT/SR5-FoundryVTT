const { StringField } = foundry.data.fields;

export const SystemData = () => ({
    version: new StringField({ required: true, initial: () => game.system?.version ?? '' }),
});
