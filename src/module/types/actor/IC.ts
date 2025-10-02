import { Tracks } from "../template/ConditionMonitors";
import { Attributes, MatrixActorAttributes } from '../template/Attributes';
import { ActorBase, CommonData, CreateModifiers } from "./Common";
import { MatrixAttributes, MatrixData } from "../template/Matrix";
import { Initiative } from "../template/Initiative";
import { VisibilityChecks } from "../template/Visibility";
import { MatrixLimits } from "../template/Limits";
const { SchemaField, NumberField, StringField } = foundry.data.fields;

// === Main Schema ===
const ICData = () => ({
    // === Core Identity ===
    ...CommonData(),
    icType: new StringField({ required: true }),
    special: new StringField({ required: true, initial: 'mundane', choices: ['mundane'], readonly: true }),

    // === Matrix & Host ===
    matrix: new SchemaField(MatrixData()),
    host: new SchemaField({
        rating: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
        atts: new SchemaField(MatrixAttributes(false)),
    }),

    // === Attributes ===
    attributes: new SchemaField({
        ...Attributes(),
        ...MatrixActorAttributes(),
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
        'mark_damage',
        "global"
    )),
});

export class IC extends ActorBase<ReturnType<typeof ICData>> {
    static override defineSchema() {
        return ICData();
    }
}

console.log("ICData", ICData(), new IC());
