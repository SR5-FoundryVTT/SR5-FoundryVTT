export const preloadHandlebarsTemplates = async () => {

  const templatePaths = [
    "systems/shadowrun5e/templates/actor/parts/actor-equipment.html",
    "systems/shadowrun5e/templates/actor/parts/actor-spellbook.html",
    "systems/shadowrun5e/templates/actor/parts/actor-skills.html",
    "systems/shadowrun5e/templates/actor/parts/actor-matrix.html",
    "systems/shadowrun5e/templates/actor/parts/actor-actions.html",
    "systems/shadowrun5e/templates/actor/parts/actor-info.html",
    "systems/shadowrun5e/templates/item/parts/item-description.html",
    "systems/shadowrun5e/templates/item/parts/item-left.html",
    "systems/shadowrun5e/templates/item/parts/spell-damage.html",
    "systems/shadowrun5e/templates/item/parts/spell-body.html",
    "systems/shadowrun5e/templates/item/parts/power-body.html",
    "systems/shadowrun5e/templates/item/parts/item-header.html",
    "systems/shadowrun5e/templates/item/parts/ammo.html"
  ];

  return loadTemplates(templatePaths);
};
