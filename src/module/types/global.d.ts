import ShadowrunItemData = Shadowrun.ShadowrunItemData;
import ShadowrunActorData = Shadowrun.ShadowrunActorData;
import { SR5Item } from "../item/SR5Item";
import { SR5Actor } from "../actor/SR5Actor";
import { SR5Combat } from "../combat/SR5Combat";
import { SR5ActiveEffect } from "../effect/SR5ActiveEffect";
import { SR5Roll } from "../rolls/SR5Roll";

declare global {
    // Configuration of foundry-vtt-types
    interface LenientGlobalVariableTypes {
        game: never; // disable game ready checks
        canvas: never; // disable canvas ready checks
        socket: never; // disable socket ready checks
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

}
