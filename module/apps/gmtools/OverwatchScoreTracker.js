/**
 * A GM-Tool to keep track of all players overwatch scores
 */
export class OverwatchScoreTracker extends Application {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'overwatch-score-tracker';
        options.classes = ['sr5'];
        options.title = game.i18n.localize('SR5.OverwatchScoreTrackerTitle');
        options.template =
            'systems/shadowrun5e/templates/apps/gmtools/overwatch-score-tracker.html';
        options.width = 600;
        options.height = 'auto';
        return options;
    }

    getData() {
        const actors = game.users.reduce((acc, user) => {
            if (!user.isGM && user.character) {
                acc.push(user.character.data);
            }
            return acc;
        }, []);

        return {
            actors,
        };
    }

    activateListeners(html) {
        html.find('.overwatch-score-reset').on('click', this._resetOverwatchScore.bind(this));
        html.find('.overwatch-score-add').on('click', this._addOverwatchScore.bind(this));
        html.find('.overwatch-score-input').on('change', this._setOverwatchScore.bind(this));
        html.find('.overwatch-score-roll-15-minutes').on(
            'click',
            this._rollFor15Minutes.bind(this)
        );
    }

    _getActorFromEvent(event) {
        const id = event.currentTarget.closest('.item').dataset.actorId;
        if (id) return game.actors.find((a) => a._id === id);
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
            const roll = new Roll('2d6');
            roll.toMessage({
                rollMode: 'gmroll',
            });
            if (roll.total) {
                const os = actor.getOverwatchScore();
                actor.setOverwatchScore(os + roll.total).then(() => this.render());
            }
        }
    }
}
