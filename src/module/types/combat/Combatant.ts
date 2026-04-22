import { InitiativeSchema } from "../template/Initiative";

const { NumberField, BooleanField, SchemaField } = foundry.data.fields;

const CombatantInitiativeData = () => ({
    last: new SchemaField(InitiativeSchema()),
    blitz: new BooleanField({ initial: false }),
});

export const CombatantData = () => ({
    acted: new BooleanField({ initial: false }),
    attackedLastTurn: new BooleanField({ initial: false }),
    coinFlip: new NumberField({ required: true, nullable: false, initial: () => Math.random() }),
    seize: new BooleanField({ initial: false }),
    pad: new BooleanField({ required: false, initial: false }),
    initiative: new SchemaField(CombatantInitiativeData()),
});

export class CombatantDM extends foundry.abstract.TypeDataModel<ReturnType<typeof CombatantData>, Combatant.Implementation> {
    static override defineSchema() {
        return CombatantData();
    }
}
