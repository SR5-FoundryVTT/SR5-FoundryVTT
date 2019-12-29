
export const _getInitiativeFormula = function(combatant) {
  const actor = combatant.actor;
}

export const onCombatUpdate = function(args) {
  if (game.user.isGM) {
    if (args.previous.round && args.previous.round < args.current.round) {
      // subtact 10 from all initiative, we just went into the next initiative pass
      console.log(game.combat);
      const combatants = game.combat.data.combatants;
      let reroll = true;
      combatants.forEach(c => {
        c.initiative -= 10;
        reroll = (reroll && (!c.initiative || c.initiative <= 0));
        if (c.initiative < 0) {
          c.initiative = null;
          c.hasRolled = false;
        }
      });
      if (reroll) {
        game.combat.rollAll(combatants);
      } else {
        combatants.forEach(c => {
          game.combat.updateCombatant({
            id: c.id,
            initiative: c.initiative,
            hasRolled: c.hasRolled
          });
        });
      }
    }
  }
};
