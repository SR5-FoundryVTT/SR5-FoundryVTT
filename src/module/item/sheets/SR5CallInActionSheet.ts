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
export class SR5CallInActionSheet extends SR5ItemSheet<SR5CallInActionSheetData> {
    override async _prepareContext(options): Promise<SR5CallInActionSheetData> {
        const data = await super._prepareContext(options);

        const system = data.system as Item.SystemOfType<'call_in_action'>;

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

        if (actor.isType('spirit')) await this.updatePreparedSpirit(actor);
        if (actor.isType('sprite')) await this.updatePreparedSprite(actor);
    }

    override activateListeners_LEGACY(html: any): void {
        super.activateListeners_LEGACY(html);

        html.find('.spirit-remove').click(this.handleSpiritRemove.bind(this));
        html.find('.sprite-remove').click(this.handleSpriteRemove.bind(this));
    }

    /**
     * Summoning sheets can be connected to a pre-prepared spirit.
     * Supply that actor if it's available.
     * 
     * @returns null should the configured spirit not exist anymore.
     */
    async prepareSpirit(system: Item.SystemOfType<'call_in_action'>): Promise<SR5Actor|null> {
        if (!system.spirit.uuid)
            return null;

        return fromUuid(system.spirit.uuid) as Promise<SR5Actor>;
    }

    /**
     * Conjuring can be connected to a pre-prepared sprite.
     * Supply that actor if it's available.
     * 
     * @returns null should the configured sprite not exist anymore.
     */
    async prepareSprite(system: Item.SystemOfType<'call_in_action'>): Promise<SR5Actor|null> {
        if (!system.sprite.uuid)
            return null;

        return fromUuid(system.sprite.uuid) as Promise<SR5Actor>;
    }
    
    /**
     * Handling the removal of a spirit by any sheet action.
     */
    async handleSpiritRemove(event: any) {
        await this.item.update({ system: { spirit: { uuid: '' } } });
    }
    
    /**
     * User requested removal of the prepared sprite.
     */
    async handleSpriteRemove(event: any) {
        await this.item.update({ system: { spirit: { uuid: '' } } });
    }

    /**
     * Updating the summoning items prepared spirit.
     * 
     * @param actor The prepared actor
     */
    async updatePreparedSpirit(spirit: SR5Actor<'spirit'>) {
        await this.item.update({
            system: {
                spirit: {
                    uuid: spirit.uuid,
                    type: spirit.system.spiritType,
                    force: spirit.system.force
                }
            }
        });
    }

    /**
     * Update the compilation items prepared sprite.
     * 
     * @param actor The prepared actor
     */
    async updatePreparedSprite(sprite: SR5Actor<'sprite'>) {
        await this.item.update({
            system: {
                sprite: {
                    uuid: sprite.uuid,
                    type: sprite.system.spriteType,
                    level: sprite.system.level
                }
            }
        });
    }
}
