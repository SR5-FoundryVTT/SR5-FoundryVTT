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

    getData(options) {
        // Get list of user character actors
        const actors = this._prepareCharacterActorsData();

        // get actors manually added to the tracker by GM
        OverwatchScoreTracker.addedActors.forEach(id => {
            const actor = game.actors.get(id)
            if (actor) {
                actors.push(actor.toObject());
            }
        });

        // Reference the currently displayed actors for better access.
        this.actors = actors;

        return {
            actors,
        };
    }

    _prepareCharacterActorsData() {
        return game.users.reduce((acc, user) => {
            if (!user.isGM && user.character) {
                acc.push(user.character.toObject());
            }
            return acc;
        }, []);
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
        const id = $(event.currentTarget).closest('.list-item').data('actorId');
        if (id) return game.actors.get(id);
    }

    _onAddActor(event) {
        event.preventDefault();

        const tokens = Helpers.getControlledTokens();
        if (tokens.length === 0) {
            return ui.notifications?.warn(game.i18n.localize('SR5.OverwatchScoreTracker.NotifyNoSelectedTokens'));
        }

        // Warn user about selected unlinked token actors.
        const unlinkedActor = tokens.find(token => !token.data.actorLink);
        if (unlinkedActor !== undefined) {
            ui.notifications.warn(game.i18n.localize('SR5.OverwatchScoreTracker.OnlyLinkedActorsSupported'));
        }

        // Add linked token actors.
        tokens.filter(token => token.data.actorLink).forEach(token => {
            // Double check that the actor actually lives in the actors collection.
            const actor = game.actors.get(token.data.actorId);
            if (!actor) return;
            if (this._isActorOnTracker(actor)) return;

            OverwatchScoreTracker.addedActors.push(actor.id);
        });

        this.render();
    }

    /**
     * Check if the given actor is already added and displayed on the current tracker.
     *
     * @param actor A actors collection actor.
     * @returns {boolean} Will return true when the given actor already exists.
     */
    _isActorOnTracker(actor) {
        return this.actors.find(actorData => actorData._id === actor.id) !== undefined;
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
            roll.evaluate({async: false});

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
