// Import Modules
import { SR5ItemSheet } from "./module/item/sheet.js";
import { SR5ActorSheet } from "./module/actor/sheet.js";
import { SR5Actor } from './module/actor/entity.js';
import { SR5Item } from './module/item/entity.js';
import { SR5 } from './module/config.js';
import { Helpers } from './module/helpers.js';
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
  CONFIG.initiative.formula = "@initiative.current.base.value + @initiative.current.dice.text";

  await preloadHandlebarsTemplates();

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("SR5", SR5ActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("SR5", SR5ItemSheet, { makeDefault: true});
});

['renderSR5ActorSheet', 'renderSR5ItemSheet', 'renderDialog'].forEach(s => {
  Hooks.on(s, (app, html, data) => html.find('input[type="checkbox"]').click(event => app._onSubmit(event)));
  Hooks.on(s, (app, html, data) => html.find('input[type="text"]').change(event => app._onSubmit(event)));

});

Hooks.on('renderChatMessage', (app, html, data) => SR5Item.chatListeners(html));

Hooks.on('updateCombat', (args) => {
  console.log('previous' + JSON.stringify(args.previous));
  console.log('current' + JSON.stringify(args.current));
  if (args.previous.round && args.previous.round < args.current.round) {
    console.log('hello');
    // subtact 10 from all initiative, we just went into the next initiative pass
    const combatants = args.data.combatants;
    combatants.forEach(c => c.initiative -= 10);
    args.data.combatants = combatants.filter(c => c.initiative > 0);
    args.turns = combatants;
  }
});

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
