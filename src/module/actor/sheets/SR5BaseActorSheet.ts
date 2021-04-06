import {SR5Actor} from "../SR5Actor";
import SR5SheetFilters = Shadowrun.SR5SheetFilters;

/**
 * This class should not be used directly but be extended for each actor type.
 */
export class SR5BaseActorSheet extends ActorSheet<{}, SR5Actor> {
    _shownDesc: string[];
    _filters: SR5SheetFilters;
    _scroll: string;

    constructor(...args) {
        super(...args);

        this._shownDesc = [];
        this._filters = {
            skills: '',
            showUntrainedSkills: true,
        };
    }

    /**
     * Extend and override the default options used by the 5e Actor Sheet
     * @returns {Object}
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['sr5', 'sheet', 'actor'],
            width: 880,
            height: 690,
            tabs: [
                {
                    navSelector: '.tabs',
                    contentSelector: '.sheetbody',
                    initial: 'skills',
                },
            ],
        });
    }

    /**
     *
     * @override
     */
    get template() {
        const path = 'systems/shadowrun5e/dist/templates';

        if (this.actor.hasPerm(game.user, 'LIMITED', true)) {
            return `${path}/actor-limited/${this.actor.data.type}.html`;
        }

        return `${path}/actor/${this.actor.data.type}.html`;
    }
}