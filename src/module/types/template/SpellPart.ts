import { SR5 } from "@/module/config";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

/**
 * The spell defining fields shared by the 'spell' item and the 'preparation' item.
 *
 * An alchemical preparation stores the spell it was made from as a snapshot rather than a link,
 * so a preparation keeps working after its source spell item is deleted or edited. See SR5#304
 * 'Step 1: Choose a Spell'.
 */
export const SpellPartData = () => ({
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
});

export type SpellPartType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof SpellPartData>>;

/**
 * The subset of spell fields copied from a spell item onto a preparation created from it.
 */
export const spellPartKeys = Object.keys(SpellPartData()) as (keyof SpellPartType)[];
