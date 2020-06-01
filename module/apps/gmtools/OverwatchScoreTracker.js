/**
 * A GM-Tool to keep track of all players overwatch scores
 */
export class OverwatchScoreTracker extends Application {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'overwatch-score-tracker';
        options.classes = ['sr5'];
        options.title = game.i18n.localize('SR5.OverwatchScoreTrackerTitle');
        options.template = 'systems/shadowrun5e/templates/apps/gmtools/overwatch-score-tracker.html';
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
        }, [])

        console.log(actors);

        return {
            actors,
        }
    }

    activateListeners(html) {
        console.log(html);

        html.find('.overwatch-score-reset').on('click', this._resetOverwatchScore.bind(this));
    }

    _getActorFromEvent(event) {
        const id = event.currentTarget.closest('.item').dataset.actorId;
        if (id) return game.actors.find(a => a._id === id);
    }

    _resetOverwatchScore(event) {
        event.preventDefault();
        const actor = this._getActorFromEvent(event);
        console.log(actor);
        console.log('reset ');
    }
}
