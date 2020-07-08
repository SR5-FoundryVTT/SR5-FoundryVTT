export const preCombatUpdate = async function (combat, changes, options) {
    // triggers when combat round changes
    if (changes.round && combat.round && changes.round > combat.round) {
        let initPassEnd = true;
        for (const c of combat.combatants) {
            let init = Number(c.initiative);
            init -= 10;
            if (init > 0) initPassEnd = false;
        }
        if (!initPassEnd) {
            changes.round = combat.round;
        }
        // if we are gm, call function normally
        // if not gm, send a socket message for the gm to update the combatants
        // for new initative passes or reroll
        if (game.user.isGM) {
            await shadowrunCombatUpdate(changes, options);
        } else {
            // @ts-ignore
            game.socket.emit('system.shadowrun5e', {
                gmCombatUpdate: {
                    changes,
                    options,
                },
            });
        }
    }
};

export const shadowrunCombatUpdate = async (changes, options) => {
    const { combat } = game;
    // subtact 10 from all initiative, we just went into the next initiative pass
    const removedCombatants = combat.getFlag('shadowrun5e', 'removedCombatants') || [];
    const combatants = [];
    for (const c of combat.combatants) {
        let init = Number(c.initiative);
        init -= 10;
        if (init <= 0) removedCombatants.push({ ...c });
        else {
            // @ts-ignore
            combatants.push({ _id: c._id, initiative: init });
        }
    }
    await combat.deleteEmbeddedEntity(
        'Combatant',
        removedCombatants.map((c) => c._id),
        {}
    );
    await combat.updateEmbeddedEntity('Combatant', combatants, {});
    if (combatants.length === 0) {
        const messages = [];
        const messageOptions = options.messageOptions || {};

        for (const c of removedCombatants) {
            const actorData = c.actor ? c.actor.data : {};
            // @ts-ignore
            const formula = combat._getInitiativeFormula(c);

            const roll: Roll = new Roll(formula, actorData).roll();
            c.initiative = roll.total;

            const rollMode = messageOptions.rollMode || c.token.hidden || c.hidden ? 'gmroll' : 'roll';
            const messageData = mergeObject(
                {
                    speaker: {
                        scene: canvas.scene._id,
                        actor: c.actor ? c.actor._id : null,
                        token: c.token._id,
                        alias: c.token.name,
                    },
                    flavor: `${c.token.name} rolls for Initiative!`,
                },
                messageOptions
            );
            await roll.toMessage(messageData, {
                rollMode,
            });
        }
        await combat.createEmbeddedEntity('Combatant', removedCombatants, {});
        await ChatMessage.create(messages);
        await combat.unsetFlag('shadowrun5e', 'removedCombatants');
        // @ts-ignore
        await combat.resetAll();
        await combat.rollAll();
        await combat.update({ turn: 0 });
    } else if (removedCombatants.length) {
        await combat.setFlag('shadowrun5e', 'removedCombatants', removedCombatants);
        await combat.update({ turn: 0 });
    }
};
