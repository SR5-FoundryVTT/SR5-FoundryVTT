
declare namespace Shadowrun {


    export interface ActionData extends
        ActionPartData,
        DescriptionPartData {
        result: ActionResultData
    }
    /** 
     * Action information for testing and throwing dice, including all the necessesary values 
     * that need to be collected from both the action item and the actor using it.
     * 
     * The main component being the test implementation string, defining what test to use. 
     * See TestCreator helper for more information. By default SuccessTest should be used.
     * 
     * An action always describes an active test (i.e. a SuccessTest) and might include these other test types:
     * - followed (a test following the main active test, i.e. Drain/Fade) 
     * - opposed (a test opposing the main active test, i.e. Opposed / Defense)
     * - resist (a test to resist damage after an opposed test, i.e. Soak)
     */
    export interface ActionRollData extends MinimalActionData {
        // Test test class used for the active action test
        // Should be defined in game.shadowrun5e.activeTests
        test: string
        // The type of combat action to be performed.
        type: string
        // An additional action category. This field is unused as of v.0.8.0 but inteded for
        // a test category (social, matrix, magic, physical, ...)
        category: string
        // When set to true, the skill specialization modifier must be applied.
        spec: boolean
        // Unused legacy field. Not shown on any template, not set anywhere in system. Unsure about it's original intention.
        mod_description: string
        // The testing threshold
        threshold: BaseValuePair<number>
        // When set to true, the resulting test will be treated as an Extended Success Test
        extended: boolean
        // What general modifier types to fetch from actor / item.
        modifiers: ModifierTypes[]
        // The kind of damage the resulting test should apply to a target.
        damage: DamageData
        // The opposing test to be cast by the targeted actor.
        opposed: OpposedTestData
        // A follow up test to be cast by the same actor that cast this resulting test after it's completion.
        followed: TestData
        // Unused legecy field. Not shown on any template, not set anywhere in system. Unsure about it's original intention.
        alt_mod: number
        // Modification values for the test dice pool applied to this action item.
        // These can come from both the item itself and nested items.
        dice_pool_mod: ModList<number>
    }

    export interface ActionPartData {
        action: ActionRollData
    }

    /**
     * Action limit data.
     */
    export interface LimitData extends ModifiableValueLinked {}
    export type FormulaOperator = 'add'|'subtract'|'multiply'|'divide';

    /**
     * Info about the embedded source item that caused the damage
     */
    export interface DamageSource {
        actorId: string;
        itemId: string;
        itemName: string;
        itemType: string;
    }
    /**
     * Action damage data.
     */
    export interface DamageData extends ModifiableValueLinked {
        type: BaseValuePair<DamageType>;
        element: BaseValuePair<DamageElement>;
        ap: ModifiableValue;
        // See config.actionDamageFormulaOperators for operator mapping.
        base_formula_operator: FormulaOperator;
        source?: DamageSource;
    }

    export interface MinimalActionData {
        // The skill to be used for this test pool. Using the skill identifier.
        skill: SkillName
        // The attribute to be used for this test pool. Using the attribute identifier.
        attribute: ActorAttribute
        // Another attribtue to be used for this test pool. Using the attribute identifier.
        attribute2: ActorAttribute
        // A flat numerical pool modifier.
        mod: number
        // Use actor armor as part of pool
        armor: boolean
        // The testing limit, which can be modified using it's .mod field.
        limit: LimitData
    }

    /**
     * Action opposed test data.
     */
    export interface OpposedTestData extends TestData {
        type: OpposedType
        // NOTE: This description is not used anywhere. Legacy.
        description: string,
        resist: TestData
    }

    /**
     * Minimal data necessary to execute a SuccessTest implementation.
     */
    export interface TestData extends MinimalActionData {
        test: string
    }

    export interface ActionResultData {
        success: {
            matrix: {
                placeMarks: boolean
            }
        }
    }

    /**
     * A list of pack names defined within the system.
     *
     * Mainly here to prohibit using missing packs in code.
     */
    export type PackName = 'Matrix Actions'|'General Actions';
    /**
     * A list of action names defined in any system pack.
     *
     * Mainly here to prohibit using missing actions in code.
     */
    export type PackActionName =
        'physical_damage_resist'
        | 'drain'
        | 'natural_recovery_stun'
        | 'natural_recovery_physical'
        | 'armor'
        | 'fade'
        | 'composure'
        | 'judge_intentions'
        | 'lift_carry'
        | 'memory'
        | 'physical_defense'
        | 'drone_pilot_vehicle'
        | 'drone_perception'
        | 'drone_infiltration';
}
