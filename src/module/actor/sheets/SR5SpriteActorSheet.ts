import { SR5Actor } from '../SR5Actor';
import { SR5MatrixActorSheet } from '@/module/actor/sheets/SR5MatrixActorSheet';


export class SR5SpriteActorSheet extends SR5MatrixActorSheet {
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

    // override default options to add an extra tabbing in the matrix tab
    static override get defaultOptions() {
        const defaultOptions = super.defaultOptions;
        return foundry.utils.mergeObject(defaultOptions, {
            tabs: [...defaultOptions.tabs,
                {
                    navSelector: '.tabs[data-group="sprite"]',
                    contentSelector: '.tabsbody[data-group="sprite"]',
                    initial: 'matrix-actions',
                }]
        });
    }

    override activateListeners(html) {
        super.activateListeners(html);

        html.find('.technomancer-remove').on('click', this._onRemoveTechnomancer.bind(this));
    }

    override async getData(options: any) {
        const data = await super.getData(options);

        // Collect sprite technomancer for easy interaction.
        if (this.document.isType('sprite') && this.document.system.technomancerUuid !== '')
            data['technomancer'] = await fromUuid(this.document.system.technomancerUuid as any);

        return data;
    }

    /**
     * Sprites have support for dropping actors onto them.
     */
    override async _onDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();

        if (event.dataTransfer === null) return;

        const dropData = JSON.parse(event.dataTransfer.getData('text/plain'));

        // Handle technomancer drops, ignore other actor drops as sprites can't handle them.
        if (dropData.type === 'Actor') {
            await this._addTechnomancerOnDrop(dropData);
            return [];
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
    async _onRemoveTechnomancer(event: MouseEvent): Promise<void> {
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
