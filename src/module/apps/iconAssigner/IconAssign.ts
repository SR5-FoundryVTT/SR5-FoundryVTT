import { SR5 } from "../../config";
import { FLAGS, SYSTEM_NAME } from '../../constants';
import { ImportHelper as IH } from "../itemImport/helper/ImportHelper";

const FilePicker = foundry.applications.apps.FilePicker.implementation;

export class IconAssign {
    private static readonly MAX_BROWSE_DEPTH = 5;
    private static readonly IMG_EXTENSIONS = ['.svg', '.webp', '.png', '.jpg', '.jpeg', '.avif'];

    private static iconFilesCache: Set<string> | null = null;
    private static iconFilesPromise: Promise<Set<string>> | null = null;

    /**
     * Get the base folder for icons from settings, or use default if not set.
     */
    private static getIconFolder(): string {
        return game.settings.get(SYSTEM_NAME, FLAGS.ImportIconFolder) || "systems/shadowrun5e/dist/icons/importer/";
    }

    /**
     * Helper function to recursively browse a directory and all its sub-directories.
     * @param path The full data path to browse.
     * @param depth Current recursion depth.
     * @returns A promise that resolves to an array of file paths.
     */
    private static async browseRecursively(path: string, depth = 0): Promise<string[]> {
        if (depth >= IconAssign.MAX_BROWSE_DEPTH) {
            console.warn(`[SR5] Maximum icon browse depth reached at ${path}`);
            return [];
        }

        try {
            const picker = await FilePicker.browse("data", path);

            const files = picker.files;

            const promises = picker.dirs.map(async (dir) => IconAssign.browseRecursively(dir, depth + 1));
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

        const allFiles = await IconAssign.browseRecursively(IconAssign.getIconFolder());
        return new Set(allFiles);
    }

    /**
     * Read icon files from cache synchronously.
     */
    static getIconFiles(): ReadonlySet<string> | null {
        return IconAssign.iconFilesCache;
    }

    /**
     * Force refresh of icon files cache.
     */
    static async refreshIconFiles(): Promise<Set<string>> {
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
     * @param doc - The Actor or Item create data.
     */
    static iconAssign(doc: Actor.CreateData | Item.CreateData): string | null {
        const iconSet = IconAssign.getIconFiles();
        const system = doc.system;

        if (!iconSet?.size)
            return doc.img ?? null;

        const importFlags = system?.importFlags;
        const fallbackCategory = system && 'category' in system ? system.category ?? "" : "";

        const imgType = doc.type;
        const imgFolder = IconAssign.getIconFolder();
        const imgName = IH.formatAsSlug(importFlags?.name || doc.name || '');
        const imgCategory = IH.formatAsSlug(importFlags?.category || fallbackCategory);
        const useOverrides = game.settings.get(SYSTEM_NAME, FLAGS.UseImportIconOverrides);

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
            case 'weapon': {
                const weaponSystem = system as Item.SystemOfType<'weapon'>;
                if (weaponSystem?.category) {
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
