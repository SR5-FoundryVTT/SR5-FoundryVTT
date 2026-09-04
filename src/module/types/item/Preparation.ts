import { SR5 } from "@/module/config";
import { ActionPartData } from "./Action";
import { BaseItemData, ItemBase } from "./ItemBase";
import { SpellPartData } from "../template/SpellPart";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

/**
 * An alchemical preparation as described on SR5#304-306.
 *
 * A preparation is a lynchpin object holding a single spell until its trigger fires. It carries a
 * snapshot of the spell it was made from (SpellPartData) instead of a link, so it keeps working
 * when the source spell item is edited or deleted.
 */
const PreparationData = () => ({
    ...BaseItemData(),
    ...SpellPartData(),
    ...ActionPartData({ type: 'simple', test: 'PreparationTriggerTest' }),

    // Provenance of the spell this preparation was made from. Informational only, never dereferenced.
    spellUuid: new StringField({ required: true }),

    // The force the preparation was created at. SR5#304 'Step 2: Choose Spell Force'.
    force: new NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 1 }),

    // SR5#305 'Step 4: Choose Preparation Trigger'.
    trigger: new StringField({
        blank: true,
        required: true,
        choices: SR5.preparationTriggers
    }),
    // Countdown in seconds for the time trigger, counted from creation. Unused by other triggers.
    triggerTime: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),

    potency: new SchemaField({
        // Net hits of the creation test. SR5#305 'Step 5: Create the Preparation'.
        base: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
        // Derived from base and the elapsed world time. See PreparationPrep.
        value: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    }),

    created: new SchemaField({
        // game.time.worldTime at the moment of creation, the anchor for potency decay.
        worldTime: new NumberField({ required: true, nullable: false, initial: 0 }),
    }),

    // Potency reached 0 or the lynchpin broke: the spell is lost but the object remains. SR5#305.
    inert: new BooleanField({ initial: false }),
});

export class Preparation extends ItemBase<ReturnType<typeof PreparationData>> {
    static override defineSchema() {
        return PreparationData();
    }

    static override LOCALIZATION_PREFIXES = ["SR5.Item", "SR5.Spell", "SR5.Preparation"];
}
