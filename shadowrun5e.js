// Import Modules
import { Sr5ItemSheet } from "./module/item-sheet.js";
import { Sr5CharacterActorSheet } from "./module/actor-sheet.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function() {
  console.log("hello world");
  console.log(`Initializing Simple Worldbuilding System`);

	/**
	 * Set an initiative formula for the system
	 * @type {String}
	 */
	CONFIG.initiative.formula = "1d6";

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("sr5", Sr5CharacterActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("sr5", Sr5ItemSheet, {makeDefault: true});
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
