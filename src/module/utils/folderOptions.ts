/**
 * Folder aware option lists for plain <select> controls.
 *
 * A select can't nest, so depth is shown with a '─' prefix per level. Leading whitespace
 * would be collapsed by the browser, which is why the indent is drawn rather than spaced.
 */

/**
 * A single <option>. Folder headers carry no value and can't be picked.
 */
export interface FolderSelectOption {
    value: string;
    // Already indented for its depth.
    label: string;
    disabled: boolean;
    selected: boolean;
}

/**
 * A document that can be offered for selection. Kept structural, so both SR5Actor and any
 * other Foundry document fit without this module depending on them.
 */
export interface SelectableDocument {
    uuid: string;
    name: string | null;
    folder: Folder | null;
}

const COMPARE_OPTIONS = { numeric: true, sensitivity: 'base' } satisfies Intl.CollatorOptions;

/**
 * Compare two folder paths segment by segment, so a child sorts directly under its parent.
 */
function comparePaths(a: string[], b: string[]): number {
    const shared = Math.min(a.length, b.length);
    for (let i = 0; i < shared; i++) {
        const compared = a[i].localeCompare(b[i], undefined, COMPARE_OPTIONS);
        if (compared !== 0) return compared;
    }
    return a.length - b.length;
}

/**
 * The names of a folder and everything above it, root first.
 */
function folderPath(folder: Folder): string[] {
    return [...folder.ancestors].reverse().map(ancestor => ancestor.name).concat(folder.name);
}

function indent(depth: number, name: string | null): string {
    return `${'─'.repeat(depth)} ${name ?? ''}`.trim();
}

/**
 * Every folder of the given document type, in tree order.
 *
 * For picking a folder itself, as the actor importer does when choosing an import target.
 */
export function folderSelectOptions(type: Folder['type'], selected?: string | null): FolderSelectOption[] {
    return game.folders
        .filter(folder => folder.type === type)
        .map(folder => ({ folder, path: folderPath(folder) }))
        .sort((a, b) => comparePaths(a.path, b.path))
        .map(({ folder }) => ({
            value: folder.id,
            label: indent(folder.ancestors.length, folder.name),
            disabled: false,
            selected: folder.id === selected,
        }));
}

/**
 * The given documents grouped under their folders, in tree order.
 *
 * Only folders holding one of the given documents are listed, so a user seeing a handful of
 * documents isn't handed the world's whole folder tree as empty headers. Documents outside
 * any folder come last, matching the sidebar.
 */
export function documentSelectOptions(
    documents: Iterable<SelectableDocument>,
    selected?: string | null,
): FolderSelectOption[] {
    const byFolder = new Map<string, SelectableDocument[]>();
    const unfoldered: SelectableDocument[] = [];
    // Kept separately from byFolder, as an ancestor is listed for the sake of its children
    // even when it holds nothing itself.
    const folders = new Map<string, Folder>();

    for (const document of documents) {
        // An unsaved folder has no id and so no stable key. It can't be the folder of a
        // document the user is picking from either, so it groups as unfoldered.
        const id = document.folder?.id;
        if (!document.folder || !id) {
            unfoldered.push(document);
            continue;
        }

        byFolder.set(id, [...byFolder.get(id) ?? [], document]);
        for (const folder of [document.folder, ...document.folder.ancestors]) {
            if (folder.id) folders.set(folder.id, folder);
        }
    }

    const byName = (a: SelectableDocument, b: SelectableDocument) =>
        (a.name ?? '').localeCompare(b.name ?? '', undefined, COMPARE_OPTIONS);

    const options: FolderSelectOption[] = [];
    const sorted = [...folders.values()]
        .map(folder => ({ folder, path: folderPath(folder) }))
        .sort((a, b) => comparePaths(a.path, b.path));

    for (const { folder } of sorted) {
        const depth = folder.ancestors.length;
        options.push({ value: '', label: indent(depth, folder.name), disabled: true, selected: false });

        for (const document of (byFolder.get(folder.id ?? '') ?? []).sort(byName)) {
            options.push({
                value: document.uuid,
                label: indent(depth + 1, document.name),
                disabled: false,
                selected: document.uuid === selected,
            });
        }
    }

    for (const document of unfoldered.sort(byName)) {
        options.push({
            value: document.uuid,
            label: document.name ?? '',
            disabled: false,
            selected: document.uuid === selected,
        });
    }

    return options;
}
