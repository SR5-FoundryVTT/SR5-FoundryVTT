import { SR5Actor } from "../SR5Actor";
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
            tabs: [
                { id: 'actions', label: 'Actions', cssClass: '' },
                { id: 'skills', label: 'Spirit', cssClass: '' },
                { id: 'critter', label: 'Critter', cssClass: '' },
                { id: 'magic', label: 'Magic', cssClass: '' },
                { id: 'bio', label: 'Bio', cssClass: '' },
                { id: 'effects', label: 'Effects', cssClass: '' },
                { id: 'misc', label: 'Misc', cssClass: '' },
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
        bio: {
            template: SheetFlow.templateBase('actor/tabs/bio'),
            templates: [
                ...SheetFlow.templateActorSystemParts('metamagics'),
                ...SheetFlow.templateListItem('metamagic', 'quality'),
            ],
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

    /**
     * Spirit actors have additional drop cases to handle.
     */
    override async _onDrop(event) {
        event.preventDefault();
        event.stopPropagation();

        if (!event.dataTransfer) return;

        // First, spirit specific behavior.
        const dropData = JSON.parse(event.dataTransfer.getData('text/plain'));

        // Handle summoner drops, ignore other actor drop options as spirits don't handle them.
        if (dropData.type === 'Actor') {
            await this._addSummonerOnDrop(dropData);
            return;
        }

        // Then, handle the rest of the actor drop cases.
        return super._onDrop(event);
    }

    /**
     * Determine if a dropped actor should be used as a spirit summoner.
     * @param dropData Actor drop data.
     */
    async _addSummonerOnDrop(dropData: { type: string; uuid: string; }) {
        if (dropData.type !== 'Actor') return;
        const actor = await fromUuid(dropData.uuid) as SR5Actor;
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
