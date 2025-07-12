import { SR5 } from "../../config";
import { FLAGS, SYSTEM_NAME } from './../../constants';

export async function getIconFiles(): Promise<string[]> {

    if (!game.user?.can("FILES_BROWSE")) {
        return []
    }

    // Icon locations
    const imgFolder = game.settings.get(SYSTEM_NAME, FLAGS.ImportIconFolder) as string || "systems/shadowrun5e/dist/icons/importer/";
    const folderList = await FilePicker.browse("data", imgFolder).then(picker => picker.dirs);
    let fileList = await FilePicker.browse("data", imgFolder).then(picker => picker.files);

    for (const folder of folderList) {
        const newFiles = await FilePicker.browse("data", folder).then(picker => picker.files);
        fileList = fileList.concat(newFiles);
    }

    return fileList
}

export function iconAssign(
    importFlags: Shadowrun.ImportFlagData,
    iconList: string[],
    system?: Shadowrun.ShadowrunActorDataData | Shadowrun.ShadowrunItemData['system']
): string {

    const defaultImg = "icons/svg/item-bag.svg";
    const imgFolder = game.settings.get(SYSTEM_NAME, FLAGS.ImportIconFolder) as string || "systems/shadowrun5e/dist/icons/importer/";
    const imgExtensionOptions = ['.svg', '.webp', '.png', '.jpg', '.jpeg', '.avif'];
    const imgName = importFlags.name;
    const imgType = importFlags.type;
    const imgSubType = importFlags.subType;
    const useOverrides = game.settings.get(SYSTEM_NAME, FLAGS.UseImportIconOverrides) as boolean;

    // Get the override, if any
    let override = '';
    if (imgSubType && useOverrides) override = SR5.itemSubTypeIconOverrides[imgType][imgSubType];
    else if (imgType && useOverrides && typeof SR5.itemSubTypeIconOverrides[imgType] === 'string')
        override = SR5.itemSubTypeIconOverrides[imgType];

    // Priority of file names to check
    let fileNamePriority = [
        imgFolder + override,
        imgFolder + imgType + (imgSubType ? '/' : '') + imgSubType,
        imgFolder + imgType + '/' + imgType,
        imgFolder + imgSubType,
        imgFolder + imgType
    ]
    switch (imgType) {
        case 'armor':
            // TODO: Add separation by if it's an accessory

            break;

        case 'weapon':
            const weaponSystem = system as Shadowrun.WeaponItemData['system'];
            fileNamePriority = [
                imgFolder + override,
                imgFolder + imgType + (imgSubType ? '/' : '') + imgSubType,
                imgFolder + imgType + '/' + weaponSystem.category,
                imgFolder + imgType + '/' + imgType,
                imgFolder + imgSubType,
                imgFolder + imgType
            ]
            break;

        default:
            break;
    }

    // Run through potential file names, taking the first one that has an icon that exists
    for (const iconFileName of fileNamePriority) {
        for (const imgExtension of imgExtensionOptions) {
            const withExtension = iconFileName + imgExtension;
            if (iconList.includes(withExtension)) {
                return withExtension
            }
        }
    }

    return defaultImg
}