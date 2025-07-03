const { SchemaField, BooleanField } = foundry.data.fields;

export const VisibilityChecks = (...spaces: (Shadowrun.SpaceTypes | 'astralActive')[]) => ({
    astral: new SchemaField({
        hasAura: new BooleanField({ initial: spaces.includes('astral') }),
        astralActive: new BooleanField({ initial: spaces.includes('astralActive') }),
        affectedBySpell: new BooleanField(),
    }),
    matrix: new SchemaField({
        hasIcon: new BooleanField({ initial: spaces.includes('matrix') }),
        runningSilent: new BooleanField(),
    }),
    meat: new SchemaField({
        hasHeat: new BooleanField({ initial: spaces.includes('meatspace') })
    }),
});
