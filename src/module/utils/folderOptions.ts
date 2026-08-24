/**
 * Folder aware option lists for plain <select> controls.
 *
 * A select can't nest, so the folder hierarchy is drawn with tree glyphs. Leading whitespace
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
// Native <option> controls collapse ordinary leading spaces. NBSP keeps the tree columns
// visible when a branch needs blank space instead of a vertical connector.
const TREE_INDENT = '\u00A0\u00A0\u00A0';
const TREE_PIPE_INDENT = `│\u00A0\u00A0`;

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
    const childFolders = new Map<string | undefined, Folder[]>();
    for (const folder of folders.values()) {
        // Foundry lists ancestors nearest-first. Every ancestor was added above, so a
        // missing parent means this folder is at the visible tree's root.
        const parentId = folder.ancestors[0]?.id ?? undefined;
        childFolders.set(parentId, [...childFolders.get(parentId) ?? [], folder]);
    }

    const byFolderName = (a: Folder, b: Folder) =>
        a.name.localeCompare(b.name, undefined, COMPARE_OPTIONS);

    const addFolder = (folder: Folder, prefix: string, isLast: boolean, isRoot = false) => {
        const documents = (byFolder.get(folder.id ?? '') ?? []).sort(byName);
        const children = (childFolders.get(folder.id ?? undefined) ?? []).sort(byFolderName);
        const childCount = documents.length + children.length;
        const branch = isRoot ? '' : `${prefix}${isLast ? '└─ ' : '├─ '}`;
        options.push({ value: '', label: `${branch}${folder.name}`, disabled: true, selected: false });
        const childPrefix = isRoot ? '' : `${prefix}${isLast ? TREE_INDENT : TREE_PIPE_INDENT}`;

        documents.forEach((document, index) => {
            const documentIsLast = index === childCount - 1;
            options.push({
                value: document.uuid,
                label: `${childPrefix}${documentIsLast ? '└─ ' : '├─ '}${document.name ?? ''}`,
                disabled: false,
                selected: document.uuid === selected,
            });
        });
        children.forEach((child, index) => {
            addFolder(child, childPrefix, documents.length + index === childCount - 1);
        });
    };

    const roots = (childFolders.get(undefined) ?? []).sort(byFolderName);
    roots.forEach((folder, index) => addFolder(folder, '', index === roots.length - 1, true));

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
