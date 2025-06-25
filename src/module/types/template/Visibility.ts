const { SchemaField, BooleanField } = foundry.data.fields;

export const VisibilityChecks = (...spaces: Shadowrun.SpaceTypes[]) => ({
    astral: new SchemaField({
        hasAura: new BooleanField({ initial: spaces.includes('astral') }),
        astralActive: new BooleanField(),
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
