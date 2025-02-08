/**
 * A GM-Tool to keep track of all players overwatch scores
 */
import { SR5Actor } from "../../actor/SR5Actor";
import {Helpers} from "../../helpers";
import { OverwatchStorage } from "../../storage/OverwatchStorage";

export class OverwatchScoreTracker extends Application {
    static MatrixOverwatchDiceCount = '2d6';
    static override get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'overwatch-score-tracker';
        options.classes = ['sr5'];
        options.title = game.i18n.localize('SR5.OverwatchScoreTrackerTitle');
        options.template = 'systems/shadowrun5e/dist/templates/apps/gmtools/overwatch-score-tracker.html';
        options.width = 550;
        options.height = 'auto';
        options.resizable = true;
        return options;
    }

    // List of raw user character data
    actors: any[] = [];

    override async getData(options) {
        // Get list of user character actors
        await this._addMissingUserCharactersToStorage();
        this.actors = OverwatchStorage.trackedActors();

        return {
            scores: this.actors.map(actor => ({score: actor.getOverwatchScore(), actor})),
        };
    }

    async _addMissingUserCharactersToStorage() {
        if (!game.users) return;

        for (const user of game.users) {
            if (user.isGM || !user.character) continue;

            const actor = user.character;
            if (OverwatchStorage.isTrackedActor(actor)) continue;
            await OverwatchStorage.trackActor(actor);
        }
    }

    override activateListeners(html) {
        html.find('.overwatch-score-reset').on('click', this._resetOverwatchScore.bind(this));
        html.find('.overwatch-score-add').on('click', this._addOverwatchScore.bind(this));
        html.find('.overwatch-score-input').on('change', this._setOverwatchScore.bind(this));
        html.find('.overwatch-score-roll-15-minutes').on('click', this._rollFor15Minutes.bind(this));
        html.find('.overwatch-score-add-actor').on('click', this._onAddActor.bind(this));
        html.find('.overwatch-score-delete').on('click', this._onDeleteActor.bind(this));
    }

    // returns the actor that this event is acting on
    _getActorFromEvent(event) {
        const uuid = $(event.currentTarget).closest('.list-item').data('uuid');
        return fromUuidSync(uuid) as SR5Actor;
    }

    _onAddActor(event) {
        event.preventDefault();

        const tokens = Helpers.getControlledTokens();
        if (tokens.length === 0) {
            return ui.notifications?.warn(game.i18n.localize('SR5.OverwatchScoreTracker.NotifyNoSelectedTokens'));
        }

        // Warn user about selected unlinked token actors.
        // @ts-expect-error TODO: foundry-vtt-types v10
        const unlinkedActor = tokens.find(token => !token.document.actorLink);
        if (unlinkedActor !== undefined) {
            ui.notifications.warn(game.i18n.localize('SR5.OverwatchScoreTracker.OnlyLinkedActorsSupported'));
        }

        // Add linked token actors.
        // @ts-expect-error TODO: foundry-vtt-types v10
        tokens.filter(token => token.document.actorLink).forEach(token => {
            // Double check that the actor actually lives in the actors collection.
            // @ts-expect-error TODO: foundry-vtt-types v10
            const actor = game.actors?.get(token.document.actorId);
            if (!actor) return;
            if (OverwatchStorage.isTrackedActor(actor)) return;
            OverwatchStorage.trackActor(actor);
        });

        this.render();
    }

    _setOverwatchScore(event: Event) {
        const actor = this._getActorFromEvent(event);
        const amount = parseInt((event.currentTarget as HTMLInputElement).value);
        if (amount && actor) {
            actor.setOverwatchScore(amount).then(() => this.render());
        }
    }

    _addOverwatchScore(event: Event) {
        const actor = this._getActorFromEvent(event);
        const amount = parseInt((event.currentTarget as HTMLElement).dataset.amount ?? '0');
        if (!actor) return

        const os = actor.getOverwatchScore();
        actor.setOverwatchScore(os + amount).then(() => this.render());
    }

    _resetOverwatchScore(event: Event) {
        event.preventDefault();
        const actor = this._getActorFromEvent(event);
        if (!actor) return;

        actor.setOverwatchScore(0).then(() => this.render());
    }

    /**
     * Remove the connected actor from the tracker.
     */
    _onDeleteActor(event: Event) {
        event.preventDefault();
        const actor = this._getActorFromEvent(event);
        if (!actor) return;

        OverwatchStorage.untrackActor(actor).then(() => this.render());
    }

    async _rollFor15Minutes(event: Event) {
        event.preventDefault();
        const actor = this._getActorFromEvent(event);
        if (actor) {
            //  use static value so it can be modified in modules
            const roll = new Roll(OverwatchScoreTracker.MatrixOverwatchDiceCount);
            await roll.evaluate();
            if (!roll.total) return;

            const os = actor.getOverwatchScore();
            actor.setOverwatchScore(os + roll.total).then(() => this.render());
        }
    }
}
