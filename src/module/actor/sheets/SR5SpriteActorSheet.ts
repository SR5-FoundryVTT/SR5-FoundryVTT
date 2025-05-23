import { SR5Actor } from "../SR5Actor";
import {SR5BaseActorSheet} from "./SR5BaseActorSheet";


export class SR5SpriteActorSheet extends SR5BaseActorSheet {
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

    override activateListeners(html: any): void {
        super.activateListeners(html);

        html.find('.technomancer-remove').on('click', this._onRemoveTechnomancer.bind(this));
    }

    override async getData(options: any) {
        const data = await super.getData(options);

        // Collect sprite technomancer for easy interaction.
        if (this.document.isSprite() && this.document.system.technomancerUuid !== '')
            data['technomancer'] = await fromUuid(this.document.system.technomancerUuid);

        return data;
    }

    /**
     * Sprites have support for dropping actors onto them.
     */
    override async _onDrop(event: DragEvent): Promise<void> {
        event.preventDefault();
        event.stopPropagation();

        if (event.dataTransfer === null) return;

        const dropData = JSON.parse(event.dataTransfer.getData('text/plain'));

        await this._addTechnomancerOnDrop(dropData);

        return await super._onDrop(event);
    }

    /**
     * Determine if a dropped actor should be used as a technomancer.
     * @param dropData Drop Data of any kind
     */
    async _addTechnomancerOnDrop(dropData: any): Promise<void> {
        if (dropData.type !== 'Actor') return;
        const actor = await fromUuid(dropData.uuid) as SR5Actor;
        if (!actor.isCharacter()) return;

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
}