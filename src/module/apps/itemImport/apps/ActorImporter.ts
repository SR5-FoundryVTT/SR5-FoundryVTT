import { CharacterImporter, ImportOptionsType } from "../../actorImport/characterImporter/CharacterImporter";
import { SpiritImporter } from "../../actorImport/spiritImporter/SpiritImporter";
import { SpriteImporter } from "../../actorImport/spriteImporter/SpriteImporter";
import { ActorFile, ActorSchema } from "../../actorImport/ActorSchema";
import { ImporterSourcesConfig } from "./ImporterSourcesConfig";
import { ImportHelper as IH } from "../helper/ImportHelper";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

const IMPORT_FIELDS = [
    "armor",
    "contacts",
    "cyberware",
    "equipment",
    "lifestyles",
    "powers",
    "qualities",
    "spells",
    "vehicles",
    "weapons",
    "mugshots",
] as const;

type ImportField = (typeof IMPORT_FIELDS)[number];
type ImportSelections = Record<ImportField, boolean>;
type FolderContext = { id: string, name: string, selected: boolean };

const DEFAULT_IMPORT_SELECTIONS = Object.fromEntries(
    IMPORT_FIELDS.map((field) => [field, true])
) as ImportSelections;

interface ImporterContext extends foundry.applications.api.ApplicationV2.RenderContext {
    folders: FolderContext[]
    canUploadFiles: boolean
    hasSelectedFile: boolean
    selectedFileName: string | null
    selectedFileSize: string | null
    isImporting: boolean
    importSelections: ImportSelections
    pastedJsonText: string
};

const BaseClass = HandlebarsApplicationMixin(ApplicationV2<ImporterContext>);
type BaseClassType = InstanceType<typeof BaseClass>;

export class ActorImporter extends BaseClass {
    private pastedJsonText = '';
    private isImporting = false;
    private selectedJsonFile: File | null = null;
    private selectedFolderId: string | null = null;
    private importSelections: ImportSelections = { ...DEFAULT_IMPORT_SELECTIONS };

