import { SR5Actor } from "./module/actor/SR5Actor";
import { SR5Item } from "./module/item/SR5Item";

Hooks.once("init", () => {
    console.log("Initializing Shadowrun 5e System");

    game.shadowrun5e = {
        canvas: {},
    };

    CONFIG.Actor.documentClass = SR5Actor;
    CONFIG.Item.documentClass = SR5Item;
});

Hooks.once("setup", () => {});

Hooks.once("ready", () => {
    console.log("Shadowrun 5e System is ready");
});
