declare namespace Shadowrun {


    export interface ActionData extends
        ActionPartData,
        DescriptionPartData {
        result: ActionResultData
    }

    export interface ActionRollData extends MinimalActionData {
        // Test test class used for the active action test
        // Should be defined in game.shadowrun5e.activeTests
        test: string
        // The type of combat action to be performed.
        type: string
        category: string
        armor: boolean
        spec: boolean
        mod_description: string
        // Use actor armor as part of pool
        limit: LimitData
        threshold: BaseValuePair<number>
        extended: boolean
        modifiers: ModifierTypes[]
        damage: DamageData
        opposed: OpposedTestData
        followed: TestData
        alt_mod: number
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
        skill: SkillName
        attribute: ActorAttribute
        attribute2: ActorAttribute
        mod: number
    }

    /**
     * Action opposed test data.
     */
    export interface OpposedTestData extends TestData {
        type: OpposedType
        // Should match game.shadowrun5e.opposedTests
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
}
