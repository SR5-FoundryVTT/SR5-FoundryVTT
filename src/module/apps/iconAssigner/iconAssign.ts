import { SR5 } from "../../config";

export async function iconAssign(importFlags: Shadowrun.ImportFlagData, system: Shadowrun.ShadowrunItemDataData): Promise<string> {

    const defaultImg = "icons/svg/item-bag.svg";
    const imgFolder = "systems/shadowrun5e/dist/icons/importer/";
    const imgExtension = '.svg';
    const imgName = importFlags.name;
    const imgType = importFlags.type;
    const imgSubType = importFlags.subType;

    // console.log(imgName, imgType, imgSubType, system);

    // Priority of file names to check
    let fileNamePriority = [
        imgFolder + imgType + (imgSubType ? '/' : '') + imgSubType + imgExtension,
        imgFolder + imgType + '/' + imgType + imgExtension
    ]

    switch (imgType) {
        case 'armor':
            // TODO: Add separation by if it's an accessory

            break;

        case 'weapon':
            fileNamePriority = [
                imgFolder + imgType + (imgSubType ? '/' : '') + imgSubType + imgExtension,
                imgFolder + imgType + '/' + system.category + imgExtension,
                imgFolder + imgType + '/' + imgType + imgExtension
            ]
            console.log(imgFolder + imgType + '/' + system.category + imgExtension);
            break;

        default:
            break;
    }



    // Run through potential file names, taking the first one that has an icon that exists
    for (const iconFileName of fileNamePriority) {
        if (await srcExists(iconFileName)) {
            console.log(iconFileName);
            return iconFileName
        }
    }

    return defaultImg
}