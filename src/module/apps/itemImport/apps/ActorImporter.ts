
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
        const compareOptions = { numeric: true, sensitivity: 'base' } satisfies Intl.CollatorOptions;

        const folders = game.folders
            .filter(f => f.type === "Actor")
            .map(folder => ({
                id: folder.id,
                path: `${folder.ancestors.length > 0 ? '─'.repeat(folder.ancestors.length) + ' ' : ''}${folder.name}`,
                sortKey: [...folder.ancestors.reverse().map(a => a.name), folder.name]
            }))
            .sort((a, b) => {
                const len = Math.min(a.sortKey.length, b.sortKey.length);
                for (let i = 0; i < len; i++) {
                    const cmp = a.sortKey[i].localeCompare(b.sortKey[i], undefined, compareOptions);
                    if (cmp !== 0) return cmp;
                }
                return a.sortKey.length - b.sortKey.length;
            })
            .map(({ id, path }) => ({ id, path }));

        return { ...baseContext, folders };
    }
}
