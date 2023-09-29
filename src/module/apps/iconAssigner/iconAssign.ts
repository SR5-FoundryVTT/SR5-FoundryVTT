import { SR5 } from "../../config";

export async function iconAssign(importFlags: Shadowrun.ImportFlagData, system: Shadowrun.ShadowrunItemDataData): Promise<string> {

    const defaultImg = "icons/svg/item-bag.svg";
    const imgFolder = "systems/shadowrun5e/dist/icons/importer/";
    const imgExtension = '.svg';
    const imgName = importFlags.name;
    const imgType = importFlags.type;
    const imgSubType = importFlags.subType;


    // Icon locations
    const folderList = await FilePicker.browse("data", imgFolder).then(picker => picker.dirs)
    const fileListGeneral = await FilePicker.browse("data", imgFolder).then(picker => picker.files)
    let fileList = ['']
    if (folderList.includes(`${imgFolder}${imgType}`)) {
        fileList = await FilePicker.browse("data", `${imgFolder}${imgType}`).then(picker => picker.files)
    }


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
            break;

        default:
            break;
    }

    // Run through potential file names, taking the first one that has an icon that exists
    for (const iconFileName of fileNamePriority) {
        if (fileList.includes(iconFileName) || fileListGeneral.includes(iconFileName)) {
            return iconFileName
        }
    }

    return defaultImg
}