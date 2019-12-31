// Import Modules
import { SR5ItemSheet } from "./module/item/sheet.js";
import { SR5ActorSheet } from "./module/actor/sheet.js";
import { SR5Actor } from './module/actor/entity.js';
import { SR5Item } from './module/item/entity.js';
import { SR5 } from './module/config.js';
import { Helpers } from './module/helpers.js';
import { preloadHandlebarsTemplates } from './module/templates.js';
import { onCombatUpdate } from './module/combat.js';

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function() {
  console.log("hello world");

  CONFIG.SR5 = SR5;
  CONFIG.Actor.entityClass = SR5Actor;
  CONFIG.Item.entityClass = SR5Item;

  await preloadHandlebarsTemplates();

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("SR5", SR5ActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("SR5", SR5ItemSheet, { makeDefault: true});
});

Hooks.on('ready', () => {
  game.socket.on("system.shadowrun5e", data => console.log(data));
  game.socket.emit("system.shadowrun5e", {foo: 'bar'});
});

Hooks.on('updateCombat', args => onCombatUpdate(args));
Hooks.on('renderChatMessage', (app, html, data) => SR5Item.chatListeners(html));


Handlebars.registerHelper("toHeaderCase", function(str) {
  if (str) return Helpers.label(str);
  return "";
});

Handlebars.registerHelper("concat", function(strs, c = ",") {
  if (Array.isArray(strs)) {
    return strs.join(c);
  }
  return strs;
});
Handlebars.registerHelper("ifin", function(val, arr, options) {
  if (arr.includes(val)) return options.fn(this);
  else return options.inverse(this);
});
// if greater than
Handlebars.registerHelper("ifgt", function(v1, v2, options) {
 if (v1 > v2) return options.fn(this);
 else return options.inverse(this);
});
// if not equal
Handlebars.registerHelper("ifne", function(v1, v2, options) {
 if (v1 !== v2) return options.fn(this);
 else return options.inverse(this);
});
// if equal
Handlebars.registerHelper("ife", function(v1, v2, options) {
 if (v1 === v2) return options.fn(this);
 else return options.inverse(this);
});
Handlebars.registerHelper("sum", function(v1, v2) {
  return v1 + v2;
});
