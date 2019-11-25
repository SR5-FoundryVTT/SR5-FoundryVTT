export const preloadHandlebarsTemplates = async () => {

  const templatePaths = [
    "systems/shadowrun5e/templates/actor/parts/actor-equipment.html",
    "systems/shadowrun5e/templates/item/parts/item-description.html"
  ];

  return loadTemplates(templatePaths);
};
