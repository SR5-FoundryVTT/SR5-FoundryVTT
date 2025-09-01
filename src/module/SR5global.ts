import { SR5Actor } from './actor/SR5Actor';
import { DataDefaults } from './data/DataDefaults';
import { SR5ActiveEffect } from './effect/SR5ActiveEffect';
import { SR5Item } from './item/SR5Item';
import { rollItemMacro, rollSkillMacro } from './macros';
import { SR5Roll } from './rolls/SR5Roll';
import { DocumentSituationModifiers } from './rules/DocumentSituationModifiers';
import { SRStorage } from './storage/storage';

// Tests - Attribute & Skill
import { AttributeOnlyTest } from './tests/AttributeOnlyTest';
import { SkillTest } from './tests/SkillTest';

// Tests - Combat
import { MeleeAttackTest } from './tests/MeleeAttackTest';
import { RangedAttackTest } from './tests/RangedAttackTest';
import { ThrownAttackTest } from './tests/ThrownAttackTest';
import { PhysicalDefenseTest } from './tests/PhysicalDefenseTest';
import { PhysicalResistTest } from './tests/PhysicalResistTest';
import { SuppressionDefenseTest } from './tests/SuppressionDefenseTest';
import { NaturalRecoveryStunTest } from './tests/NaturalRecoveryStunTest';
import { NaturalRecoveryPhysicalTest } from './tests/NaturalRecoveryPhysicalTest';
import { PilotVehicleTest } from './tests/PilotVehicleTest';
import { DronePerceptionTest } from './tests/DronePerceptionTest';
import { DroneInfiltrationTest } from './tests/DroneInfiltrationTest';

// Tests - Magic
import { SpellCastingTest } from './tests/SpellCastingTest';
import { RitualSpellcastingTest } from './tests/RitualSpellcastingTest';
import { DrainTest } from './tests/DrainTest';
import { FadeTest } from './tests/FadeTest';
import { SummonSpiritTest } from './tests/SummonSpiritTest';
import { OpposedSummonSpiritTest } from './tests/OpposedSummonSpiritTest';
import { OpposedRitualTest } from './tests/OpposedRitualTest';
import { CombatSpellDefenseTest } from './tests/CombatSpellDefenseTest';

// Tests - Matrix & Technomancer
import { MatrixTest } from './tests/MatrixTest';
import { MatrixDefenseTest } from './tests/MatrixDefenseTest';
import { MatrixResistTest } from './tests/MatrixResistTest';
import { BiofeedbackResistTest } from './tests/BiofeedbackResistTest';
import { ComplexFormTest } from './tests/ComplexFormTest';
import { CompileSpriteTest } from './tests/CompileSpriteTest';
import { OpposedCompileSpriteTest } from './tests/OpposedCompileSpriteTest';
import { BruteForceTest } from './tests/BruteForceTest';
import { OpposedBruteForceTest } from './tests/OpposedBruteForceTest';
import { HackOnTheFlyTest } from './tests/HackOnTheFlyTest';
import { OpposedHackOnTheFlyTest } from './tests/OpposedHackOnTheFlyTest';

// Tests - General/Opposed
import { SuccessTest } from './tests/SuccessTest';
import { OpposedTest } from './tests/OpposedTest';

// Test Creator
import { TestCreator } from './tests/TestCreator';

export const SR5Global = {
    canvas: {},
    /**
     * System level Document implementations.
     */
    SR5Actor,
    SR5Item,
    SR5ActiveEffect,
    /**
     * Macro hooks used when something's dropped onto the hotbar.
     */
    rollItemMacro,
    rollSkillMacro,
    /**
     * Should you only really need dice handling, use this. If you need more complex testing behaviour,
     * check the Test implementations.
     */
    SR5Roll,

    /**
     * You want to create a test from whatever source?
     * Use this.
     */
    test: TestCreator,
    data: DataDefaults,

    /**
     * You want to access or alter situational modifiers on any document?
     * Use this.
     */
    modifiers: DocumentSituationModifiers,

    /**
     * .tests define what test implementation to use for each test type (key).
     * Should you want to override default behavior for SuccessTest types, overwrite
     * the SuccessTest class reference here
     */
    tests: {
        SuccessTest,
        OpposedTest,
        MeleeAttackTest,
        RangedAttackTest,
        ThrownAttackTest,
        PhysicalDefenseTest,
        MatrixTest,
        MatrixDefenseTest,
        SuppressionDefenseTest,
        PhysicalResistTest,
        SpellCastingTest,
        RitualSpellcastingTest,
        OpposedRitualTest,
        CombatSpellDefenseTest,
        DrainTest,
        FadeTest,
        ComplexFormTest,
        AttributeOnlyTest,
        SkillTest,
        NaturalRecoveryStunTest,
        NaturalRecoveryPhysicalTest,
        PilotVehicleTest,
        DronePerceptionTest,
        DroneInfiltrationTest,
        SummonSpiritTest,
        OpposedSummonSpiritTest,
        CompileSpriteTest,
        OpposedCompileSpriteTest,
        BruteForceTest,
        OpposedBruteForceTest,
        HackOnTheFlyTest,
        OpposedHackOnTheFlyTest,
        MatrixResistTest,
        BiofeedbackResistTest
    },
    /**
     * Subset of tests meant to be used as the main, active test.
     *
     * These will show up on actions when defining the main test to be used.
     */
    activeTests: {
        SuccessTest,
        MeleeAttackTest,
        RangedAttackTest,
        ThrownAttackTest,
        PhysicalResistTest,
        MatrixTest,
        MatrixDefenseTest,
        SuppressionDefenseTest,
        SpellCastingTest,
        ComplexFormTest,
        PhysicalDefenseTest,
        NaturalRecoveryStunTest,
        NaturalRecoveryPhysicalTest,
        DrainTest,
        FadeTest,
        PilotVehicleTest,
        DronePerceptionTest,
        DroneInfiltrationTest,
        SummonSpiritTest,
        CompileSpriteTest,
        RitualSpellcastingTest,
        BruteForceTest,
        HackOnTheFlyTest,
        MatrixResistTest,
        BiofeedbackResistTest
    },
    /**
     * Subset of tests meant to be used as opposed tests.
     *
     * These will show up on actions when defining an opposed test.
     */
    opposedTests: {
        OpposedTest,
        PhysicalDefenseTest,
        MatrixDefenseTest,
        SuppressionDefenseTest,
        CombatSpellDefenseTest,
        OpposedSummonSpiritTest,
        OpposedCompileSpriteTest,
        OpposedRitualTest,
        OpposedBruteForceTest,
        OpposedHackOnTheFlyTest 
    },
    /**
     * Subset of tests meant to be used as resist tests.
     *
     * Instead of showing on the action configuration these are connected to active or opposed test.
     */
    resistTests: {
        PhysicalResistTest,
        MatrixResistTest,
        BiofeedbackResistTest
    },
    /**
     * Subset of tests meant to follow a main active test
     */
    followedTests: {
        DrainTest,
        FadeTest
    },

    /**
     * Amount of delay used on user filter inputs.
     * This came out of an unclear user issue regarding multi-char UTF symbol inputs, to allow
     * 'interactive' changing of the delay on the user side until a sweet spot could be found.
     */
    inputDelay: 300,

    /**
     * The global data storage for the system.
     */
    storage: SRStorage
} as const;