    static async importActorData(
        actorData: ActorSchema,
        importOptions: ImportOptionsType,
    ) {
        const spiritTemplate = await SpiritImporter.findSpiritByGuid(actorData.metatype_guid);
        if (spiritTemplate)
            return SpiritImporter.import(actorData, spiritTemplate, importOptions);

        const spriteTemplate = await SpriteImporter.findSpriteByGuid(actorData.metatype_guid);
        if (spriteTemplate)
            return SpriteImporter.import(actorData, spriteTemplate, importOptions);

        const importedSpiritByProfile = await SpiritImporter.importFromPresetProfile(actorData, importOptions);
        if (importedSpiritByProfile)
            return importedSpiritByProfile;

        const importedSpriteByProfile = await SpriteImporter.importFromPresetProfile(actorData, importOptions);
        if (importedSpriteByProfile)
            return importedSpriteByProfile;

        return CharacterImporter.import(actorData, importOptions);
    }

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
            icon: "fas fa-file-import",
        },
        actions: {
            import: function(this: ActorImporter) {
                void this.handleActorImport();
            },
            openConfig: function(this: ActorImporter) {
                void new ImporterSourcesConfig().render({ force: true });
            },
            selectJsonFile: function(this: ActorImporter) {
                this.openJsonFilePicker();
            },
            clearSelectedFile: function(this: ActorImporter) {
                void this.clearSelectedFile();
            }
        }
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
        return game.i18n.localize("SR5.Import.ActorImporter.Title");
    }

    override async _prepareContext(...args: Parameters<BaseClassType['_prepareContext']>) {
        const baseContext = await super._prepareContext(...args);
        const canUploadFiles = Boolean(game.user?.can("FILES_UPLOAD"));

        return {
            ...baseContext,
            canUploadFiles,
            isImporting: this.isImporting,
            pastedJsonText: this.pastedJsonText,
            folders: this.prepareFolderContext(),
            hasSelectedFile: this.selectedJsonFile !== null,
            selectedFileName: this.selectedJsonFile?.name ?? null,
            selectedFileSize: this.selectedJsonFile ? this.formatFileSize(this.selectedJsonFile.size) : null,
            importSelections: {
                ...this.importSelections,
                mugshots: canUploadFiles ? this.importSelections.mugshots : false
            },
        };
    }

    protected override async _onRender(...args: Parameters<BaseClassType['_onRender']>) {
        await super._onRender(...args);
        this.syncFormStateFromDom();
        if (!this.element) return;

        const folderSelect = this.element.querySelector<HTMLSelectElement>("#chummer-folder-select");
        folderSelect?.addEventListener("change", (event) => {
            const select = event.currentTarget as HTMLSelectElement;
            this.selectedFolderId = select.value || null;
        });

        for (const field of IMPORT_FIELDS) {
            const input = this.element.querySelector<HTMLInputElement>(`input[data-field="${field}"]`);
            input?.addEventListener("change", (event) => {
                const checkbox = event.currentTarget as HTMLInputElement;
                this.importSelections[field] = checkbox.checked;
            });
        }

        const fileInput = this.element.querySelector<HTMLInputElement>("#chummer-file-input");
        fileInput?.addEventListener("change", (event) => void this.onFileInputChange(event));

        const dropZone = this.element.querySelector<HTMLElement>("#chummer-file-dropzone");
        if (!dropZone) return;
        dropZone.addEventListener("dragenter", (event) => this.onFileDropZoneDragEnter(event, dropZone));
        dropZone.addEventListener("dragover", (event) => this.onFileDropZoneDragOver(event));
        dropZone.addEventListener("dragleave", (event) => this.onFileDropZoneDragLeave(event, dropZone));
        dropZone.addEventListener("drop", (event) => void this.onFileDropZoneDrop(event, dropZone));
    }

    private async handleActorImport() {
        if (this.isImporting) return;

        this.syncFormStateFromDom();

        let jsonText: string;
        if (this.selectedJsonFile) {
            try {
                jsonText = (await this.selectedJsonFile.text()).trim();
            } catch (error) {
                console.error("Failed to read selected JSON file:", error);
                ui.notifications?.error("Failed to read selected JSON file.");
                return;
            }

            if (!jsonText) {
                ui.notifications?.warn("Selected input is empty.");
                return;
            }
        } else {
            const textarea = this.element?.querySelector<HTMLTextAreaElement>("#chummer-input");
            jsonText = textarea?.value.trim() ?? "";
            if (!jsonText) {
                ui.notifications?.warn("Please paste Chummer JSON data or select a Chummer JSON export file.");
                return;
            }
        }

        const actorData = this.parseActorData(jsonText);
        if (!actorData) return;

        this.isImporting = true;
        await this.render();

        try {
            const canUploadFiles = Boolean(game.user?.can("FILES_UPLOAD"));
            const importOptions = {
                folderId: this.selectedFolderId,
                ...this.importSelections,
                mugshots: this.importSelections.mugshots && canUploadFiles,
            } satisfies ImportOptionsType;
            console.debug("Parsed Chummer Data:", actorData);
            console.debug("Import Options:", importOptions);

            await ActorImporter.importActorData(actorData, importOptions);
            await this.close();
        } catch (error) {
            console.error("Actor import failed:", error);
            ui.notifications?.error("Actor import failed. See console for details.");
        } finally {
            this.isImporting = false;
            if (this.rendered) {
                await this.render();
            }
        }
    }

    private prepareFolderContext(): FolderContext[] {
        const compareOptions = { numeric: true, sensitivity: 'base' } satisfies Intl.CollatorOptions;
        return game.folders
            .filter(folder => folder.type === "Actor")
            .map(folder => ({
                id: folder.id,
                name: `${'─'.repeat(folder.ancestors.length) + ' '}${folder.name}`.trim(),
                sortKey: [...folder.ancestors].reverse().map(ancestor => ancestor.name).concat(folder.name)
            }))
            .sort((a, b) => {
                const len = Math.min(a.sortKey.length, b.sortKey.length);
                for (let i = 0; i < len; i++) {
                    const cmp = a.sortKey[i].localeCompare(b.sortKey[i], undefined, compareOptions);
                    if (cmp !== 0) return cmp;
                }
                return a.sortKey.length - b.sortKey.length;
            })
            .map(({ id, name }) => ({ id, name, selected: id === this.selectedFolderId }));
    }

    private parseActorData(jsonText: string): ActorSchema | null {
        try {
            const fileData = JSON.parse(jsonText) as ActorFile;
            const actorData = IH.getArray(fileData.characters.character)[0];
            if (actorData) {
                return actorData;
            }

            ui.notifications?.error("Could not find actor data in the provided JSON.");
            return null;
        } catch (error) {
            ui.notifications?.error("Invalid JSON. Please check your input.");
            console.error("JSON Parse Error:", error);
            return null;
        }
    }

    private openJsonFilePicker() {
        if (this.isImporting) return;
        const fileInput = this.element?.querySelector<HTMLInputElement>("#chummer-file-input");
        if (!fileInput) return;

        // Reset the input value so selecting the same file still fires a change event.
        fileInput.value = '';
        fileInput.click();
    }

    private onFileDropZoneDragEnter(event: DragEvent, dropZone: HTMLElement) {
        event.preventDefault();
        this.setFileDropActive(dropZone, true);
    }

    private onFileDropZoneDragOver(event: DragEvent) {
        event.preventDefault();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'copy';
        }
    }

    private onFileDropZoneDragLeave(event: DragEvent, dropZone: HTMLElement) {
        event.preventDefault();

        const nextTarget = event.relatedTarget;
        if (nextTarget instanceof Node && dropZone.contains(nextTarget)) {
            return;
        }

        this.setFileDropActive(dropZone, false);
    }

    private async onFileDropZoneDrop(event: DragEvent, dropZone: HTMLElement) {
        event.preventDefault();
        this.setFileDropActive(dropZone, false);
        if (this.isImporting) return;

        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        if (!file) return;

        if (!this.isJsonFile(file)) {
            ui.notifications?.warn("Please drop a JSON export file.");
            return;
        }

        await this.setSelectedJsonFile(file);
    }

    private async onFileInputChange(event: Event) {
        if (this.isImporting) return;
        const input = event.currentTarget as HTMLInputElement | null;
        const file = input?.files?.[0] ?? null;
        if (input) input.value = '';
        await this.setSelectedJsonFile(file);
    }

    private async clearSelectedFile() {
        if (this.isImporting) return;
        this.syncFormStateFromDom();
        this.selectedJsonFile = null;
        const fileInput = this.element?.querySelector<HTMLInputElement>("#chummer-file-input");
        if (fileInput) fileInput.value = '';
        await this.render();
    }

    private async setSelectedJsonFile(file: File | null) {
        this.syncFormStateFromDom();
        if (!file) {
            this.selectedJsonFile = null;
            await this.render();
            return;
        }

        if (!this.isJsonFile(file)) {
            ui.notifications?.warn("Please select a JSON export file.");
            return;
        }

        if (file.size === 0) {
            ui.notifications?.warn("Selected JSON file is empty.");
            return;
        }

        this.pastedJsonText = '';
        this.selectedJsonFile = file;
        const textarea = this.element?.querySelector<HTMLTextAreaElement>("#chummer-input");
        if (textarea) {
            textarea.value = '';
            textarea.dispatchEvent(new Event('change', { bubbles: true }));
        }
        await this.render();
    }

    private syncFormStateFromDom() {
        if (!this.element) return;

        const folderSelect = this.element.querySelector<HTMLSelectElement>("#chummer-folder-select");
        if (folderSelect) {
            this.selectedFolderId = folderSelect.value || null;
        }

        for (const field of IMPORT_FIELDS) {
            const input = this.element.querySelector<HTMLInputElement>(`input[data-field="${field}"]`);
            if (!input) continue;
            this.importSelections[field] = input.checked;
        }

        const textarea = this.element.querySelector<HTMLTextAreaElement>("#chummer-input");
        if (textarea) this.pastedJsonText = textarea.value;
    }

    private setFileDropActive(dropZone: HTMLElement, active: boolean) {
        dropZone.classList.toggle('is-drop-active', active);
    }

    private isJsonFile(file: File): boolean {
        return file.type === "application/json" || file.name.toLowerCase().endsWith(".json");
    }

    private formatFileSize(sizeInBytes: number): string {
        if (!Number.isFinite(sizeInBytes) || sizeInBytes < 1024) {
            return `${Math.max(sizeInBytes, 0)} B`;
        }

        const units = ["KB", "MB", "GB"];
        let size = sizeInBytes / 1024;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex += 1;
        }

        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }
}
