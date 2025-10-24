import { SR5BaseActorSheet } from "./SR5BaseActorSheet";
import { SheetFlow } from '@/module/flows/SheetFlow';
import { Helpers } from '@/module/helpers';


export class SR5SpiritActorSheet extends SR5BaseActorSheet {
    /**
     * Spirit actors will handle these item types specifically.
     *
     * All others will be collected within the gear tab.
     *
     * @returns An array of item types from the template.json Item section.
     */
    override getHandledItemTypes(): string[] {
        let itemTypes = super.getHandledItemTypes();

        return [
            ...itemTypes,
            'critter_power',
            'spell',
            'quality'
        ];
    }

    static override DEFAULT_OPTIONS = {
        actions: {
            pickSummoner: SR5SpiritActorSheet.#pickSummoner,
            removeSummoner: SR5SpiritActorSheet.#removeSummoner,
        }
    }

    static override TABS = {
        primary: {
            initial: 'skills',
            labelPrefix: 'SR5.Tabs',
            tabs: [
                { id: 'actions', label: 'Actions', cssClass: '' },
                { id: 'skills', label: 'Spirit', cssClass: '' },
                { id: 'critter', label: 'Powers', cssClass: '' },
                { id: 'magic', label: 'Magic', cssClass: '' },
                { id: 'effects', label: 'Effects', cssClass: '' },
                { id: 'description', label: '', icon: 'far fa-info', tooltip: 'SR5.Tooltips.Actor.Description', cssClass: 'skinny' },
                { id: 'misc', label: '', icon: 'fas fa-gear', tooltip: 'SR5.Tooltips.Actor.MiscConfig', cssClass: 'skinny' },
            ]
        },
    }

    static override PARTS = {
        ...super.PARTS,
        skills: {
            template: SheetFlow.templateBase('actor/tabs/spirit-skills'),
            templates: [
                ...SheetFlow.templateActorSystemParts('active-skills', 'attributes'),
                ...SheetFlow.templateListItem('skill')
            ],
            scrollable: ['scrollable']
        },
        magic: {
            template: SheetFlow.templateBase('actor/tabs/spirit-magic'),
            templates: [
                    ...SheetFlow.templateActorSystemParts('spells', 'rituals'),
                    ...SheetFlow.templateListItem('spell', 'ritual')
                ],
            scrollable: ['.scrollable']
        },
        critter: {
            template: SheetFlow.templateBase('actor/tabs/critter'),
            templates: SheetFlow.templateListItem('critter_power'),
            scrollable: ['scrollable']
        },
    }

    /**
     * Spirit actors sheets deviate from base actors around the summoning workflows.
     * 
     * @param options 
     * @returns 
     */
    override async _prepareContext(options) {
        const data = await super._prepareContext(options) as any;

        if (this.document.isType('spirit') && this.document.system.summonerUuid)
            data['summoner'] = await fromUuid(this.document.system.summonerUuid as any);

        data.isSpirit = true;

        return data;
    }

    override async _onDropActor(event, actor) {
        if (!actor.isType('character')) return;
        await this.document.addSummoner(actor);
    }

    /**
     * Remove the summoner from this spirit actor.
     * @param event Any interaction event.
     */
    static async #pickSummoner(this: SR5SpiritActorSheet, event) {
        event.preventDefault();
        event.stopPropagation();
        event.preventDefault();
        const actors = Helpers.getControlledTokenActors();
        if (actors.length > 0) {
            // pick the first controlled actor
            const actor = actors[0];
            await this.actor.addSummoner(actor);
            await this.render();
        }
    }

    /**
     * Remove the summoner from this spirit actor.
     * @param event Any interaction event.
     */
    static async #removeSummoner(this: SR5SpiritActorSheet, event) {
        event.preventDefault();
        event.stopPropagation();

        await this.document.removeSummoner();
    }
}
