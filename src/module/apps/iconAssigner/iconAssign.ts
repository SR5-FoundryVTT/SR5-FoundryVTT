// import { SR5 } from "../../config";

export function iconAssign(itemType: string, name: string, system: Shadowrun.ShadowrunItemDataData): string {
    // const itemTypes = SR5.itemTypes;
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