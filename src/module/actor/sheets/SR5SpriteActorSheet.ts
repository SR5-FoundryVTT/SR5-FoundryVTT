import { SR5Actor } from '../SR5Actor';
import { MatrixActorSheetData, SR5MatrixActorSheet } from '@/module/actor/sheets/SR5MatrixActorSheet';
import { SheetFlow } from '@/module/flows/SheetFlow';
import { Helpers } from '@/module/helpers';

export interface SpriteActorSheetData extends MatrixActorSheetData {
    technomancer?: SR5Actor | null;
    isSprite: boolean;
}

export class SR5SpriteActorSheet extends SR5MatrixActorSheet<SpriteActorSheetData> {
    static override DEFAULT_OPTIONS = {
        actions: {
            pickTechnomancer: SR5SpriteActorSheet.#pickTechnomancer,
            removeTechnomancer: SR5SpriteActorSheet.#onRemoveTechnomancer,
        }
    }

    static override TABS = {
        ...super.TABS,
        primary: {
            initial: 'skills',
            tabs: [
                { id: 'actions', label: 'SR5.Tabs.Actor.Actions', cssClass: '' },
                { id: 'skills', label: 'SR5.Tabs.Actor.Sprite', cssClass: '' },
                { id: 'matrix', label: 'SR5.Tabs.Actor.Matrix', cssClass: '' },
                { id: 'effects', label: 'SR5.Tabs.Actor.Effects', cssClass: '' },
                { id: 'description', label: '', icon: 'far fa-info', tooltip: 'SR5.Tooltips.Actor.Description', cssClass: 'skinny' },
                { id: 'misc', label: '', icon: 'fas fa-gear', tooltip: 'SR5.Tooltips.Actor.MiscConfig', cssClass: 'skinny' },
            ]
        },
    }

    static override PARTS = {
        ...super.PARTS,
        skills: {
            template: SheetFlow.templateBase('actor/tabs/sprite-skills'),
            templates: [
                ...SheetFlow.templateActorSystemParts('active-skills'),
                ...SheetFlow.templateListItem('skill')
            ],
            scrollable: ['#active-skills-scroll']
        },
    }
    /**
     * Sprite actors will handle these item types specifically.
     *
     * All others will be collected within the gear tab.
     *
     * @returns An array of item types from the template.json Item section.
     */
    override getHandledItemTypes(): Item.ConfiguredSubType[] {
        const itemTypes = super.getHandledItemTypes();

        return [
            ...itemTypes,
            'sprite_power'
        ];
    }

    override async _prepareContext(options: Parameters<SR5MatrixActorSheet["_prepareContext"]>[0]) {
        const data = await super._prepareContext(options);

        // Collect sprite technomancer for easy interaction.
        if (this.document.isType('sprite') && this.document.system.technomancerUuid !== '')
            data.technomancer = await fromUuid(this.document.system.technomancerUuid) as SR5Actor;

        data.isSprite = true;

        return data;
    }

    override async _onDropActor(event: DragEvent, actor: SR5Actor) {
        await this.actor.addTechnomancer(actor);
        return null;
    }

    /**
     * Remove the technomancer from the sprite.
     */
    static async #pickTechnomancer(this: SR5SpriteActorSheet, event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        const actors = Helpers.getControlledTokenActors();
        if (actors.length > 0) {
            // pick the first controlled actor
            const actor = actors[0];
            await this.actor.addTechnomancer(actor);
            await this.render();
        }
    }

    /**
     * Remove the technomancer from the sprite.
     */
    static async #onRemoveTechnomancer(this: SR5SpriteActorSheet, event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        await this.document.removeTechnomancer();
    }
}
