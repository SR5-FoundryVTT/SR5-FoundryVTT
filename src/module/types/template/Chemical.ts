const { ArrayField, NumberField, SchemaField, StringField } = foundry.data.fields;

/**
 * Kinds of chemicals. SR5#408 'Toxins', SR5#410 'Drugs', SR5#413 'BTLs'.
 */
export const CHEMICAL_KINDS = ['toxin', 'drug', 'btl'] as const;

/**
 * How a chemical gets into a body. SR5#408 'Vector'.
 */
export const CHEMICAL_VECTORS = ['contact', 'ingestion', 'inhalation', 'injection'] as const;

/**
 * When a chemical takes effect. Immediate means at the end of the current Combat Turn. SR5#408 'Speed'.
 */
export const CHEMICAL_SPEED_UNITS = ['immediate', 'turns', 'seconds', 'minutes', 'hours'] as const;

/**
 * The mechanics of a toxin, drug or BTL, as carried by an item or a dose loaded into something else.
 *
 * An empty kind means the item isn't a chemical.
 */
export const ChemicalData = () => ({
    kind: new StringField({ required: true, blank: true, choices: CHEMICAL_KINDS }),
    vectors: new ArrayField(new StringField({ required: true, blank: false, choices: CHEMICAL_VECTORS })),
    speed: new SchemaField({
        value: new NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }),
        unit: new StringField({ required: true, initial: 'immediate', choices: CHEMICAL_SPEED_UNITS }),
    }),
    // A toxins Power is its DV. Drugs have none.
    power: new NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }),
    // Lowers the rating of protective gear, like AP does for armor.
    penetration: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    damageType: new StringField({ required: true, initial: 'stun', choices: ['physical', 'stun', 'none'] }),
    // Effects of the item applied when the chemical takes hold, each with an optional condition
    // reading the value context, like '@payload.power > @actor.attributes.willpower.value'.
    effects: new ArrayField(new SchemaField({
        id: new StringField({ required: true, blank: false }),
        condition: new StringField({ required: true, blank: true }),
    })),
    // How long a drug lasts, resolved once when taken. Like 'max(1, 6 - @actor.attributes.body.value)' hours.
    duration: new SchemaField({
        formula: new StringField({ required: true, blank: true }),
        unit: new StringField({ required: true, initial: 'hours', choices: ['minutes', 'hours', 'days'] }),
    }),
    // What follows the effect of a drug. SR5#411.
    crash: new SchemaField({
        damage: new NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }),
        damageType: new StringField({ required: true, initial: 'stun', choices: ['physical', 'stun'] }),
        effects: new ArrayField(new StringField({ required: true, blank: false })),
    }),
    // SR5#414 'Addiction Table'.
    addiction: new SchemaField({
        type: new StringField({ required: true, blank: true, choices: ['physiological', 'psychological', 'both'] }),
        rating: new NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }),
        threshold: new NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }),
    }),
});

export type ChemicalType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ChemicalData>>;

const labels = (values: readonly string[], prefix: string) =>
    Object.fromEntries(values.map(value => [value, `${prefix}.${value.capitalize()}`]));

/**
 * Select options of the chemical editor. See templates/v2/item/tabs/details/chemical.hbs.
 */
export const chemicalOptions = () => ({
    kinds: labels(CHEMICAL_KINDS, 'SR5.Chemical.Kinds'),
    vectors: labels(CHEMICAL_VECTORS, 'SR5.Chemical.Vectors'),
    speedUnits: labels(CHEMICAL_SPEED_UNITS, 'SR5.Chemical.SpeedUnits'),
    damageTypes: labels(['physical', 'stun', 'none'], 'SR5.Chemical.DamageTypes'),
    durationUnits: labels(['minutes', 'hours', 'days'], 'SR5.Chemical.SpeedUnits'),
    addictionTypes: labels(['physiological', 'psychological', 'both'], 'SR5.Chemical.AddictionTypes'),
});
