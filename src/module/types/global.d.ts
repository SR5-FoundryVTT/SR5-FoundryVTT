import ShadowrunItemData = Shadowrun.ShadowrunItemData;
import ShadowrunActorData = Shadowrun.ShadowrunActorData;
import {SR5Item} from "../item/SR5Item";
import {SR5Actor} from "../actor/SR5Actor";
import {SR5ActiveEffect} from "../effect/SR5ActiveEffect";

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
    }

    // Declaration Merging
    interface DocumentClassConfig {
        sheet: FormApplication;
    }

    type RecursivePartial<T> = { 
        [P in keyof T]?: RecursivePartial<T[P]>; 
    };
}
