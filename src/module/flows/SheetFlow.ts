import { formatStrict } from '@/module/utils/strings';
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

    actorSystemParts(...parts: string[]) {
        return parts.map(p => this.templateBase(`actor/parts/${p}`))
    },

    listItem(...parts: string[]) {
        return parts.reduce<string[]>(( items, p) => {
            items.push(this.templateBase(`list-items/${p}/header`));
            items.push(this.templateBase(`list-items/${p}/item`));
            return items;
        }, [])
    },

    _cleanItemParts(item: SR5Item, parts: Record<string, any>) {
        if (!item.getTechnologyData()) {
            delete parts['technology'];
        }
        if (!item.isType('contact')) {
            delete parts['contact'];
        }
        if (!item.getAction()) {
            delete parts['action'];
            delete parts['damage'];
            delete parts['opposed'];
        }
        if (!item.isType('ammo')) {
            delete parts['ammo'];
        }
        if (!item.isType('quality')) {
            delete parts['quality'];
        }
        if (!item.isType('adept_power')) {
            delete parts['adeptPower'];
        }
        if (!item.isType('armor')) {
            delete parts['armor'];
        }
    }

}
