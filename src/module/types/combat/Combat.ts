import { SR } from "@/module/constants";
import { CombatantData } from "./Combatant";

const { NumberField, BooleanField, StringField, ArrayField, SchemaField } = foundry.data.fields;

const CombatHistoryCombatantData = () => ({
    _id: new StringField({ required: true, nullable: false }),
    initiative: new NumberField({ integer: true, required: false, nullable: true, initial: null }),
    defeated: new BooleanField({ required: true, nullable: false, initial: false }),
    system: new SchemaField(CombatantData()),
});

const CombatHistorySnapshotData = () => ({
    round: new NumberField({ integer: true, initial: SR.combat.INITIAL_INI_ROUND }),
    turn: new NumberField({ integer: true, initial: null }),
    initiativePass: new NumberField({ integer: true, initial: SR.combat.INITIAL_INI_PASS }),
    combatants: new ArrayField(new SchemaField(CombatHistoryCombatantData()), { initial: [] }),
});

export const CombatData = () => ({
    initiativePass: new NumberField({
        integer: true,
        required: true,
        nullable: false,
        initial: SR.combat.INITIAL_INI_PASS
    }),
    history: new ArrayField(new SchemaField(CombatHistorySnapshotData()), { initial: [] }),
});

export class CombatDM extends foundry.abstract.TypeDataModel<ReturnType<typeof CombatData>, Combat.Implementation> {
    static override defineSchema() {
        return CombatData();
    }
}
