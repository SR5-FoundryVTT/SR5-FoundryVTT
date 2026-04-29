import { SR5 } from "../../config";
import { FLAGS, SYSTEM_NAME } from './../../constants';
import { ImportHelper as IH } from "../itemImport/helper/ImportHelper";

export class IconAssign {
    private static readonly IMG_EXTENSIONS = ['.svg', '.webp', '.png', '.jpg', '.jpeg', '.avif'];

    private static iconFilesCache: Set<string> | null = null;
    private static iconFilesPromise: Promise<Set<string>> | null = null;

    /**
     * Helper function to recursively browse a directory and all its sub-directories.
     * @param path The full data path to browse.
     * @returns A promise that resolves to an array of file paths.
     */
    private static async browseRecursively(path: string): Promise<string[]> {
        try {
            const picker = await foundry.applications.apps.FilePicker.implementation.browse("data", path);

            const files = picker.files;

            const promises = picker.dirs.map(async dir => IconAssign.browseRecursively(dir));
            const filesFromSubDirs = await Promise.all(promises);

            files.push(...filesFromSubDirs.flat());

            return files;
        } catch (error) {
            console.error(`[SR5] Error browsing icon files in ${path}:`, error);
            return [];
        }
    }

    /**
     * Load icon files from the configured folder and its sub-folders (no cache).
     */
    private static async loadIconFiles(): Promise<Set<string>> {
        if (!game.user?.can("FILES_BROWSE")) {
            return new Set();
        }

        const imgFolder = game.settings.get(SYSTEM_NAME, FLAGS.ImportIconFolder)
            || "systems/shadowrun5e/dist/icons/importer/";

        const allFiles = await IconAssign.browseRecursively(imgFolder);
        return new Set(allFiles);
    }

    /**
     * Get cached icon files, optionally not forcing a cache refresh.
     */
    static async getIconFiles(forceRefresh = false): Promise<Set<string>> {
        if (forceRefresh) {
            IconAssign.iconFilesCache = null;
            IconAssign.iconFilesPromise = null;
        }

        if (IconAssign.iconFilesCache) return IconAssign.iconFilesCache;
        if (!IconAssign.iconFilesPromise) {
            IconAssign.iconFilesPromise = IconAssign.loadIconFiles()
                .then((iconSet) => {
                    IconAssign.iconFilesCache = iconSet;
                    return iconSet;
                })
                .finally(() => {
                    IconAssign.iconFilesPromise = null;
                });
        }

        return IconAssign.iconFilesPromise;
    }

    /**
     * Assigns an icon to an Actor or Item document based on import flags.
     * @param iconSet - A Set of available icon paths for fast lookups.
     * @param doc - The Actor or Item create data.
     */
    static iconAssign(
        iconSet: Set<string>,
        doc: Actor.CreateData | Item.CreateData,
    ): string | null {
        const system = doc.system;

        if (iconSet.size === 0)
            return doc.img ?? null;

        const importFlags = system?.importFlags;
        const fallbackCategory = system && 'category' in system ? system.category ?? "" : "";

        const imgName = IH.formatAsSlug(importFlags?.name || doc.name || '');
        const imgType = doc.type;
        const imgCategory = IH.formatAsSlug(importFlags?.category || fallbackCategory);
        const useOverrides = game.settings.get(SYSTEM_NAME, FLAGS.UseImportIconOverrides);
        const imgFolder = game.settings.get(SYSTEM_NAME, FLAGS.ImportIconFolder)
            || "systems/shadowrun5e/dist/icons/importer/";

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
            for (const imgExtension of IconAssign.IMG_EXTENSIONS) {
                const withExtension = iconFileName + imgExtension;
                if (iconSet.has(withExtension))
                    return withExtension;
            }
        }

        return null;
    }
}
