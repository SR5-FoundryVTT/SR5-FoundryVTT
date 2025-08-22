
import AppV2 = foundry.applications.api.ApplicationV2;
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

type ImporterContext = {
    folders: { id: string, path: string }[]
};

export class ActorImporter extends HandlebarsApplicationMixin(ApplicationV2<ImporterContext>) {
    /**
     * Default options for the application window.
     */
    static override DEFAULT_OPTIONS = {
        id: "chummer-data-import",
        tag: "form",
        position: {
            width: 600,
            height: "auto" as const,
        },
        window: {
            classes: ["chummer-import"],
            title: "Chummer/Data Import",
        },
    };

    /**
     * Template parts used by the HandlebarsApplicationMixin.
     */
    static override PARTS = {
        content: {
            template: "systems/shadowrun5e/dist/templates/apps/actor-importer.hbs",
        },
    };

    /**
     * Dynamic title for the application window.
     */
    override get title() {
        return "Chummer/Data Import";
    }

    private getPath(folder: Folder): string {
        if (folder.ancestors[0]) {
            const parent = game.folders.get(folder.ancestors[0].id);
            if (parent) {
                return this.getPath(parent) + "/" + folder.name;
            }
        }
        return folder.name;
    }

    override async _prepareContext(options?: any) {
        const baseContext = await super._prepareContext(options);

        // Get all actor folders
        const actorFolders = game.folders.filter(f => f.type === "Actor");

        // Map folders to { id, path } with hierarchical sorting
        const folders = actorFolders.map(folder => {
            // Calculate depth: number of ancestors (direct parent is ancestors[0])
            const depth = folder.ancestors.length;

            // Create display name with dashes: "-" per level of depth
            const indent = depth > 0 ? '─'.repeat(depth) + ' ' : '';
            const displayName = `${indent}${folder.name}`;

            // Sort key: array of ancestor folder names (from root to parent), then folder name
            const sortKey = [
                ...folder.ancestors.reverse().map(f => f.name), // Root first, then children
                folder.name
            ];

            return {
                id: folder.id,
                path: displayName,
                sortKey,
                depth
            };
        });

        // Sort hierarchically: compare each level of the path
        folders.sort((a, b) => {
            for (let i = 0; i < Math.min(a.sortKey.length, b.sortKey.length); i++) {
                const cmp = a.sortKey[i].localeCompare(b.sortKey[i], undefined, {
                    numeric: true,
                    sensitivity: 'base'
                });
                if (cmp !== 0) return cmp;
            }
            // If one is a prefix of the other, shorter comes first (parent before child)
            return a.sortKey.length - b.sortKey.length;
        });

        // Strip sortKey and depth for final output
        const result = folders.map(f => ({
            id: f.id,
            path: f.path
        }));

        return {
            ...baseContext,
            folders: result
        };
    }
}
