
declare namespace Shadowrun {
    export interface ActionData extends
        ActionPartData,
        ImportFlags,
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
        // The type of combat action to be performed. @taMiF: I don't think this is in use.
        type: string
        // A grouping of actions for different purposes.
        categories: ActionCategories[]
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
        // Unused legacy field. Not shown on any template, not set anywhere in system. Unsure about it's original intention.
        alt_mod: number
        // Modification values for the test dice pool applied to this action item.
        // These can come from both the item itself and nested items.
        dice_pool_mod: ModList<number>
        // Predefine FoundryVTT roll mode within an action, if you chooses so
        roll_mode: ActionRollMode
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
        ap: ModifiableValueLinked;
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

    /*
     * A test label for item action chat message casting button creation
     */
    export type ActionTestLabel =  {
        label: string;
        uuid: string;
    }

    /**
     * Copy of FoundryVTT RollMode for messages and rolls.
     */
    type FoundryRollMode = 'publicroll' | 'gmroll' | 'blindroll' | 'selfroll'
    /**
     * The actual usable values for an action.
     */
    type ActionRollMode = FoundryRollMode | ''

    /**
     * What kind of action is being performed.
     * 
     * This can be used to group different actions together for different purposes.
     * It can also be used for ActiveEffects to target a group of tests, if skill or test implementations used
     * are to specific.
     */
    type ActionCategories = 
        '' | // Empty values are allowed to allow users not having to set an action category.
        'addiction_mental' | // resisting against mental addiction
        'addiction_physical' | // resisting against physical addiction
        'addiction' | // resisting against addiction in general
        'attack_melee' | // attacks made with melee weapons
        'attack_ranged' | // attacks made with ranged weapons
        'attack_thrown' | // attacks made with thrown weapons
        'attack' | // attacks in general, includes all other attack types
        'brute_force' | // matrix brute force action
        'climbing' | // using climbing skills
        'compiling' | // technomancer compiling sprites action
        'complex_form' | // technomancer threading complex form action
        'defense_suppression' | // defending against suppression attacks
        'defense' | // defending in general, includes all other defense types
        'drain' | // resisting against drain
        'fade' | // resisting against fade
        'hack_on_the_fly' | // matrix hack on the fly action
        'magic' | // all magic actions in general
        'matrix' | // all  matrix actions in general
        'recovery_physical' | // natural recovery of physical damage
        'recovery_stun' | // natural recovery of stun damage
        'recovery' | // natural recovery in general, includes all other recovery types
        'resist' | // resisting damage after getting hit
        'resist_disease' | // resisting against diseases
        'resist_toxin' | // resisting against toxins
        'resonance' | // all resonance actions in general
        'rigging' | // all rigging actions in general
        'social' | // all social skill actions
        'spell_combat' |  // all combat spells
        'spell_detection' | // all detection spells
        'spell_healing' | // all healing spells
        'spell_illusion' | // all illusion spells
        'spell_manipulation' | // all manipulation spells
        'spell_ritual' |  // all ritual spells
        'summoning' // magical summoning of spirits
}
