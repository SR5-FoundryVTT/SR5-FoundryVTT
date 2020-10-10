/**
 * A GM-Tool to keep track of all players overwatch scores
 */
import {Helpers} from "../../helpers";

export class OverwatchScoreTracker extends Application {
    static MatrixOverwatchDiceCount = '2d6';
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'overwatch-score-tracker';
        options.classes = ['sr5'];
        options.title = game.i18n.localize('SR5.OverwatchScoreTrackerTitle');
        options.template = 'systems/shadowrun5e/dist/templates/apps/gmtools/overwatch-score-tracker.html';
        options.width = 450;
        options.height = 'auto';
        options.resizable = true;
        return options;
    }

    static addedActors = [];

    getData() {
        // get list of actors that belong to users
        const actors = game.users.reduce((acc, user) => {
            if (!user.isGM && user.character) {
                acc.push(user.character.data);
            }
            return acc;
        }, []);

        OverwatchScoreTracker.addedActors.forEach((id) => {
            const actor = game.actors.find((a) => a._id === id);
            if (actor) {
                actors.push(actor.data);
            }
        });

        return {
            actors,
        };
    }

    activateListeners(html) {
        html.find('.overwatch-score-reset').on('click', this._resetOverwatchScore.bind(this));
        html.find('.overwatch-score-add').on('click', this._addOverwatchScore.bind(this));
        html.find('.overwatch-score-input').on('change', this._setOverwatchScore.bind(this));
        html.find('.overwatch-score-roll-15-minutes').on('click', this._rollFor15Minutes.bind(this));
        html.find('.overwatch-score-add-actor').on('click', this._onAddActor.bind(this));
    }

    // returns the actor that this event is acting on
    _getActorFromEvent(event) {
        const id = event.currentTarget.closest('.list-item').dataset.actorId;
        if (id) return game.actors.find((a) => a._id === id);
    }

    _onAddActor(event) {
        event.preventDefault();
        const tokens = Helpers.getControlledTokens();
        if (tokens.length === 0) {
            ui.notifications.warn(game.i18n.localize('SR5.OverwatchScoreTracker.NotifyNoSelectedTokens'));
            return;
        }
        tokens.forEach((token) => {
            const actorId = token.data.actorId;
            OverwatchScoreTracker.addedActors.push(actorId);
            this.render();
        });
    }

    _setOverwatchScore(event) {
        const actor = this._getActorFromEvent(event);
        const amount = event.currentTarget.value;
        if (amount && actor) {
            actor.setOverwatchScore(amount).then(() => this.render());
        }
    }

    _addOverwatchScore(event) {
        const actor = this._getActorFromEvent(event);
        const amount = parseInt(event.currentTarget.dataset.amount);
        if (amount && actor) {
            const os = actor.getOverwatchScore();
            actor.setOverwatchScore(os + amount).then(() => this.render());
        }
    }

    _resetOverwatchScore(event) {
        event.preventDefault();
        const actor = this._getActorFromEvent(event);
        if (actor) {
            actor.setOverwatchScore(0).then(() => this.render());
        }
    }

    _rollFor15Minutes(event) {
        event.preventDefault();
        const actor = this._getActorFromEvent(event);
        if (actor) {
            //  use static value so it can be modified in modules
            const roll = new Roll(OverwatchScoreTracker.MatrixOverwatchDiceCount);
            roll.roll();

            // use GM Roll Mode so players don't see
            // const rollMode = CONFIG.Dice.rollModes.gmroll;
            // roll.toMessage({ rollMode });

            if (roll.total) {
                const os = actor.getOverwatchScore();
                actor.setOverwatchScore(os + roll.total).then(() => this.render());
            }
        }
    }
}
