import { SR5Actor } from "../../actor/SR5Actor";
import { parseDropData } from "../../utils/sheets";
import { SR5BaseItemSheetData, SR5ItemSheet } from "../SR5ItemSheet";


interface SR5CallInActionSheetData extends SR5BaseItemSheetData {
    spirit: SR5Actor | null
    sprite: SR5Actor | null

    isForSpirit: boolean
    isForSprite: boolean
}

/**
 * Item Sheet implementation for the call in action item type.
 * 
 * This shows creation / call in of different type of actor types by an actor
 * 'creator' or 'caller'. Summoner/Conjurer, Technomancer, etc.
 */
export class SR5CallInActionSheet extends SR5ItemSheet {
    override async getData(options: any): Promise<SR5CallInActionSheetData> {
        const data = await super.getData(options) as unknown as SR5BaseItemSheetData;

        const system = data.system as Shadowrun.CallInActionData;
        
        // Allow for prepared actors to be shown on sheet.
        const spirit = await this.prepareSpirit(system);
        const sprite = await this.prepareSprite(system)

        // Allow sheet to determine it's current creation mode.
        const isForSpirit = system.actor_type === 'spirit';
        const isForSprite = system.actor_type === 'sprite';
        
        return {
            ...data,
            spirit,
            sprite,
            isForSpirit,
            isForSprite
        }
    }

    /**
     * Summoning Sheets allow dropping of spirits onto them.
     * These spirits will be used as pre-configured actors to summon.
     */
    override async _onDrop(event: any) {
        event.preventDefault();
        event.stopPropagation();

        const data = parseDropData(event);
        if (!data) return;

        if (data.type !== 'Actor') return;
        const actor = await fromUuid(data.uuid) as SR5Actor;

        if (actor.isSpirit()) await this.updatePreparedSpirit(actor);
        if (actor.isSprite()) await this.updatePreparedSprite(actor);
    }

    override activateListeners(html: any): void {
        super.activateListeners(html);

        html.find('.spirit-remove').click(this.handleSpiritRemove.bind(this));
        html.find('.sprite-remove').click(this.handleSpriteRemove.bind(this));
    }

    /**
     * Summoning sheets can be connected to a pre-prepared spirit.
     * Supply that actor if it's available.
     * 
     * @returns null should the configured spirit not exist anymore.
     */
    async prepareSpirit(system: Shadowrun.CallInActionData): Promise<SR5Actor|null> {
        if (!system.spirit.uuid) {
            return null;
        }
        return await fromUuid(system.spirit.uuid) as SR5Actor;
    }

    /**
     * Conjuring can be connected to a pre-prepared sprite.
     * Supply that actor if it's available.
     * 
     * @returns null should the configured sprite not exist anymore.
     */
    async prepareSprite(system: Shadowrun.CallInActionData): Promise<SR5Actor|null> {
        if (!system.sprite.uuid) {
            return null;
        }
        return await fromUuid(system.sprite.uuid) as SR5Actor;
    }
    
    /**
     * Handling the removal of a spirit by any sheet action.
     */
    async handleSpiritRemove(event: any) {
        await this.item.update({'system.spirit.uuid': ''});
    }
    
    /**
     * User requested removal of the prepared sprite.
     */
    async handleSpriteRemove(event: any) {
        await this.item.update({'system.sprite.uuid': ''});
    }

    /**
     * Updating the summoning items prepared spirit.
     * 
     * @param actor The prepared actor
     */
    async updatePreparedSpirit(spirit: SR5Actor<'spirit'>) {
        await this.item.update({
            'system.spirit.uuid': spirit.uuid,
            'system.spirit.type': spirit.system.spiritType,
            'system.spirit.force': spirit.system.force,
        });
    }

    /**
     * Update the compilation items prepared sprite.
     * 
     * @param actor The prepared actor
     */
    async updatePreparedSprite(sprite: SR5Actor<'sprite'>) {
        await this.item.update({
            'system.sprite.uuid': sprite.uuid,
            'system.sprite.type': sprite.system.spriteType,
            'system.sprite.level': sprite.system.level,
        });
    }
}