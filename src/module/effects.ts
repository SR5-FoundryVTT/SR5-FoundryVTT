//@ts-nocheck // This is JavaScript code.
/**
 * All functions have been taken from : https://gitlab.com/foundrynet/dnd5e/-/blob/master/module/effects.js
 *
 * There have been some alterations made to fit the Shadowrun5e system.
  */

/**
 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
 * @param {MouseEvent} event      The left-click event on the effect control
 * @param {Actor|Item} owner      The owning entity which manages this effect
 */
export function onManageActiveEffect(event, owner) {
  event.preventDefault();
  // These element grabs rely heavily on HTML structure within the templates.
  const icon = event.currentTarget;
  const item = event.currentTarget.closest('.list-item');
  const effect = item.dataset.itemId ? owner.effects.get(item.dataset.itemId) : null;
  // The HTML dataset must be defined
  switch ( icon.dataset.action ) {
    case "create":
      return ActiveEffect.create({
        label: game.i18n.localize("SR5.ActiveEffect.New"),
        icon: "icons/svg/aura.svg",
        origin: owner.uuid,
        "duration.rounds": item.dataset.effectType === "temporary" ? 1 : undefined,
        disabled: item.dataset.effectType === "inactive"
      }, owner).create();
    case "edit":
      return effect.sheet.render(true);
    case "delete":
      return effect.delete();
    case "toggle":
      return effect.update({disabled: !effect.data.disabled});
    default:
        console.error(`An active effect with the id '${effect}' couldn't be managed as no action has been defined within the template.`);
      return;
  }
}

/**
 * Prepare the data structure for Active Effects which are currently applied to an Actor or Item.
 * @param {ActiveEffect[]} effects    The array of Active Effect instances to prepare sheet data for
 * @return {object}                   Data for rendering
 */
export function prepareActiveEffectCategories(effects) {

    // Define effect header categories
    const categories = {
      temporary: {
        type: "temporary",
        label: game.i18n.localize("SR5.ActiveEffect.Types.Temporary"),
        effects: []
      },
      passive: {
        type: "passive",
        label: game.i18n.localize("SR5.ActiveEffect.Types.Passive"),
        effects: []
      },
      inactive: {
        type: "inactive",
        label: game.i18n.localize("SR5.ActiveEffect.Types.Inactive"),
        effects: []
      }
    };

    // Iterate over active effects, classifying them into categories
    for ( let effect of effects ) {
      effect._getSourceName(); // Trigger a lookup for the source name
      if ( effect.data.disabled ) categories.inactive.effects.push(effect);
      else if ( effect.isTemporary ) categories.temporary.effects.push(effect);
      else categories.passive.effects.push(effect);
    }
    return categories;
}