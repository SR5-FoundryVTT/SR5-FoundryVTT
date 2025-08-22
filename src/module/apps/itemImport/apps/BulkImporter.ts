import { AdeptPowerImporter } from "../importer/AdeptPowerImporter";
import { ArmorImporter } from "../importer/ArmorImporter";
import { ComplexFormImporter } from "../importer/ComplexFormImporter";
import { CritterImporter } from "../importer/CritterImporter";
import { CritterPowerImporter } from "../importer/CritterPowerImporter";
import { DataImporter } from "../importer/DataImporter";
import { EchoesImporter } from "../importer/EchoesImporter";
import { GearImporter } from "../importer/GearImporter";
import { QualityImporter } from "../importer/QualityImporter";
import { SpellImporter } from "../importer/SpellImporter";
import { VehicleImporter } from "../importer/VehicleImporter";
import { VehicleModImporter } from "../importer/VehicleModImporter";
import { WareImporter } from "../importer/WareImporter";
import { WeaponImporter } from "../importer/WeaponImporter";
import { WeaponModImporter } from "../importer/WeaponModImporter";
import { Constants } from "../importer/Constants";
import * as IconAssign from "../../iconAssigner/iconAssign";
import JSZip from "jszip";

import AppV2 = foundry.applications.api.ApplicationV2;
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

interface ImporterContext extends AppV2.RenderContext {
    // UI state
    icons: boolean;
    importDone: boolean;
    isImporting: boolean;
    zipFileName: string | undefined;
    deleteCompendiums: boolean;
    overrideDocuments: boolean;

    // Progress
    progress: {
        message: string;
        pct: string; // string from toFixed()
    };

    // Info
    info: {
        version: string;
        versionLink: string;
    };
};

/**
 * This application allows bulk importing of Shadowrun 5e game data from either
 * a local ZIP file (Chummer output) or directly from the chummer5a GitHub repository.
 *
 * Import various types of game data (weapons, spells, gear, etc.)
 */
export class BulkImporter extends HandlebarsApplicationMixin(ApplicationV2<ImporterContext>) {
    /**
     * Default options for the application window.
     */
    static override DEFAULT_OPTIONS = {
        id: "chummer-data-import",
        tag: "form",
        position: {
            width: 525,
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
            template: "systems/shadowrun5e/dist/templates/apps/bulk-importer.hbs",
        },
    };

    /**
     * Dynamic title for the application window.
     */
    override get title() {
        return "Chummer/Data Import";
    }

    /**
     * GitHub repository configuration used to fetch data files.
     * Points to a specific commit (branch hash) for reproducibility.
     */
    private static readonly githubConfig = {
        owner: "chummer5a",
        repo: "chummer5a",
        version: "v5.225.977",
        branch: "ceda7c93e54d8ede7623caa7953c88ae559465da",
    } as const;

    /**
     * UI and import behavior flags.
     */
    private static setIcons = true;
    private static overrideDocuments = true;
    private static deleteCompendiums = false;
    private static isImporting = false;
    private static importDone = false;
    private static zipFile: File | null = null;

    /**
     * Tracks progress during the import process.
     */
    private static progress = { idx: 0, total: 0, message: "" };

    /**
     * Ordered list of data importers.
     *
     * Order matters:
     * - Dependencies: e.g., weapon mods must be imported before weapons.
     * - Performance: Reduce post-processing by importing in logical order.
     */
    static readonly Importers = [
        new WeaponModImporter(),
        new WeaponImporter(),
        new GearImporter(),
        new VehicleModImporter(),
        new VehicleImporter(),
        new SpellImporter(),
        new ComplexFormImporter(),
        new WareImporter(),
        new QualityImporter(),
        new CritterPowerImporter(),
        new CritterImporter(),
        new EchoesImporter(),
        new AdeptPowerImporter(),
        new ArmorImporter(),
    ] as const satisfies readonly DataImporter[];

    /**
     * Prepares the context data for rendering the template.
     *
     * @param options - Optional rendering options.
     * @returns The context object with current state and metadata.
     */
    override async _prepareContext(options?: any) {
        // Start with the base context from the parent class
        const baseContext = await super._prepareContext(options);

        // Destructure GitHub config for cleaner access
        const { owner, repo, branch, version } = BulkImporter.githubConfig;

        return {
            ...baseContext,

            // UI and import state
            icons: BulkImporter.setIcons,
            progress: {
                message: BulkImporter.progress.message,
                pct: (BulkImporter.progress.idx / BulkImporter.progress.total * 100).toFixed(0),
            },
            importDone: BulkImporter.importDone,
            isImporting: BulkImporter.isImporting,
            zipFileName: BulkImporter.zipFile?.name,
            deleteCompendiums: BulkImporter.deleteCompendiums,
            overrideDocuments: BulkImporter.overrideDocuments,

            // GitHub version info
            info: {
                version,
                versionLink: `https://www.github.com/${owner}/${repo}/tree/${branch}/Chummer/data`,
            },
        };
    }

