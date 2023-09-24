// import { SR5 } from "../../config";

export function iconAssign(importFlags: Shadowrun.ImportFlagData, system: Shadowrun.ShadowrunItemDataData): string {

    const defaultImg = "icons/svg/item-bag.svg";
    const imgFolder = "systems/shadowrun5e/dist/icons/importer/";
    const imgExtension = '.svg';
    const imgName = importFlags.name;
    const imgType = importFlags.type;
    const imgSubType = importFlags.subType;

    console.log(imgName, imgType, imgSubType, system);

    switch (imgType) {
        case 'action':

            break;

        case 'adept_power':

            break;

        case 'ammo':

            break;

        case 'armor':
            // Add separation by if it's an accessory

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

    return imgFolder + imgType + (imgSubType ? '-' : '') + imgSubType + imgExtension;
}