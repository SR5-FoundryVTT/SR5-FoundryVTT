import ShadowrunItemData = Shadowrun.ShadowrunItemData;
import ShadowrunActorData = Shadowrun.ShadowrunActorData;
import { SR5Item } from "../item/SR5Item";
import { SR5Actor } from "../actor/SR5Actor";
import { SR5Combat } from "../combat/SR5Combat";
import { SR5ActiveEffect } from "../effect/SR5ActiveEffect";
import { SR5Roll } from "../rolls/SR5Roll";
import { Translation } from '../utils/strings';

declare global {
    // Configuration of foundry-vtt-types
    interface LenientGlobalVariableTypes {
        game: never; // disable game ready checks
        canvas: never; // disable canvas ready checks
        socket: never; // disable socket ready checks
    }

    interface AssumeHookRan {
        i18nReady: never;
        ready: never;
        init: never;
        setup: never;
    }

    interface System {
        id: "shadowrun5e";
    }

    interface ReadyGame {
        shadowrun5e: Record<string, unknown>;
        action_manager?: any;
    }

    interface CONFIG {}

    // Configuration of shadowrun5e system
    interface SourceConfig {
        Item: ShadowrunItemData;
        Actor: ShadowrunActorData;
    }

    interface DataConfig {
        Item: ShadowrunItemData;
        Actor: ShadowrunActorData;
    }

    interface FlagConfig {
        ChatMessage: {
            shadowrun5e: {
                [key: string]: unknown;
            }
        }
    }

    interface DocumentClassConfig {
        Item: typeof SR5Item;
        Actor: typeof SR5Actor;
        ActiveEffect: typeof SR5ActiveEffect;
        Combat: typeof SR5Combat;
        Roll: typeof SR5Roll;
    }

    // Declaration Merging
    interface DocumentClassConfig {
        sheet: FormApplication;
    }

    // Inject model basic structure into foundry-vtt-types
    interface Game {
        model: {
            Item: any;
            Actor: any;
            Card: any;
            Cards: any;
            JournalEntryPage: any;
        };
    }

    type RecursivePartial<T> = {
        [P in keyof T]?: RecursivePartial<T[P]>;
    };


    /**
     * Retrieve an Entity or Embedded Entity by its Universally Unique Identifier (uuid).
     * @param uuid - The uuid of the Entity or Embedded Entity to retrieve
     */
    declare function fromUuidSync(uuid: string): foundry.abstract.Document<any, any> | null;

    // Use declaration merging to add strong typing to Foundry's game.i18n localize and format functions,
    // sourcing valid translation strings from this system's english translations file
    declare class Localization {
        localize(stringId: Translation): string;

        format(stringId: Translation, data?: Record<string, unknown>): string;
    }

    interface SettingConfig {
        "shadowrun5e.applyLimits": boolean;
        "shadowrun5e.diagonalMovement": string;
        "shadowrun5e.GlobalDataStorage": Record<string, unknown>;
        "shadowrun5e.showGlitchAnimation": boolean;
        "shadowrun5e.systemMigrationVersion": string;
        "shadowrun5e.showTokenNameInsteadOfActor": boolean;
        "shadowrun5e.onlyAllowRollOnDefaultableSkills": boolean;
        "shadowrun5e.showSkillsWithDetails": boolean;
        "shadowrun5e.onlyAutoRollNPCInCombat": boolean;
        "shadowrun5e.tokenHealthBars": boolean;
        "shadowrun5e.HideGMOnlyChatContent": boolean;
        "shadowrun5e.MustConsumeRessourcesOnTest": boolean;
        "shadowrun5e.UseDamageCondition": boolean;
        "shadowrun5e.AutomateMultiDefenseModifier": boolean;
        "shadowrun5e.AutomateProgressiveRecoil": boolean;
        "shadowrun5e.ManualRollOnSuccessTest": boolean;
        "shadowrun5e.DefaultOpposedTestActorSelection": boolean;
        "shadowrun5e.MarkImports": string;
        "shadowrun5e.ImportIconFolder": string;
        "shadowrun5e.UseImportIconOverrides": boolean;
    }
}
