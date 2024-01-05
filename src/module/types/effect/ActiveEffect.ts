/// <reference path="../Shadowrun.ts" />

/**
 * Typings around the 'AdvancedEffects' implementation of system on top of Foundry core ActiveEffects
 */

declare namespace Shadowrun {
    // Applicable targets for ActiveEffect changes to apply to.
    export type EffectApplyTo = 'actor' | 'targeted_actor' | 'test_all' | 'test_item' | 'modifier' | 'item';
}