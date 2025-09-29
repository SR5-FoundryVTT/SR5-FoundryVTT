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
    icType: new StringField({ required: true,
        initial:'patrol',
        choices: {
            acid: "SR5.IC.Types.Acid",
            binder: "SR5.IC.Types.Binder",
            black_ic: "SR5.IC.Types.BlackIC",
            blaster: "SR5.IC.Types.Blaster",
            bloodhound: "SR5.IC.Types.Bloodhound",
            blue_goo: "SR5.IC.Types.BlueGoo",
            catapult: "SR5.IC.Types.Catapult",
            crash: "SR5.IC.Types.Crash",
            flicker: "SR5.IC.Types.Flicker",
            jammer: "SR5.IC.Types.Jammer",
            killer: "SR5.IC.Types.Killer",
            marker: "SR5.IC.Types.Marker",
            patrol: "SR5.IC.Types.Patrol",
            probe: "SR5.IC.Types.Probe",
            scramble: "SR5.IC.Types.Scramble",
            shocker: "SR5.IC.Types.Shocker",
            sleuther: "SR5.IC.Types.Sleuther",
            sparky: "SR5.IC.Types.Sparky",
            tar_baby: "SR5.IC.Types.TarBaby",
            track: "SR5.IC.Types.Track"

        }
    }),
    special: new StringField({ required: true, initial: 'mundane', readonly: true }),

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
    static override LOCALIZATION_PREFIXES = ["SR5.IC", "SR5.Actor"];
}

console.log("ICData", ICData(), new IC());
