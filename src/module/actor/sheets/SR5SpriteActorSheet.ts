import { SR5Actor } from '../SR5Actor';
import { MatrixActorSheetData, SR5MatrixActorSheet } from '@/module/actor/sheets/SR5MatrixActorSheet';

export type SpriteActorSheetData = MatrixActorSheetData & {
    technmomancer: SR5Actor | null;
    isSprite: boolean;
}

export class SR5SpriteActorSheet extends SR5MatrixActorSheet<SpriteActorSheetData> {
    static override DEFAULT_OPTIONS = {
        classes: ['sprite'],
        position: {
            width: 930,
            height: 690,
        },
        actions: {
            removeTechnomancer: this.#onRemoveTechnomancer,
        }
    }

    static override TABS = {
        ...super.TABS,
        primary: {
            initial: 'skills',
            tabs: [
                { id: 'actions', label: 'Actions', cssClass: '' },
                { id: 'skills', label: 'Skills', cssClass: '' },
                { id: 'matrix', label: 'Matrix', cssClass: '' },
                { id: 'effects', label: 'Effects', cssClass: '' },
                { id: 'description', label: 'Description', cssClass: '' },
                { id: 'misc', label: 'Misc', cssClass: '' },
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

    static override PARTS = {
        ...super.PARTS,
        skills: {
            template: this.templateBase('actor/tabs/sprite-skills'),
            templates: this.actorSystemParts('active-skills', 'sprite-options')
        },
        description: {
            template: this.templateBase('actor/tabs/description'),
        },
        matrix: {
            template: this.templateBase('actor/tabs/sprite-matrix'),
        },
        spritePowers: {
            template: this.templateBase('actor/tabs/matrix/sprite-powers'),
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

    /**
     * Sprites have support for dropping actors onto them.
     */
    override async _onDrop(event) {
        event.preventDefault();
        event.stopPropagation();

        if (event.dataTransfer === null) return;

        const dropData = JSON.parse(event.dataTransfer.getData('text/plain'));

        // Handle technomancer drops, ignore other actor drops as sprites can't handle them.
        if (dropData.type === 'Actor') {
            await this._addTechnomancerOnDrop(dropData);
            return;
        }

        return super._onDrop(event);
    }

    /**
     * Determine if a dropped actor should be used as a technomancer.
     * @param dropData Drop Data of any kind
     */
    async _addTechnomancerOnDrop(dropData: any): Promise<void> {
        if (dropData.type !== 'Actor') return;
        const actor = await fromUuid(dropData.uuid) as SR5Actor;
        if (!actor.isType('character')) return;

        this.document.addTechnomancer(actor);
    }

    /**
     * Remove the technomancer from the sprite.
     */
    static async #onRemoveTechnomancer(this: SR5SpriteActorSheet, event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        await this.document.removeTechnomancer();
    }

    /**
     * Custom behavior for ListHeader item creation for sprites.
     */
    override async _onItemCreate(event: any) {
        event.preventDefault();
        event.stopPropagation();

        const type = event.currentTarget.closest('.list-header').dataset.itemId;
        const optional = event.currentTarget.closest('.list-header').dataset.optional;

        switch (type) {
            // Sprite powers need special handling, as there are different sections for them.
            case 'sprite_power':
                if (!optional) return console.error('Shadowrun 5e | Sprite Actor Sheet: Missing optional value for sprite power item creation.');
                await super._onItemCreate(event, {system: {optional}});
                break;
            default:
                await super._onItemCreate(event);
                break;
        }
    }
}
