export const preCombatUpdate = async function(combat, changes) {
  console.log(combat);
  if (game.user.isGM) {
    const nextCombatant = changes.turn !== undefined ? combat.combatants[changes.turn] : null;
    // triggers when combat round changes
    if (changes.round && combat.round && changes.round > combat.round) {
      if (nextCombatant && Number(nextCombatant.initiative) <= 0) {
        // we entered the next combat turn and need to roll initiative
        await combat.resetAll();
        await combat.rollAll();
      } else {
        // subtact 10 from all initiative, we just went into the next initiative pass
        let initPassEnd = true;
        const combatants = [];
        combat.combatants.forEach(async c => {
          let init = Number(c.initiative);
          init -= 10;
          if (init > 0) initPassEnd = false;
          combatants.push({
            _id: c._id,
            initiative: init
          });
        });
        if (!initPassEnd) {
          changes.round = combat.round;
        }
        combatants.forEach(async c => await combat.updateCombatant(c, {}));
      }
    }
  }
};

export const combatUpdate = async function(combat, options) {
  if (game.user.isGM) {
    if (Number(combat.combatant.initiative) <= 0) {
      combat.nextTurn();
    }
  }
};
