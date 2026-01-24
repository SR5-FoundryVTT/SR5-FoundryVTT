import { formatStrict } from '@/module/utils/strings';
import { LinksHelpers } from '@/module/utils/links';
import { SR5Item } from '@/module/item/SR5Item';

export const SheetFlow = {
    _getCreateItemText(type: string): string {
        switch (type) {
            case 'lifestyle':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Lifestyle' });
            case 'contact':
                return  formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Contact' });
            case 'sin':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Sin' });
            case 'license':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.License' });
            case 'quality':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Quality' });
            case 'adept_power':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.AdeptPower' });
            case 'action':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Action' });
            case 'spell':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Spell' });
            case 'ritual':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Ritual' });
            case 'gear':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Gear' });
            case 'complex_form':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.ComplexForm' });
            case 'program':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Program' });
            case 'weapon':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Weapon' });
            case 'armor':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Armor' });
            case 'ammo':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Ammo' });
            case 'modification':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Modification' });
            case 'device':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Device' });
            case 'equipment':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Equipment' });
            case 'cyberware':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Cyberware' });
            case 'bioware':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Bioware' });
            case 'critter_power':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.CritterPower' });
            case 'sprite_power':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.SpritePower' });
            case 'echo':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Echo' });
            case 'metamagic':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Metamagic' });
            case 'summoning':
                // NOTE: summoning is not an actual item type. It's a call_in_action sub type
                return game.i18n.localize('SR5.CallInAction.CreateSummoning');
            case 'compilation':
                // NOTE: compilation is not an actual item type. It's a call_in_action sub type
                return game.i18n.localize('SR5.CallInAction.CreateCompilation');
            case 'effect':
                return formatStrict('SR5.Create', { type: 'SR5.Effect' });
            default:
                return formatStrict('SR5.Create', { type : 'SR5.FOUNDRY.Item' });
        }

    },

    templateBase(path: string) {
        return `systems/shadowrun5e/dist/templates/v2/${path}.hbs`
    },

    templateActorSystemParts(...parts: string[]) {
        return parts.map(p => this.templateBase(`actor/parts/${p}`))
    },

    templateListItem(...parts: string[]) {
        return parts.reduce<string[]>(( items, p) => {
            items.push(this.templateBase(`list-items/${p}/header`));
            items.push(this.templateBase(`list-items/${p}/item`));
            return items;
        }, [])
    },

    closestItemId(target: EventTarget | null) {
        if (!(target instanceof HTMLElement)) return '';
        return target?.closest<HTMLElement>('[data-item-id]')?.dataset?.itemId ?? '';
    },

    closestUuid(target: EventTarget | null) {
        if (!(target instanceof HTMLElement)) return '';
        return target?.closest<HTMLElement>('[data-uuid]')?.dataset?.uuid ?? '';
    },

    closestEffectId(target: EventTarget | null) {
        if (!(target instanceof HTMLElement)) return '';
        return target?.closest<HTMLElement>('[data-effect-id]')?.dataset?.effectId ?? '';
    },

    closestAction(target: EventTarget | null) {
        if (!(target instanceof HTMLElement)) return null;
        return target?.closest<HTMLElement>('[data-action]');
    },

    closestSource(target: EventTarget | null) {
        if (!(target instanceof HTMLElement)) return '';
        return target?.closest<HTMLElement>('[data-source]')?.dataset?.source ?? '';
    },

    /**
     * Context Menu Option to open the source for an item
     */
    _getSourceContextOption() {
        return {
            name: "SR5.ContextOptions.Source",
            icon: "<i class='fas fa-page'></i>",
            condition: (target: HTMLElement) => {
                const source = this.closestSource(target);
                return !!source;
            },
            callback: async (target: HTMLElement) => {
                const source = this.closestSource(target);
                if (source) {
                    await LinksHelpers.openSource(source);
                }
            }
        }
    },

    /**
     * Add Quantity to an item based on the event
     */
    async addToQuantity(item: SR5Item, event: Event) {
        const qty = item.getTechnologyData()?.quantity ?? 0;
        const someBindings = game.keybindings.get("shadowrun5e", "add-remove-some-qty");
        const manyBindings = game.keybindings.get("shadowrun5e", "add-remove-many-qty");
        let change = 1;
        if (someBindings.some(binding => event[binding.key] === true)) {
            change = 5;
        }
        if (manyBindings.some(binding => event[binding.key] === true)) {
            change = 20;
        }
        const newQty = qty + change;
        await item.update({system: { technology: { quantity: Math.max(newQty, 0)}}})
    },

    /**
     * Remove Quantity from an item based on the event
     */
    async removeFromQuantity(item: SR5Item, event: Event) {
        const qty = item.getTechnologyData()?.quantity ?? 0;
        const someBindings = game.keybindings.get("shadowrun5e", "add-remove-some-qty");
        const manyBindings = game.keybindings.get("shadowrun5e", "add-remove-many-qty");
        let change = -1;
        if (someBindings.some(binding => event[binding.key] === true)) {
            change = -5;
        }
        if (manyBindings.some(binding => event[binding.key] === true)) {
            change = -20;
        }
        const newQty = qty + change;
        await item.update({system: { technology: { quantity: Math.max(newQty, 0)}}})
    },

    /**
     * Change given items quantity.
     */
    async changeItemQuantity(item: SR5Item, quantity: number) {
        // fail safely in case data model changes here.
        if (item.system?.technology?.quantity === quantity) return;
        await item.update({system: { technology: { quantity: Math.max(quantity, 0)}}})
    }
}
