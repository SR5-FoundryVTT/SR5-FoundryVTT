import { ActionPartData } from "./Action";
import { BaseItemData, ItemBase } from "./ItemBase";
import { SR5 } from '@/module/config';
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

const SpellData = () => ({
    ...BaseItemData(),
    ...ActionPartData({followedTest: 'DrainTest'}),

    type: new StringField({
        blank: true,
        required: true,
        choices: SR5.spellTypes
    }),
    category: new StringField({
        blank: true,
        required: true,
        choices: SR5.spellCategories // what to do with enchantment (from chummer)?
    }),
    drain: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    range: new StringField({
        blank: true,
        required: true,
        choices: SR5.spellRanges
    }),
    duration: new StringField({
        blank: true,
        required: true,
        choices: SR5.durations
    }),

    extended: new BooleanField({ initial: false }),
    combat: new SchemaField({
        type: new StringField({
            blank: true,
            required: true,
            choices: SR5.combatSpellTypes
        }),
    }),
    detection: new SchemaField({
        type: new StringField({
            blank: true,
            required: true,
            choices: SR5.detectionSpellTypes
        }),
        passive: new BooleanField(),
        extended: new BooleanField(), // do we need this?
    }),
    illusion: new SchemaField({
        type: new StringField({
            blank: true,
            required: true,
            choices: SR5.illusionSpellTypes
        }),
        sense: new StringField({
            blank: true,
            required: true,
            choices: SR5.illusionSpellSenses
        }),
    }),
    manipulation: new SchemaField({
        damaging: new BooleanField(),
        mental: new BooleanField(),
        environmental: new BooleanField(),
        physical: new BooleanField(),
    }),
    ritual: new SchemaField({
        type: new StringField({
            blank: true,
            required: true,
            choices: SR5.ritualSpellTypes
        }),
    }),
});

export class Spell extends ItemBase<ReturnType<typeof SpellData>> {
    static override defineSchema() {
        return SpellData();
    }

    static override LOCALIZATION_PREFIXES = ["SR5.Spell", "SR5.Item"];
}

console.log("SpellData", SpellData(), new Spell());
