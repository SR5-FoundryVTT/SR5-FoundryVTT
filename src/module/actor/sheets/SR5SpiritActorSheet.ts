import { SR5Item } from "../../item/SR5Item";
import { SR5Actor } from "../SR5Actor";
import {SR5BaseActorSheet} from "./SR5BaseActorSheet";


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

    /**
     * Spirit actors sheets deviate from base actors around the summoning workflows.
     * 
     * @param options 
     * @returns 
     */
    override async getData(options: any) {
        const data = await super.getData(options);
        
        const spirit = this.document.asSpirit();
        if (spirit) {
            if (spirit.system.summonerUuid) {
                data['summoner'] = await fromUuid((this.document.system as Shadowrun.SpiritData).summonerUuid);
            }
        }

        return data;
    }

    /**
     * Spirit actor sheets do provide some specific functionality.
     * @param html 
     */
    override activateListeners(html) {
        super.activateListeners(html);

        html.find('.summoner-remove').on('click', this._onRemoveSummoner.bind(this));
    }
    
    override async _onDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();

        if (!event.dataTransfer) return;
        // Keep upstream document created for actions base on it.
        const documents = await super._onDrop(event);

        const dropData = JSON.parse(event.dataTransfer.getData('text/plain'));

        await this._addSummonerOnDrop(dropData);

        return documents;
    }

    /**
     * Determine if a dropped actor should be used as a spirit summoner.
     * @param dropData Actor drop data.
     */
    async _addSummonerOnDrop(dropData: { type: string; uuid: string; }) {
        if (dropData.type !== 'Actor') return;
        const actor = await fromUuid(dropData.uuid) as SR5Actor;
        if (!actor.isCharacter()) return;

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