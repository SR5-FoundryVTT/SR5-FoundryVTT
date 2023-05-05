import { SR5Actor } from "../actor/SR5Actor";
import { SR5BaseItemSheetData, SR5ItemSheet } from "./SR5ItemSheet";


interface SR5SummoningItemSheetData extends SR5BaseItemSheetData {
    spirit: SR5Actor|null
}

/**
 * Item Sheet implementation for the summoning item type.
 */
export class SR5SummoningItemSheet extends SR5ItemSheet {
    override async getData(options: any): Promise<SR5SummoningItemSheetData> {
        const data = await super.getData(options) as unknown as SR5BaseItemSheetData;

        const spirit = await this.prepareSpirit(data.system as Shadowrun.SummoningData);
        
        return {
            ...data,
            spirit
        }
    }

    /**
     * Summoning Sheets allow dropping of spirits onto them.
     * These spirits will be used as pre-configured actors to summon.
     */
    override async _onDrop(event: any) {
        event.preventDefault();
        event.stopPropagation();

        const data = this.parseDropData(event);
        if (!data) return;

        if (data.type !== 'Actor') return;
        const actor = await fromUuid(data.uuid) as SR5Actor;

        await this.updatePreparedSpirit(actor);
    }

    override activateListeners(html: any): void {
        super.activateListeners(html);

        html.find('.spirit-remove').click(this.handleSpiritRemove.bind(this));
    }

    /**
     * Summoning sheets can be connected to a pre-prepared spirit.
     * Supply that actor if it's available.
     * 
     * @returns null should the configured spirit not exist anymore.
     */
    async prepareSpirit(system: Shadowrun.SummoningData): Promise<SR5Actor|null> {
        if (!system.spirit.uuid) {
            return null;
        }
        return await fromUuid(system.spirit.uuid) as SR5Actor;
    }
    
    /**
     * Handling the removal of a spirit by any sheet action.
     */
    async handleSpiritRemove(event: any) {
        await this.item.update({'system.spirit.uuid': ''});
    }

    /**
     * Updating the summoning items prepared spirit.
     * 
     * @param uuid A uuid or empty string to remove the prepared spirit.
     */
    async updatePreparedSpirit(actor: SR5Actor) {
        const spirit = actor.asSpirit();
        if (!spirit) return;

        await this.item.update({
            'system.spirit.uuid': actor.uuid,
            'system.spirit.type': spirit.system.spiritType,
            'system.spirit.force': spirit.system.force,
        });
    }
}