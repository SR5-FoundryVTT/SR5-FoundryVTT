import { ModifiableField } from "../fields/ModifiableField";
import { ActorArmorData } from "../template/Armor";
import { AttributeChoices, AttributeField, Attributes } from '../template/Attributes';
import { ModifiableValue } from "../template/Base";
import { Tracks } from "../template/ConditionMonitors";
import { Initiative } from "../template/Initiative";
import { AwakendLimits, Limits } from "../template/Limits";
import { Movement } from "../template/Movement";
import { VisibilityChecks } from "../template/Visibility";
import { CommonData, PhysicalCombatValues, CreateModifiers, MagicData, ActorBase } from "./Common";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

const SpiritData = () => ({
    // === Core Identity ===
    ...CommonData(),
    spiritType: new StringField({
        required: true,
        initial: 'air',
        choices: {
            // base types
            air: 'SR5.Spirit.Types.Air',
            aircraft: 'SR5.Spirit.Types.Aircraft',
            airwave: 'SR5.Spirit.Types.Airwave',
            ally: 'SR5.Spirit.Types.Ally',
            automotive: 'SR5.Spirit.Types.Automotive',
            beasts: 'SR5.Spirit.Types.Beasts',
            ceramic: 'SR5.Spirit.Types.Ceramic',
            earth: 'SR5.Spirit.Types.Earth',
            energy: 'SR5.Spirit.Types.Energy',
            fire: 'SR5.Spirit.Types.Fire',
            guardian: 'SR5.Spirit.Types.Guardian',
            guidance: 'SR5.Spirit.Types.Guidance',
            homunculus: 'SR5.Spirit.Types.Homunculus',
            man: 'SR5.Spirit.Types.Man',
            metal: 'SR5.Spirit.Types.Metal',
            plant: 'SR5.Spirit.Types.Plant',
            ship: 'SR5.Spirit.Types.Ship',
            task: 'SR5.Spirit.Types.Task',
            train: 'SR5.Spirit.Types.Train',
            water: 'SR5.Spirit.Types.Water',
            watcher: 'SR5.Spirit.Types.Watcher',

            // toxic types
            toxic_air: 'SR5.Spirit.Types.ToxicAir',
            toxic_beasts: 'SR5.Spirit.Types.ToxicBeasts',
            toxic_earth: 'SR5.Spirit.Types.ToxicEarth',
            toxic_fire: 'SR5.Spirit.Types.ToxicFire',
            toxic_man: 'SR5.Spirit.Types.ToxicMan',
            toxic_water: 'SR5.Spirit.Types.ToxicWater',

            // blood types
            blood: 'SR5.Spirit.Types.Blood',

            // shadow types
            muse: 'SR5.Spirit.Types.Muse',
            nightmare: 'SR5.Spirit.Types.Nightmare',
            shade: 'SR5.Spirit.Types.Shade',
            succubus: 'SR5.Spirit.Types.Succubus',
            wraith: 'SR5.Spirit.Types.Wraith',

            // shedim types
            shedim: 'SR5.Spirit.Types.Shedim',
            hopper: 'SR5.Spirit.Types.Hopper',
            blade_summoned: 'SR5.Spirit.Types.BladeSummoned',
            horror_show: 'SR5.Spirit.Types.HorrorShow',
            unbreakable: 'SR5.Spirit.Types.Unbreakable',
            master_shedim: 'SR5.Spirit.Types.MasterShedim',

            // insect types
            caretaker: 'SR5.Spirit.Types.Caretaker',
            nymph: 'SR5.Spirit.Types.Nymph',
            scout: 'SR5.Spirit.Types.Scout',
            soldier: 'SR5.Spirit.Types.Soldier',
            worker: 'SR5.Spirit.Types.Worker',
            queen: 'SR5.Spirit.Types.Queen',

            // Necro types
            carcass: "SR5.Spirit.Types.Carcass",
            corpse: "SR5.Spirit.Types.Corpse",
            rot: "SR5.Spirit.Types.Rot",
            palefire: "SR5.Spirit.Types.Palefire",
            detritus: "SR5.Spirit.Types.Detritus",

            // Howling Shadow spirits
            anarch: "SR5.Spirit.Types.Anarch",
            arboreal: "SR5.Spirit.Types.Arboreal",
            blackjack: "SR5.Spirit.Types.Blackjack",
            boggle: "SR5.Spirit.Types.Boggle",
            bugul: "SR5.Spirit.Types.Bugul",
            chindi: "SR5.Spirit.Types.Chindi",
            croki: "SR5.Spirit.Types.Croki",
            duende: "SR5.Spirit.Types.Duende",
            ejerian: "SR5.Spirit.Types.Ejerian",
            elvar: "SR5.Spirit.Types.Elvar",
            erinyes: "SR5.Spirit.Types.Erinyes",
            green_man: "SR5.Spirit.Types.GreenMan",
            imp: "SR5.Spirit.Types.Imp",
            jarl: "SR5.Spirit.Types.Jarl",
            kappa: "SR5.Spirit.Types.Kappa",
            kokopelli: "SR5.Spirit.Types.Kokopelli",
            morbi: "SR5.Spirit.Types.Morbi",
            nocnitsa: "SR5.Spirit.Types.Nocnitsa",
            phantom: "SR5.Spirit.Types.Phantom",
            preta: "SR5.Spirit.Types.Preta",
            stabber: "SR5.Spirit.Types.Stabber",
            tungak: "SR5.Spirit.Types.Tungak",
            vucub_caquix: "SR5.Spirit.Types.VucubCaquix",

            // blood magic spirits
            blood_shade: 'SR5.Spirit.Types.BloodShade',
            bone: 'SR5.Spirit.Types.Bone',

            // aetherology spirits
            gum_toad: 'SR5.Spirit.Types.GumToad',
            crawler: 'SR5.Spirit.Types.Crawler',
            ghasts: 'SR5.Spirit.Types.Ghasts',
            vrygoths: 'SR5.Spirit.Types.Vrygoths',
            gremlin: 'SR5.Spirit.Types.Gremlin',
            anansi: 'SR5.Spirit.Types.Anansi',
            tsuchigumo_warrior: 'SR5.Spirit.Types.TsuchigumoWarrior',

            // horror terrors spirits
            corps_cadavre: 'SR5.Spirit.Types.CorpsCadavre',
        }
    }),
    full_defense_attribute: new StringField({ required: true, initial: "willpower", choices: AttributeChoices(), }),
    special: new StringField({ required: true, initial: "magic", readonly: true }),
    is_npc: new BooleanField({ initial: true }),
    npc: new SchemaField({ is_grunt: new BooleanField() }),

    // === Attributes & Limits ===
    attributes: new SchemaField({
        ...Attributes(),
        force: new ModifiableField(AttributeField())
    }),
    limits: new SchemaField({ ...Limits(), ...AwakendLimits() }),
    values: new SchemaField(PhysicalCombatValues()),
    force: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0, step: 1 }),

    // === Magic ===
    magic: new SchemaField(MagicData()),

    // === Combat ===
    armor: new ModifiableField(ActorArmorData()),
    initiative: new SchemaField(Initiative('astral', 'meatspace')),
    wounds: new ModifiableField(ModifiableValue()),

    // === Condition & Movement ===
    track: new SchemaField(Tracks('physical', 'stun')),
    movement: new SchemaField(Movement()),

    // === Summoning ===
    summonerUuid: new StringField({ required: true }),
    services: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0, step: 1 }),
    bound: new BooleanField(),

    // === Visibility ===
    visibilityChecks: new SchemaField(VisibilityChecks("astral", "astralActive")),

    // === Modifiers ===
    modifiers: new SchemaField(CreateModifiers(
        // Limits
        "physical_limit", "astral_limit", "social_limit", "mental_limit",
        // Initiative
        "astral_initiative", "astral_initiative_dice",
        "matrix_initiative", "matrix_initiative_dice",
        "meat_initiative", "meat_initiative_dice",
        // Tracks
        "stun_track", "matrix_track", "physical_track", "physical_overflow_track",
        // Movement
        "walk", "run",
        // Tolerance
        "wound_tolerance", "pain_tolerance_stun", "pain_tolerance_physical",
        // Combat/Defense
        "armor", "multi_defense", "reach", "defense", "defense_dodge", "defense_parry",
        "defense_block", "defense_melee", "defense_ranged", "soak", "recoil",
        // Magic/Matrix
        "drain", "fade", "essence",
        // Miscellaneous
        "composure", "lift_carry", "judge_intentions", "memory", "global"
    )),
});

export class Spirit extends ActorBase<ReturnType<typeof SpiritData>> {
    static override defineSchema() {
        return SpiritData();
    }
    static override LOCALIZATION_PREFIXES = ["SR5.Spirit", "SR5.Actor"];
}

console.log("SpiritData", SpiritData(), new Spirit());
