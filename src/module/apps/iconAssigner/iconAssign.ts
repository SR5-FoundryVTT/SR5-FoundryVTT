// import { SR5 } from "../../config";

// List of recognized subcategories. This probably belongs somewhere else more appropriate.
const ammoCategories = ['ammo', 'arrow', 'bola', 'bolt', 'grenade', 'micro-torpedo',
                        'minigrenade', 'missile', 'rocket', 'torpedo grenade'];

export function iconAssign(itemType: string, name: string, system: Shadowrun.ShadowrunItemDataData): string {
    // const itemTypes = SR5.itemTypes;
    const defaultImg = "icons/svg/item-bag.svg";
    const imgFolder = "systems/shadowrun5e/dist/icons/importer/";
    const imgExtension = '.svg';
    const imgType = itemType;
    let imgSubtype: string | undefined = '';

    console.log(itemType, name, system);

    switch (itemType) {
        case 'action':

            break;

        case 'adept_power':

            break;

        case 'ammo':
            imgSubtype = name.split(':')[0].trim().toLowerCase();
            if (!ammoCategories.includes(imgSubtype)) {
                return defaultImg;
            }
            break;

        case 'armor':

            break;

        case 'bioware':

            break;

        case 'complex_form':

            break;

        case 'contact':

            break;

        case 'critter_power':

            break;

        case 'cyberware':

            break;

        case 'device':

            break;

        case 'equipment':

            break;

        case 'host':

            break;

        case 'lifestyle':

            break;

        case 'modification':

            break;

        case 'program':

            break;

        case 'quality':
            imgSubtype = system.type;
            break;

        case 'sin':

            break;

        case 'spell':

            break;

        case 'sprite_power':

            break;

        case 'weapon':
            if (system.category) {
                imgSubtype = system.category;
            }
            /* if (system.subcategory) {
                imgSubtype = system.subcategory;
            } */
            break;

        default:
            break;
    }

    return imgFolder + imgType + (imgSubtype ? '-' : '') + imgSubtype + imgExtension;
}