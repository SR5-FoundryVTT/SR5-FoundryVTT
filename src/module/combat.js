var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const preCombatUpdate = function (combat, changes, options) {
    return __awaiter(this, void 0, void 0, function* () {
        // triggers when combat round changes
        if (changes.round && combat.round && changes.round > combat.round) {
            let initPassEnd = true;
            for (const c of combat.combatants) {
                let init = Number(c.initiative);
                init -= 10;
                if (init > 0)
                    initPassEnd = false;
            }
            if (!initPassEnd) {
                changes.round = combat.round;
            }
            // if we are gm, call function normally
            // if not gm, send a socket message for the gm to update the combatants
            // for new initative passes or reroll
            if (game.user.isGM) {
                yield shadowrunCombatUpdate(changes, options);
            }
            else {
                // @ts-ignore
                game.socket.emit('system.shadowrun5e', {
                    gmCombatUpdate: {
                        changes,
                        options,
                    },
                });
            }
        }
    });
};
export const shadowrunCombatUpdate = (changes, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { combat } = game;
    // subtact 10 from all initiative, we just went into the next initiative pass
    const removedCombatants = combat.getFlag('shadowrun5e', 'removedCombatants') || [];
    const combatants = [];
    for (const c of combat.combatants) {
        let init = Number(c.initiative);
        init -= 10;
        if (init <= 0)
            removedCombatants.push(Object.assign({}, c));
        else {
            // @ts-ignore
            combatants.push({ _id: c._id, initiative: init });
        }
    }
    yield combat.deleteEmbeddedEntity('Combatant', removedCombatants.map((c) => c._id), {});
    yield combat.updateEmbeddedEntity('Combatant', combatants, {});
    if (combatants.length === 0) {
        const messages = [];
        const messageOptions = options.messageOptions || {};
        let sound = true;
        for (const c of removedCombatants) {
            const actorData = c.actor ? c.actor.data : {};
            // @ts-ignore
            const formula = combat._getInitiativeFormula(c);
            const roll = new Roll(formula, actorData).roll();
            c.initiative = roll.total;
            const rollMode = messageOptions.rollMode || c.token.hidden || c.hidden ? 'gmroll' : 'roll';
            const messageData = mergeObject({
                speaker: {
                    scene: canvas.scene._id,
                    actor: c.actor ? c.actor._id : null,
                    token: c.token._id,
                    alias: c.token.name,
                },
                flavor: `${c.token.name} rolls for Initiative!`,
            }, messageOptions);
            roll.toMessage(messageData, {
                rollMode,
                create: false,
            }).then((chatData) => {
                // only make the sound once
                if (sound)
                    sound = false;
                else
                    chatData.sound = null;
                // @ts-ignore
                messages.push(chatData);
            });
        }
        yield combat.createEmbeddedEntity('Combatant', removedCombatants, {});
        yield ChatMessage.create(messages);
        yield combat.unsetFlag('shadowrun5e', 'removedCombatants');
        // @ts-ignore
        yield combat.resetAll();
        yield combat.rollAll();
        yield combat.update({ turn: 0 });
    }
    else if (removedCombatants.length) {
        yield combat.setFlag('shadowrun5e', 'removedCombatants', removedCombatants);
        yield combat.update({ turn: 0 });
    }
});
