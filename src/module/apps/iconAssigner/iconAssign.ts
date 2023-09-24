import { SR5 } from "../../config";

export async function iconAssign(importFlags: Shadowrun.ImportFlagData, system: Shadowrun.ShadowrunItemDataData): Promise<string> {

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
            // imgSubType = system.type;
            break;

        case 'sin':

            break;

        case 'spell':

            break;

        case 'sprite_power':

            break;

        case 'weapon':
            /* if (system.category) {
                imgSubType = system.category;
            }
            if (system.subcategory) {
                imgSubtype = system.subcategory;
            } */
            break;

        default:
            break;
    }

    // Priority of file names to check
    const fileNamePriority = [
        imgFolder + imgType + (imgSubType ? '/' : '') + imgSubType + imgExtension,
        imgFolder + imgType + '/' + imgType + imgExtension
    ]

    // Run through potential file names, taking the first one that has an icon that exists
    for (const iconFileName of fileNamePriority) {
        if (await srcExists(iconFileName)) {
            return iconFileName
        }
    }

    return defaultImg
}