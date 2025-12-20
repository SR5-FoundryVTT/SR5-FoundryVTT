const { NumberField, BooleanField } = foundry.data.fields;

export const CombatantData = () => ({
    acted: new BooleanField({ initial: false }),
    attackedLastTurn: new BooleanField({ initial: false }),
    coinFlip: new NumberField({ required: true, nullable: false, initial: Math.random() }),
    seize: new BooleanField({ initial: false }),
});

export class CombatantDM extends foundry.abstract.TypeDataModel<ReturnType<typeof CombatantData>, Combatant.Implementation> {
    static override defineSchema() {
        return CombatantData();
    }
}
