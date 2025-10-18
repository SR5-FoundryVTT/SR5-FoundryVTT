import { SR } from "@/module/constants";

const { NumberField } = foundry.data.fields;

export const CombatData = () => ({
    initiativePass: new NumberField({
        integer: true,
        required: true,
        nullable: false,
        initial: SR.combat.INITIAL_INI_PASS
    }),
});

export class CombatDM extends foundry.abstract.TypeDataModel<ReturnType<typeof CombatData>, Combat.Implementation> {
    static override defineSchema() {
        return CombatData();
    }
}
