
export const onCombatUpdate = async function(combat, changes) {
  if (game.user.isGM) {
    console.log(changes);
    if (changes.round && combat.round && changes.round > combat.round) {
      // subtact 10 from all initiative, we just went into the next initiative pass
      console.log(combat);
      let initPassEnd = true;
      const combatants = [];
      combat.combatants.forEach(c => {
        c.initiative = parseInt(c.initiative - 10);
        combatants.push(c);
        initPassEnd = initPassEnd && c.initiative <= 0;
      });
    }
  }
};
