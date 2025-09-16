import { formatStrict } from '@/module/utils/strings';
import { SR5Actor } from '@/module/actor/SR5Actor';
import { SR5Item } from '@/module/item/SR5Item';

export const SheetFlow = {
    _getCreateItemText(type: string): string {
        switch (type) {
            case 'lifestyle':
                return formatStrict('SR5.Create', { type: 'SR5.Lifestyle' });
            case 'contact':
                return  formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Contact' });
            case 'sin':
                return formatStrict('SR5.Create', { type: 'SR5.SIN' });
            case 'license':
                return formatStrict('SR5.Create', { type: 'SR5.License' });
            case 'quality':
                return formatStrict('SR5.Create', { type: 'SR5.Quality' });
            case 'adept_power':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.AdeptPower' });
            case 'action':
                return formatStrict('SR5.Create', { type: 'SR5.Action' });
            case 'spell':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Spell' });
            case 'ritual':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Ritual' });
            case 'gear':
                return formatStrict('SR5.Create', { type: 'SR5.Gear' });
            case 'complex_form':
                return formatStrict('SR5.Create', { type: 'SR5.ComplexForm' });
            case 'program':
                return formatStrict('SR5.Create', { type: 'SR5.Program' });
            case 'weapon':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Weapon' });
            case 'armor':
                return formatStrict('SR5.Create', { type: 'SR5.Armor' });
            case 'ammo':
                return formatStrict('SR5.Create', { type: 'SR5.Ammo' });
            case 'modification':
                return formatStrict('SR5.Create', { type: 'SR5.Modification' });
            case 'device':
                return formatStrict('SR5.Create', { type: 'SR5.Device' });
            case 'equipment':
                return formatStrict('SR5.Create', { type: 'SR5.Equipment' });
            case 'cyberware':
                return formatStrict('SR5.Create', { type: 'SR5.Cyberware' });
            case 'bioware':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Bioware' });
            case 'critter_power':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.CritterPower' });
            case 'sprite_power':
                return formatStrict('SR5.Create', { type: 'SR5.ItemTypes.SpritePower' });
            case 'echo':
                return formatStrict('SR5.Create', { type: 'SR5.Echo' });
            case 'metamagic':
                return formatStrict('SR5.Create', { type: 'SR5.Metamagic' });
            case 'summoning':
                // NOTE: summoning is not an actual item type. It's a call_in_action sub type
                return game.i18n.localize('SR5.CallInAction.CreateSummoning');
            case 'compilation':
                // NOTE: compilation is not an actual item type. It's a call_in_action sub type
                return game.i18n.localize('SR5.CallInAction.CreateCompilation');
            case 'effect':
                return formatStrict('SR5.Create', { type: 'SR5.Effect' });
            default:
                return formatStrict('SR5.Create', { type : 'SR5.Item' });
        }

    },

    /**
     * Insert the data from an object as key/values on dataset
     * @param element
     * @param dataset
     */
    _insertDataset(element: HTMLElement, dataset?: Record<string, string>): void {
        if (dataset) {
            for (const [key, value] of Object.entries(dataset)) {
                element.dataset[key] = value;
            }
        }
    },

    createText(text: string, localize = true) {
        if (localize) {
            text = game.i18n.localize(text);
        }
        const span = document.createElement('span');
        span.innerText = text;
        return span;
    },

    createLink(element: HTMLElement, dataset?: Record<string, string>) {
        const link = document.createElement("a");
        link.appendChild(element);
        this._insertDataset(link, dataset);
        return link;
    },

    createIcon(className: string, dataset?: Record<string, string>) {
        const icon = document.createElement("i");
        icon.className = className;
        this._insertDataset(icon, dataset);
        return icon;
    },

    _getItemFromHelper(system, options): SR5Item | undefined {
        const actor = options.data.root.actor as SR5Actor;
        const item = (system instanceof SR5Item) ? system : actor.items.find(i => i._id === system._id);
        if (!item || !(item instanceof SR5Item)) return undefined;
        return item;
    },

    addIcon() {
        return this.createIcon('fas fa-plus');
    },

    brokenIcon() {
        return this.createIcon('fas fa-link-slash');
    },

    editIcon() {
        return this.createIcon('fas fa-pen-to-square');
    },

    deleteIcon() {
        return this.createIcon('fas fa-pen-trash');
    },

    expandIcon() {
        return this.createIcon('fas fa-square-chevron-down');
    },

    collapseIcon() {
        return this.createIcon('fas fa-square-chevron-up');
    },

    fileIcon() {
        return this.createIcon('fas fa-file');
    }
}
