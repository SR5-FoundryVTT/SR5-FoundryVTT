export class SR5Combat extends Combat {
    get initiativePass(): number {
        return this.data?.initiativePass || 0;
    }

    data: BaseEntityData & {
        initiativePass?: number;
    };

    protected _onUpdate(data: object, options: object, userId: string, context: object) {
        console.log(data);
        super._onUpdate(data, options, userId, context);
    }

    async adjustInitiative(combatantId: string, adjustment: number): Promise<void> {
        console.log('adjustInit');
    }

    // remove the turn of anyone that is below 0 initiative
    setupTurns(): any[] {
        const turns = super.setupTurns().filter((turn) => {
            const init = Number(turn.initiative);
            if (isNaN(init)) return true;
            return init > 0;
        });
        // @ts-ignore
        this.turns = turns;
        return turns;
    }

    async nextTurn(): Promise<void> {
        let turn = this.turn;
        let skip = this.settings.skipDefeated;
        // Determine the next turn number
        let next: number | null = null;
        if (skip) {
            for (let [i, t] of this.turns.entries()) {
                if (i <= turn) continue;
                // @ts-ignore
                if (!t.defeated) {
                    next = i;
                    break;
                }
            }
        } else next = turn + 1;

        // Maybe advance to the next round/init pass
        let round = this.round;
        let initPass = this.initiativePass;

        // if both are 0, we just started so set both to 1
        if (round === 0 && initPass === 0) {
            initPass = initPass + 1;
            round = round + 1;
            next = 0;
        } else if (next === null || next >= this.turns.length) {
            const combatants: any[] = [];

            // check for initpass
            const over10Init = this.combatants.reduce((accumulator, running) => {
                return accumulator || Number(running.initiative) > 10;
            }, false);

            // do an initiative pass
            if (over10Init) {
                next = 0;
                initPass = initPass + 1;
                // adjust combatants
                for (const c of this.combatants) {
                    let init = Number(c.initiative);
                    init -= 10;
                    // @ts-ignore
                    combatants.push({ _id: c._id, initiative: init });
                }
            } else {
                next = 0;
                round = round + 1;
                initPass = 0;
                for (const c of this.combatants) {
                    const actorData = c.actor ? c.actor.data.data : {};
                    // @ts-ignore
                    const formula = this._getInitiativeFormula(c);
                    const roll: Roll = new Roll(formula, actorData).roll();
                    const init = roll.total;
                    // @ts-ignore
                    combatants.push({ _id: c._id, initiative: init });
                }
            }

            if (combatants.length > 0) {
                // @ts-ignore
                await this.updateCombatant(combatants);
            }

            if (skip) {
                // @ts-ignore
                next = this.turns.findIndex((t) => !t.defeated);
                if (next === -1) {
                    // @ts-ignore
                    ui.notifications.warn(game.i18n.localize('COMBAT.NoneRemaining'));
                    next = 0;
                }
            }
        }

        // Update the encounter
        await this.update({ round: round, turn: next, initiativePass: initPass });
    }
}
