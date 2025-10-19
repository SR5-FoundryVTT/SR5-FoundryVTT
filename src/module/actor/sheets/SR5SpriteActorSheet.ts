import { SR5Actor } from '../SR5Actor';
import { MatrixActorSheetData, SR5MatrixActorSheet } from '@/module/actor/sheets/SR5MatrixActorSheet';
import { SheetFlow } from '@/module/flows/SheetFlow';
import { Helpers } from '@/module/helpers';

export type SpriteActorSheetData = MatrixActorSheetData & {
    technmomancer: SR5Actor | null;
    isSprite: boolean;
}

export class SR5SpriteActorSheet extends SR5MatrixActorSheet<SpriteActorSheetData> {
    static override DEFAULT_OPTIONS: any = {
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
                { id: 'actions', label: 'Actions', cssClass: '' },
                { id: 'skills', label: 'Sprite', cssClass: '' },
                { id: 'matrix', label: 'Matrix', cssClass: '' },
                { id: 'effects', label: 'Effects', cssClass: '' },
                { id: 'description', label: '', icon: 'far fa-info', tooltip: 'SR5.Tooltips.Sheet.Description', cssClass: 'skinny' },
                { id: 'misc', label: '', icon: 'fas fa-gear', tooltip: 'SR5.Tooltips.Sheet.MiscConfig', cssClass: 'skinny' },
            ]
        },
        matrixRight: {
            initial: 'matrixActions',
            tabs: [
                { id: 'matrixActions', label: 'Actions', cssClass: '', },
                { id: 'spritePowers', label: 'Sprite Powers', cssClass: '', }
            ]
        }
    }
    protected override async _renderHTML(content, options) {
        const parts = await super._renderHTML(content, options);
        const matrixRightSideContent = parts.matrix?.querySelector("section.content.matrix-right-tab-content");
        if (matrixRightSideContent) {
            this.moveTabs(SR5SpriteActorSheet.TABS.matrixRight.tabs, parts, matrixRightSideContent);
        }

        return parts;
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
        matrix: {
            template: SheetFlow.templateBase('actor/tabs/matrix'),
            scrollable: [
                '#matrix-actions-scroll',
                '#marked-icons-scroll' ,
                '#owned-icons-scroll',
                '#network-icons-scroll',
                '#sprite-powers-scroll',
            ]
        },
        spritePowers: {
            template: SheetFlow.templateBase('actor/tabs/matrix/sprite-powers'),
            templates: SheetFlow.templateListItem('sprite_power'),
        },
    }
    /**
     * Sprite actors will handle these item types specifically.
     *
     * All others will be collected within the gear tab.
     *
     * @returns An array of item types from the template.json Item section.
     */
    override getHandledItemTypes(): string[] {
        let itemTypes = super.getHandledItemTypes();

        return [
            ...itemTypes,
            'sprite_power'
        ];
    }

    override async _prepareContext(options) {
        const data = await super._prepareContext(options);

        // Collect sprite technomancer for easy interaction.
        if (this.document.isType('sprite') && this.document.system.technomancerUuid !== '')
            data['technomancer'] = await fromUuid(this.document.system.technomancerUuid);

        data.isSprite = true;

        return data;
    }

    override async _onDropActor(event, actor) {
        await this.actor.addTechnomancer(actor);
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
