import { DocumentSituationModifiers } from './../rules/DocumentSituationModifiers';
import { TestCreator } from './../tests/TestCreator';
import ShadowrunItemData = Shadowrun.ShadowrunItemData;
import ShadowrunActorData = Shadowrun.ShadowrunActorData;
import { SR5Item } from "../item/SR5Item";
import { SR5Actor } from "../actor/SR5Actor";
import { SR5Combat } from "../combat/SR5Combat";
import { SR5ActiveEffect } from "../effect/SR5ActiveEffect";
import { SR5Roll } from "../rolls/SR5Roll";
import { Translation } from '../utils/strings';
import { DataDefaults } from '../data/DataDefaults';
import { DataStorage } from '../data/DataStorage';

declare global {
    // Configuration of foundry-vtt-types
    interface LenientGlobalVariableTypes {
        game: never; // disable game ready checks
        canvas: never; // disable canvas ready checks
        socket: never; // disable socket ready checks
        ui: never; // disable ui ready checks
    }

    // Configuration of shadowrun5e system
    interface SourceConfig {
        Item: ShadowrunItemData;
        Actor: ShadowrunActorData;
    }

    interface DataConfig {
        Item: ShadowrunItemData;
        Actor: ShadowrunActorData;
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

    /**
     * Inject v11 types into 
     */
    interface Item {
        updateSource: (data: any, options?) => Promise<this>;
    }
    interface Actor {
        updateSource: (data: any, options?) => Promise<this>;
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

        shadowrun5e: {
            tests: Record<string, any>,
            activeTests: Record<string, any>
            opposedTests: Record<string, any>,
            resistTests: Record<string, any>,
            followedTests: Record<string, any>,
            SR5Actor: typeof SR5Actor,
            SR5Item: typeof SR5Item,
            SR5ActiveEffect: typeof SR5ActiveEffect,
            rollItemMacro: any,
            rollSkillMacro: any,
            SR5Roll: typeof SR5Roll,
            test: typeof TestCreator,
            data: typeof DataDefaults,
            modifiers: typeof DocumentSituationModifiers,
            inputDelay: number,
            storage: typeof DataStorage
        }

        // Optional type for Dice so Nice module API
        dice3d?: any
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
}
