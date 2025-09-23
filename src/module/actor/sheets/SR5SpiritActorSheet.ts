import { SR5Actor } from "../SR5Actor";
import { SR5BaseActorSheet } from "./SR5BaseActorSheet";
import { SheetFlow } from '@/module/flows/SheetFlow';


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

    static override TABS = {
        primary: {
            initial: 'skills',
            tabs: [
                { id: 'actions', label: 'Actions', cssClass: '' },
                { id: 'skills', label: 'Skills', cssClass: '' },
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
                ...SheetFlow.actorSystemParts('active-skills', 'spirit-options',
                                'attributes', 'special-attributes'),
                ...SheetFlow.listItem('skill')
            ],
            scrollable: ['scrollable']
        },
        magic: {
            template: SheetFlow.templateBase('actor/tabs/spirit-magic'),
            templates: [
                    ...SheetFlow.actorSystemParts('spells', 'rituals'),
                    ...SheetFlow.listItem('spell', 'ritual')
                ],
            scrollable: ['.scrollable']
        },
        critter: {
            template: SheetFlow.templateBase('actor/tabs/critter'),
            templates: SheetFlow.listItem('critter_power'),
            scrollable: ['scrollable']
        },
        bio: {
            template: SheetFlow.templateBase('actor/tabs/bio'),
            templates: [
                ...SheetFlow.actorSystemParts('metamagics'),
                ...SheetFlow.listItem('metamagic', 'quality'),
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
     * Spirit actor sheets do provide some specific functionality.
     * @param html 
     */
    override activateListeners_LEGACY(html) {
        super.activateListeners_LEGACY(html);

        html.find('.summoner-remove').on('click', this._onRemoveSummoner.bind(this));
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
    async _onRemoveSummoner(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        await this.document.removeSummoner();
    }
}
