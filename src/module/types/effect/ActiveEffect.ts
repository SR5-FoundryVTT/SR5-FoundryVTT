/// <reference path="../Shadowrun.ts" />

/**
 * Typings around the 'AdvancedEffects' implementation of system on top of Foundry core ActiveEffects
 */

declare namespace Shadowrun {
    // Applicable targets for ActiveEffect changes to apply to.
    export type EffectApplyTo = 'actor' | 'targeted_actor' | 'test_all' | 'test_item' | 'modifier' | 'item';

    export interface EffectChangeData {
        key: string;
        value: string | number;
        mode: number;
        priority: number;
    }

    export interface EffectDurationData {
        duration?: EffectDurationData;
        startTime?: number;
        seconds?: number;
        rounds?: number;
        turns?: number;
        startRound?: number;
        startTurn?: number;
        type?: string;
    }

    export interface EffectTagsData {
        applyTo: EffectApplyTo;
        onlyForWireless?: boolean;
        onlyForEquipped?: boolean;
        onlyForItemTest?: boolean;

        // JSON.stringify bellow
        // example: "[{\"value\":\"Animal Handling\",\"id\":\"animal_handling\"}]"
        selection_tests?: string;
        selection_categories?: string;
        selection_skills?: string;
        selection_attributes?: string;
        selection_limits?: string;
    }

    export interface EffectOptionsData {
        name: string;
        img?: string;
        type?: string;
        system?: string;
        changes?: EffectChangeData[];
        disabled?: boolean;
        description?: string;
        origin?: string;
        tint?: string;
        transfer?: boolean;
        statuses?: Record<string, any>;
        sort?: number;
        flags?: { shadowrun5e: EffectTagsData; [key: string]: object; };
    }
}