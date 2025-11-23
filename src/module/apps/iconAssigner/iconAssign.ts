import { SR5 } from "../../config";
import { FLAGS, SYSTEM_NAME } from './../../constants';
import { ImportHelper as IH } from "../itemImport/helper/ImportHelper";

const DEFAULT_ICON = "icons/svg/item-bag.svg";
const IMG_EXTENSIONS = ['.svg', '.webp', '.png', '.jpg', '.jpeg', '.avif'];

/**
 * Helper function to recursively browse a directory and all its sub-directories.
 * @param path The full data path to browse.
 * @returns A promise that resolves to an array of file paths.
 */
async function browseRecursively(path: string): Promise<string[]> {
    try {
        const picker = await foundry.applications.apps.FilePicker.implementation.browse("data", path);

        const files = picker.files;

        const promises = picker.dirs.map(async dir => browseRecursively(dir));
        const filesFromSubDirs = await Promise.all(promises);

        files.push(...filesFromSubDirs.flat());
        
        return files;
    } catch (error) {
        console.error(`[SR5] Error browsing icon files in ${path}:`, error);
        return [];
    }
}

/**
 * Recursively gets all files from the specified icon folder and all sub-folders.
 */
export async function getIconFiles(): Promise<Set<string>> {
    if (!game.user?.can("FILES_BROWSE")) {
        return new Set();
    }

    const imgFolder = game.settings.get(SYSTEM_NAME, FLAGS.ImportIconFolder)
                        || "systems/shadowrun5e/icons/importer/";

    const allFiles = await browseRecursively(imgFolder);    
    return new Set(allFiles);
}

/**
 * Assigns an icon to an Actor or Item document based on import flags.
 * @param iconSet - A Set of available icon paths for fast lookups.
 * @param doc - The Actor or Item create data.
 */
export function iconAssign(
    iconSet: Set<string>,
    doc: Actor.CreateData | Item.CreateData,
): string {
    const system = doc.system;

    if (!system?.importFlags || iconSet.size === 0) {
        return doc.img || DEFAULT_ICON;
    }

    const importFlags = system.importFlags;
    const imgName = IH.formatAsSlug(importFlags.name || '');
    const imgType = doc.type;
    const imgCategory = IH.formatAsSlug(importFlags.category || '');
    const useOverrides = game.settings.get(SYSTEM_NAME, FLAGS.UseImportIconOverrides);
    const imgFolder = game.settings.get(SYSTEM_NAME, FLAGS.ImportIconFolder)
                        || "systems/shadowrun5e/icons/importer/";

    let override = '';
    if (useOverrides) {
        const typeOverrides = SR5.itemCategoryIconOverrides[imgType];
        if (typeof typeOverrides === 'object' && typeOverrides[imgCategory]) {
            override = typeOverrides[imgCategory];
        } else if (typeof typeOverrides === 'string') {
            override = typeOverrides;
        }
    }

    // Build a prioritized list of possible icon file paths
    const fileNamePriority: (string | null)[] = [
        // 1. Use override path if available
        override ? `${imgFolder}${override}` : null,
        // 2. Most specific: type/category/name
        (imgCategory && imgName) ? `${imgFolder}${imgType}/${imgCategory}/${imgName}` : null,
        // 3. Type/category
        imgCategory ? `${imgFolder}${imgType}/${imgCategory}` : null,
        // 4. Type/name
        imgName ? `${imgFolder}${imgType}/${imgName}` : null,
        // 5. Type/type (e.g., weapon/weapon)
        `${imgFolder}${imgType}/${imgType}`,
        // 6. Category file (not type-specific)
        imgCategory ? `${imgFolder}${imgCategory}` : null,
        // 7. Type folder
        `${imgFolder}${imgType}`,
        // 8. Name at root
        imgName ? `${imgFolder}${imgName}` : null,
    ];

    switch (imgType) {
        case 'armor':
            // TODO: Add separation by if it's an accessory
            break;

        case 'weapon': {
            const weaponSystem = system as Item.SystemOfType<'weapon'>;
            if (weaponSystem.category) {
                // Insert the weapon-specific category paths at index 3
                fileNamePriority.splice(3, 0,
                    // Weapon Type/Category/name
                    imgName ? `${imgFolder}${imgType}/${weaponSystem.category}/${imgName}` : null,
                    // Weapon Type/Category
                    `${imgFolder}${imgType}/${weaponSystem.category}`
                );
            }
            break;
        }
        default:
            break;
    }

    const validFileNames = fileNamePriority.filter(Boolean) as string[];

    for (const iconFileName of validFileNames) {
        for (const imgExtension of IMG_EXTENSIONS) {
            const withExtension = iconFileName + imgExtension;
            if (iconSet.has(withExtension))
                return withExtension;
        }
    }

    return DEFAULT_ICON;
}