    /**
     * Fetches a file from the GitHub repository with retry logic.
     *
     * @param path - Path to the file within the repo (e.g., "Chummer/data/weapons.xml").
     * @returns The file content as a string, or undefined if failed.
     */
    static async fetchGitHubFile(path: string): Promise<string | undefined> {
        const { owner, repo, branch } = BulkImporter.githubConfig;
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

        const attempts = 3;
        const delayMs = 2000;

        for (let i = 0; i < attempts; i++) {
            try {
                const response = await fetch(apiUrl, {
                    headers: {
                        "Accept": "application/vnd.github.v3.raw",
                    },
                });

                if (!response.ok)
                    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);

                return await response.text();
            } catch (err) {
                if (i === attempts - 1) throw err;
                console.warn(`Retrying fetch from GitHub after failure... (${i + 1}/${attempts})`, err);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }

        return undefined;
    }

    /**
     * Handles the full bulk import process:
     * - Prepares compendiums (unlock/delete)
     * - Loads data from ZIP or GitHub
     * - Processes each importer in order
     * - Updates UI progress
     * - Finalizes and notifies
     */
    async handleBulkImport() {
        BulkImporter.isImporting = true;
        const start = performance.now();

        // Unlock all world compendiums for editing
        for (const [, compendium] of Object.entries(Constants.MAP_COMPENDIUM_CONFIG))
            await game.packs.get("world." + compendium.pack)?.configure({ locked: false });

        // Optionally delete existing compendiums
        if (BulkImporter.deleteCompendiums)
            for (const [, compendium] of Object.entries(Constants.MAP_COMPENDIUM_CONFIG))
                await game.packs.get("world." + compendium.pack)?.deleteCompendium();

        // Load ZIP file if provided
        const ZIP = BulkImporter.zipFile ? await (new JSZip()).loadAsync(BulkImporter.zipFile) : null;

        // Configure shared importer settings
        DataImporter.setIcons = BulkImporter.setIcons;
        DataImporter.overrideDocuments = BulkImporter.overrideDocuments;
        DataImporter.iconList = await IconAssign.getIconFiles();

        // Set total progress count
        BulkImporter.progress.total = BulkImporter.Importers.length;
        await this.render();

        // Process each importer
        for (const importer of BulkImporter.Importers) {
            for (const fileName of importer.files) {
                BulkImporter.progress.message = `Importing: ${importer.constructor.name} ${fileName}`;
                await this.render();

                try {
                    const fetchStart = performance.now();

                    // Load file: from ZIP or GitHub
                    const file = ZIP
                        ? await ZIP.file(fileName)?.async("string")
                        : await BulkImporter.fetchGitHubFile(`Chummer/data/${fileName}`);

                    if (file === undefined)
                        throw new Error(`File ${fileName} not found`);

                    await importer.parse(file);

                    const duration = performance.now() - fetchStart;
                    console.debug(`Importing ${fileName} took ${duration.toFixed(2)} ms`);
                } catch (error) {
                    console.error(`Error importing ${fileName}:`, error);
                    ui.notifications.error(`Error importing ${fileName}`);
                }

                BulkImporter.progress.idx++;
                await this.render();
            }
        }

        // Re-lock all compendiums
        for (const [, compendium] of Object.entries(Constants.MAP_COMPENDIUM_CONFIG))
            await game.packs.get("world." + compendium.pack)?.configure({ locked: true });

        // Finalize and notify
        ui.notifications?.warn("SR5.Warnings.BulkImportPerformanceWarning", { localize: true });
        BulkImporter.isImporting = false;
        BulkImporter.importDone = true;
        await this.render();

        console.debug(`Bulk import time: ${(performance.now() - start).toFixed(2)} ms`);
    }

    /**
     * Sets up event listeners for UI controls after rendering.
     */
    protected override async _onRender(
        ...[context, options]: Parameters<AppV2["_onRender"]>
    ): Promise<void> {
        await super._onRender(context, options);

        // Checkbox: Assign icons
        const setIcon = this.element.querySelector<HTMLSelectElement>("#setIcon");
        setIcon?.addEventListener("change", (event) => {
            BulkImporter.setIcons = (event.currentTarget as HTMLInputElement).checked;
        });

        // Checkbox: Delete compendiums before import
        const deleteCompendiums = this.element.querySelector<HTMLSelectElement>("#deleteCompendiums");
        deleteCompendiums?.addEventListener("change", (event) => {
            BulkImporter.deleteCompendiums = (event.currentTarget as HTMLInputElement).checked;
        });

        // Checkbox: Override existing documents
        const overrideDocuments = this.element.querySelector<HTMLSelectElement>("#overrideDocuments");
        overrideDocuments?.addEventListener("change", (event) => {
            BulkImporter.overrideDocuments = (event.currentTarget as HTMLInputElement).checked;
        });

        // File input: Load ZIP file
        const zipFileInput = this.element.querySelector<HTMLInputElement>("#zipFileInput");
        zipFileInput?.addEventListener("change", (event) => {
            const input = event.currentTarget as HTMLInputElement;
            BulkImporter.zipFile = input.files?.[0] ?? null;
            void this.render();
        });

        // Button: Start import
        const importBtn = this.element.querySelector<HTMLButtonElement>("#importBtn");
        importBtn?.addEventListener("click", () => { void this.handleBulkImport();});

        // Button: Reset import state
        const resetImport = this.element.querySelector<HTMLButtonElement>("#resetImport");
        resetImport?.addEventListener("click", () => {
            BulkImporter.progress = { idx: 0, total: 0, message: "" };
            BulkImporter.importDone = false;
            BulkImporter.zipFile = null;
            void this.render();
        });
    }
}
