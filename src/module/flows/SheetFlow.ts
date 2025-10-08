import { formatStrict } from '@/module/utils/strings';
import { SR5Item } from '@/module/item/SR5Item';
import { LinksHelpers } from '@/module/utils/links';

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

    fromUuidSync(uuid: string) {
        const parts = uuid.split('.');
        // if the parts includes multiple 'Item' parts, we are dealing with an embedded item within an item
        if (parts.filter(part => part === 'Item').length > 1) {
            // get the parent item
            const indexOfParentItem = parts.findIndex(part => part === 'Item') + 2;
            const parentItemParts = parts.slice(0, indexOfParentItem);
            const parentItemUuid = parentItemParts.join(".");
            const item = fromUuidSync(parentItemUuid);
            if (item && item instanceof SR5Item) {
                // now determine if this is an effect within an embedded item or just an embedded item
                const finalParts = parts.slice(indexOfParentItem);
                if (finalParts.includes('ActiveEffect')) {
                    const finalItemId = finalParts[1];
                    const finalItem = item.getOwnedItem(finalItemId);
                    if (finalItem) {
                        const effectId = finalParts[3];
                        return finalItem.effects.get(effectId);
                    } else {
                        console.error('Shadowrun5e | Could not find item on parent item', item, finalItemId)
                        return undefined;
                    }
                } else {
                    const finalItemId = finalParts[1];
                    return item.getOwnedItem(finalItemId);
                }
            } else {
                console.error("Shadowrun5e | I was expecting an item but didn't get an item", item);
                return undefined;
            }
        } else {

            // fromUuidSync doesn't allow  retrieving embedded compendium documents, so manually retrieving each child document from the base document.
            const { collection, embedded, documentId } = foundry.utils.parseUuid(uuid);
            if (collection && embedded && documentId) {
                let document = collection.get(documentId) as any;
                while (document && (embedded.length > 1)) {
                    const [embeddedName, embeddedId] = embedded.splice(0, 2);
                    document = document.getEmbeddedDocument(embeddedName, embeddedId);
                }
                return document;
            }
            return fromUuidSync(uuid);
        }
    },

    closestItemId(target) {
        return target.closest('[data-item-id]').dataset.itemId;
    },

    closestUuid(target) {
        return target.closest('[data-uuid]').dataset?.uuid;
    },

    closestEffectId(target) {
        return target.closest('[data-effect-id]').dataset?.effectId;
    },

    closestAction(target) {
        return target.closest('[data-action]');
    },

    listItemId(target) {
        return target.closest('.new-list-item[data-item-id]')?.dataset?.itemId;
    },

    closestSource(target) {
        return target.closest('[data-source]')?.dataset?.source;
    },

    _getSourceContextOption() {
        return {
            name: "SR5.ContextOptions.Source",
            icon: "<i class='fas fa-page'></i>",
            condition: (target) => {
                const source = this.closestSource(target);
                return !!source;
            },
            callback: async (target) => {
                const source = this.closestSource(target);
                if (source) {
                    await LinksHelpers.openSource(source);
                }
            }
        }
    }
}
