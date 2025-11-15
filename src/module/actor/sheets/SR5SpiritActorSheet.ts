import { SR5ActorSheetData, SR5BaseActorSheet } from "./SR5BaseActorSheet";
import { SheetFlow } from '@/module/flows/SheetFlow';
import { Helpers } from '@/module/helpers';

interface SpiritActorSheetData extends SR5ActorSheetData {
    summoner?: Actor.Implementation;
}

export class SR5SpiritActorSheet extends SR5BaseActorSheet<SpiritActorSheetData> {
    /**
     * Spirit actors will handle these item types specifically.
     *
     * All others will be collected within the gear tab.
     *
     * @returns An array of item types from the template.json Item section.
     */
    override getHandledItemTypes(): Item.ConfiguredSubType[] {
        const itemTypes = super.getHandledItemTypes();

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
                { id: 'actions', label: 'SR5.Tabs.Actor.Actions', cssClass: '' },
                { id: 'skills', label: 'SR5.Tabs.Actor.Spirit', cssClass: '' },
                { id: 'critterPowers', label: 'SR5.Tabs.Actor.CritterPowers', cssClass: '' },
                { id: 'magic', label: 'SR5.Tabs.Actor.Magic', cssClass: '' },
                { id: 'bio', label: 'SR5.Tabs.Actor.Bio', cssClass: '' },
                { id: 'effects', label: 'SR5.Tabs.Actor.Effects', cssClass: '' },
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
            scrollable: ['.scrollable']
        },
        magic: {
            template: SheetFlow.templateBase('actor/tabs/magic'),
            templates: SheetFlow.templateActorSystemParts('spells', 'rituals'),
            scrollable: ['.scrollable']
        },
        critterPowers: {
            template: SheetFlow.templateBase('actor/tabs/critter-powers'),
            scrollable: ['.scrollable']
        },
        bio: {
            template: SheetFlow.templateBase('actor/tabs/bio'),
            scrollable: ['#metamagics-scroll-list', '#quality-scroll-list', '#echoes-scroll-list'],
        },
    }

    /**
     * Spirit actors sheets deviate from base actors around the summoning workflows.
     */
    override async _prepareContext(options: Parameters<SR5BaseActorSheet["_prepareContext"]>[0]) {
        const data = await super._prepareContext(options);

        if (this.document.isType('spirit') && this.document.system.summonerUuid) {
            data.summoner = await fromUuid(this.document.system.summonerUuid) as Actor.Implementation;
        }

        data.isSpirit = true;

        return data;
    }

    protected override _prepareTabs(group: string) {
        const parts = super._prepareTabs(group);

        if (group === 'primary') {

            if (this.isPlayMode && this.hideEmptyCategories()) {
                if (parts.social && !this.actor.hasItemOfType('sin', 'contact', 'lifestyle')) {
                    parts.social.hidden = true;
                }
                if (parts.bio && !this.actor.hasItemOfType('quality', 'metamagic', 'echo')) {
                    parts.bio.hidden = true;
                }
                if (parts.critterPowers && !this._hasCritterPowers()) {
                    parts.critterPowers.cssClass += " hidden";
                }
                if (parts.magic && !this._hasMagicItems()) {
                    parts.magic.cssClass += " hidden";
                }
            }
        }

        return parts;
    }

    override async _onDropActor(event: DragEvent, actor: Actor.Implementation) {
        if (actor.isType('character'))
            await this.document.addSummoner(actor);
        return null;
    }

    /**
     * Remove the summoner from this spirit actor.
     * @param event Any interaction event.
     */
    static async #pickSummoner(this: SR5SpiritActorSheet, event: PointerEvent) {
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
    static async #removeSummoner(this: SR5SpiritActorSheet, event: PointerEvent) {
        event.preventDefault();
        event.stopPropagation();

        await this.document.removeSummoner();
    }
}
