// Import Modules
import { SR5ItemSheet } from "./module/item/sheet.js";
import { SR5ActorSheet } from "./module/actor/sheet.js";
import { SR5Actor } from './module/actor/entity.js';
import { SR5Item } from './module/item/entity.js';
import { SR5 } from './module/config.js';
import { preloadHandlebarsTemplates } from './module/templates.js';

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function() {
  console.log("hello world");
  console.log(`Initializing Simple Worldbuilding System`);

  CONFIG.SR5 = SR5;
  CONFIG.Actor.entityClass = SR5Actor;
  CONFIG.Item.entityClass = SR5Item;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.initiative.formula = "1d6";

  await preloadHandlebarsTemplates();

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("sR5", SR5ActorSheet, { types: ["character"], makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("sR5", SR5ItemSheet, { types: ["range_weapon"], makeDefault: true});
});

Handlebars.registerHelper("toHeaderCase", (str) => {
  let items = str.split("_");
  items = items.map((item) => {
    item = item.charAt(0).toUpperCase() + item.substring(1);
    return item;
  });
  return items.join(" ");
});

Handlebars.registerHelper("concat", (strs, c = ",") => {
  if (Array.isArray(strs)) {
    return strs.join(c);
  }
  return strs;
});

// if greater than
Handlebars.registerHelper("ifgt", (v1, v2, options) => {
 if (v1 > v2) return options.fn(this);
 else return options.inverse(this);
});
// if not equal
Handlebars.registerHelper("ifne", (v1, v2, options) => {
 if (v1 !== v2) return options.fn(this);
 else return options.inverse(this);
});

Handlebars.registerHelper("ifIncludes", (str, sub) => {
  return str.includes(sub);
});

Handlebars.registerHelper("ifNotEmpty", (arr) => {
  if (Array.isArray(arr)) {
    return arr.length > 0;
  }
  return false;
});
