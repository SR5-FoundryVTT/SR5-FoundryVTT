const { NumberField } = foundry.data.fields;

export const CombatData = () => ({
    initiativePass: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
});

export class CombatDM extends foundry.abstract.TypeDataModel<ReturnType<typeof CombatData>, Combat.Implementation> {
    static override defineSchema() {
        return CombatData();
    }
}
