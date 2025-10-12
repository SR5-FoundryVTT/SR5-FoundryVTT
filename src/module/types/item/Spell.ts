import { SR5 } from "@/module/config";
import { Typed } from "../typed";
import { ActionPartData } from "./Action";
import { BaseItemData, ItemBase } from "./ItemBase";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

const SpellData = () => ({
    ...BaseItemData(),
    ...ActionPartData({followedTest: 'DrainTest'}),

    type: new StringField({
        blank: true,
        required: true,
        choices: Typed.keys(SR5.spellTypes)
    }),
    category: new StringField({
        blank: true,
        required: true,
        choices: Typed.keys(SR5.spellCategories)
    }),
    drain: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    range: new StringField({
        blank: true,
        required: true,
        choices: Typed.keys(SR5.spellRanges)
    }),
    duration: new StringField({
        blank: true,
        required: true,
        choices: Typed.keys(SR5.durations)
    }),

    extended: new BooleanField({ initial: false }),
    combat: new SchemaField({
        type: new StringField({
            blank: true,
            required: true,
            choices: Typed.keys(SR5.combatSpellTypes)
        }),
    }),
    detection: new SchemaField({
        type: new StringField({
            blank: true,
            required: true,
            choices: Typed.keys(SR5.detectionSpellTypes)
        }),
        passive: new BooleanField(),
        extended: new BooleanField(), // do we need this?
    }),
    illusion: new SchemaField({
        type: new StringField({
            blank: true,
            required: true,
            choices: Typed.keys(SR5.illusionSpellTypes)
        }),
        sense: new StringField({
            blank: true,
            required: true,
            choices: Typed.keys(SR5.illusionSpellSenses)
        }),
    }),
    manipulation: new SchemaField({
        damaging: new BooleanField(),
        mental: new BooleanField(),
        environmental: new BooleanField(),
        physical: new BooleanField(),
    }),
});

export class Spell extends ItemBase<ReturnType<typeof SpellData>> {
    static override defineSchema() {
        return SpellData();
    }
}

console.log("SpellData", SpellData(), new Spell());
