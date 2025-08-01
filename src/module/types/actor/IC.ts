import { Tracks } from "../template/ConditionMonitors";
import { AttributeField, Attributes } from "../template/Attributes";
import { ActorBase, CommonData, CreateModifiers } from "./Common";
import { MatrixAttributes, MatrixData } from "../template/Matrix";
import { Initiative } from "../template/Initiative";
import { VisibilityChecks } from "../template/Visibility";
import { MatrixLimits } from "../template/Limits";
import { ModifiableField } from "../fields/ModifiableField";
const { SchemaField, NumberField, StringField } = foundry.data.fields;

// === Main Schema ===
const ICData = () => ({
    // === Core Identity ===
    ...CommonData(),
    icType: new StringField({ required: true }),
    special: new StringField({ required: true, initial: 'mundane', readonly: true }),

    // === Matrix & Host ===
    matrix: new SchemaField(MatrixData()),
    host: new SchemaField({
        rating: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
        id: new StringField({ required: true }),
        atts: new SchemaField(MatrixAttributes(false)),
    }),

    // === Attributes ===
    attributes: new SchemaField({
        ...Attributes(),
        rating: new ModifiableField(AttributeField()),
    }),
    limits: new SchemaField(MatrixLimits()),

    // === Condition & Monitoring ===
    track: new SchemaField(Tracks('matrix')),
    initiative: new SchemaField(Initiative('matrix')),
    visibilityChecks: new SchemaField(VisibilityChecks('matrix')),

    // === Modifiers ===
    modifiers: new SchemaField(CreateModifiers(
        "defense",
        "defense_dodge",
        "defense_block",
        "defense_parry",
        "defense_melee",
        "defense_ranged",
        "soak",
        "matrix_initiative",
        "matrix_initiative_dice",
        "matrix_track",
        "global"
    )),
});

export class IC extends ActorBase<ReturnType<typeof ICData>> {
    static override defineSchema() {
        return ICData();
    }
}

console.log("ICData", ICData(), new IC());
