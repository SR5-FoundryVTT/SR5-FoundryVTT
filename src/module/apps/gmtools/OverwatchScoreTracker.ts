/**
 * A GM-Tool to keep track of all players overwatch scores
 */
import { Helpers } from "../../helpers";
import { DeepPartial } from "fvtt-types/utils";
import { SR5Actor } from "@/module/actor/SR5Actor";
import { SR5_APPV2_CSS_CLASS } from '@/module/constants';
import { OverwatchStorage } from "../../storage/OverwatchStorage";

import ApplicationV2 = foundry.applications.api.ApplicationV2;
import HandlebarsApplicationMixin = foundry.applications.api.HandlebarsApplicationMixin;

interface OverwatchScoreTrackerContext extends HandlebarsApplicationMixin.RenderContext {
    scores: {
        score: number;
        actor: SR5Actor;
    }[];
    isGM: boolean;
}

export class OverwatchScoreTracker extends HandlebarsApplicationMixin(ApplicationV2)<OverwatchScoreTrackerContext> {
    static MatrixOverwatchDiceCount = '2d6';

    static override PARTS = {
        main: {
            template: 'systems/shadowrun5e/dist/templates/apps/gmtools/overwatch-score-tracker.hbs'
        }
    }

    static override DEFAULT_OPTIONS = {
        id: 'overwatch-score-tracker',
        classes: [SR5_APPV2_CSS_CLASS, 'sr5', 'overwatch-score-tracker'],
        form: {
            submitOnChange: false,
            closeOnSubmit: false,
        },
        position: {
            width: 550,
            height: 'auto' as const,
        },
        window: {
            resizable: true,
        },
        actions: {
            addActor: OverwatchScoreTracker.#onAddActor,
            addOverwatchScore: OverwatchScoreTracker.#addOverwatchScore,
            rollFor15Minutes: OverwatchScoreTracker.#rollFor15Minutes,
            resetOverwatchScore: OverwatchScoreTracker.#resetOverwatchScore,
            deleteTrackedActor: OverwatchScoreTracker.#onDeleteActor,
        }
    }

    // Contains only non-user actors added manually by the GM.
    static addedActors: string[] = [];
    actors: SR5Actor[] = [];

    override get title() {
        return game.i18n.localize('SR5.OverwatchScoreTrackerTitle');
    }

    override async _prepareContext(options: Parameters<ApplicationV2['_prepareContext']>[0]) {
        const context = await super._prepareContext(options);

        await this._addMissingUserCharactersToStorage();
        this.actors = OverwatchStorage.trackedActors();
        context.scores = this.actors.map(actor => ({ score: actor.getOverwatchScore(), actor }));
        context.isGM = game.user.isGM;

        return context;
    }

    override async _onRender(
        context: DeepPartial<OverwatchScoreTrackerContext>,
        options: DeepPartial<ApplicationV2.RenderOptions>
    ) {
        this.element.querySelectorAll<HTMLInputElement>('.overwatch-score-input').forEach(input => {
            input.addEventListener('change', event => {
                void this._setOverwatchScore(event);
            });
        });

        return super._onRender(context, options);
    }

    async _addMissingUserCharactersToStorage() {
        if (!game.users) return;

        for (const user of game.users) {
            if (user.isGM || !user.character) continue;

            const actor = user.character;
            if (OverwatchStorage.isTrackedActor(actor as SR5Actor)) continue;
            await OverwatchStorage.trackActor(actor as SR5Actor);
        }
    }

    // returns the actor that this event is acting on
    _getActorFromEvent(event: Event, target?: HTMLElement): SR5Actor | null {
        const actionTarget = target ?? (event.target instanceof HTMLElement ? event.target : null);
        if (!actionTarget) return null;

        const uuid = actionTarget.closest<HTMLElement>('.list-item')?.dataset.uuid;
        if (!uuid) return null;

        return fromUuidSync(uuid) as SR5Actor | null;
    }

    static async #onAddActor(this: OverwatchScoreTracker, event: Event) {
        event.preventDefault();
        event.stopPropagation();

        const tokens = Helpers.getControlledTokens();
        if (tokens.length === 0) {
            ui.notifications?.warn(game.i18n.localize('SR5.OverwatchScoreTracker.NotifyNoSelectedTokens'));
            return;
        }

        // Warn user about selected unlinked token actors.
        const unlinkedActor = tokens.find(token => !token.document.actorLink);
        if (unlinkedActor !== undefined) {
            ui.notifications.warn(game.i18n.localize('SR5.OverwatchScoreTracker.OnlyLinkedActorsSupported'));
        }

        // Add linked token actors.
        for (const token of tokens.filter(currentToken => currentToken.document.actorLink)) {
            // Double check that the actor actually lives in the actors collection.
            const actor = game.actors.get(token.document.actorId!);
            if (!actor) continue;
            if (OverwatchStorage.isTrackedActor(actor as SR5Actor)) continue;

            await OverwatchStorage.trackActor(actor as SR5Actor);
        }

        await this.render();
    }

    async _setOverwatchScore(event: Event) {
        if (!(event.currentTarget instanceof HTMLInputElement)) return;

        const actor = this._getActorFromEvent(event, event.currentTarget);
        const amount = Number.parseInt(event.currentTarget.value, 10);
        if (!actor || Number.isNaN(amount)) return;

        await actor.setOverwatchScore(amount);
        await this.render();
    }

    static async #addOverwatchScore(this: OverwatchScoreTracker, event: Event, target?: HTMLElement) {
        event.preventDefault();
        event.stopPropagation();

        const actionTarget = target ?? (event.target instanceof HTMLElement ? event.target : null);
        if (!actionTarget) return;

        const actor = this._getActorFromEvent(event, actionTarget);
        const amount = Number.parseInt(actionTarget.closest<HTMLElement>('[data-amount]')?.dataset.amount ?? '0', 10);
        if (!actor || Number.isNaN(amount)) return;

        const os = actor.getOverwatchScore();
        await actor.setOverwatchScore(os + amount);
        await this.render();
    }

    static async #resetOverwatchScore(this: OverwatchScoreTracker, event: Event, target?: HTMLElement) {
        event.preventDefault();
        event.stopPropagation();

        const actor = this._getActorFromEvent(event, target);
        if (!actor) return;

        await actor.setOverwatchScore(0);
        await this.render();
    }

    /**
     * Remove the connected actor from the tracker.
     */
    static async #onDeleteActor(this: OverwatchScoreTracker, event: Event, target?: HTMLElement) {
        event.preventDefault();
        event.stopPropagation();

        const actor = this._getActorFromEvent(event, target);
        if (!actor) return;

        await OverwatchStorage.untrackActor(actor);
        await this.render();
    }

    static async #rollFor15Minutes(this: OverwatchScoreTracker, event: Event, target?: HTMLElement) {
        event.preventDefault();
        event.stopPropagation();

        const actor = this._getActorFromEvent(event, target);
        if (actor) {
            //  use static value so it can be modified in modules
            const roll = new Roll(OverwatchScoreTracker.MatrixOverwatchDiceCount);
            await roll.evaluate();
            if (!roll.total) return;

            const os = actor.getOverwatchScore();
            await actor.setOverwatchScore(os + roll.total);
            await this.render();
        }
    }
}
