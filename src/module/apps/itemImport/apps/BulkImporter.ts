import JSZip from "jszip";
import { Constants, ChummerFile } from "../importer/Constants";
import { ImportHelper } from "../helper/ImportHelper";
import { SYSTEM_NAME, FLAGS } from "@/module/constants";

import { ActionImporter } from "../importer/ActionImporter";
import { AdeptPowerImporter } from "../importer/AdeptPowerImporter";
import { ArmorImporter } from "../importer/ArmorImporter";
import { ArmorModImporter } from "../importer/ArmorModImporter";
import { ComplexFormImporter } from "../importer/ComplexFormImporter";
import { CritterImporter } from "../importer/CritterImporter";
import { CritterPowerImporter } from "../importer/CritterPowerImporter";
import { DataImporter } from "../importer/DataImporter";
import { EchoesImporter } from "../importer/EchoesImporter";
import { GearImporter } from "../importer/GearImporter";
import { QualityImporter } from "../importer/QualityImporter";
import { SkillImporter } from "../importer/SkillImporter";
import { SpellImporter } from "../importer/SpellImporter";
import { VehicleImporter } from "../importer/VehicleImporter";
import { VehicleModImporter } from "../importer/VehicleModImporter";
import { WareImporter } from "../importer/WareImporter";
import { WareModImporter } from "../importer/WareModImporter";
import { WeaponImporter } from "../importer/WeaponImporter";
import { WeaponModImporter } from "../importer/WeaponModImporter";

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
        pct: string;
    };

    // Info
    info: {
        version: string;
        versionLink: string;
    };
};

const BaseClass = HandlebarsApplicationMixin(ApplicationV2<ImporterContext>);
type BaseClassType = InstanceType<typeof BaseClass>;

/**
 * This application allows bulk importing of Shadowrun 5e game data from either
 * a local ZIP file (Chummer output) or directly from the chummer5a GitHub repository.
 *
 * Import various types of game data (weapons, spells, gear, etc.)
 */
export class BulkImporter extends BaseClass {
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
            icon: "fas fa-file-import",
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
        return game.i18n.localize("SR5.Import.BulkImporter.Title");
    }

    /**
     * GitHub repository configuration used to fetch data files.
     * Points to a specific commit (branch hash) for reproducibility.
     */
    private static readonly githubConfig = {
        owner: "chummer5a",
        repo: "chummer5a",
        version: "v5.226.91",
        branch: "8544ecee1ad3edccc0853b7821067542130a5c68",
    } as const;

    static readonly SUPPORTED_LANGUAGES = [
        { value: "en-us", label: "English" },
        { value: "de-de", label: "Deutsch (German)" },
        { value: "fr-fr", label: "Français (French)" },
        { value: "pt-br", label: "Português (Portuguese)" },
        { value: "ja-jp", label: "日本語 (Japanese)" },
        { value: "zh-cn", label: "简体中文 (Chinese)" }
    ] as const;

    /**
     * UI and import behavior flags.
     */
    private static overrideDocuments = true;
    private static deleteCompendiums = false;
    private static selectedLanguage = "";
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
        new WareModImporter(),
        new WareImporter(),
        new QualityImporter(),
        new CritterPowerImporter(),
        new SkillImporter(),
        new CritterImporter(),
        new EchoesImporter(),
        new AdeptPowerImporter(),
        new ArmorModImporter(),
        new ArmorImporter(),
        new ActionImporter(),
    ] as const satisfies readonly DataImporter[];

    /**
     * Prepares the context data for rendering the template.
     */
    override async _prepareContext(...args: Parameters<BaseClassType["_prepareContext"]>) {
        // Start with the base context from the parent class
        const baseContext = await super._prepareContext(...args);

        // Destructure GitHub config for cleaner access
        const { owner, repo, branch, version } = BulkImporter.githubConfig;

        if (!BulkImporter.selectedLanguage) {
            const locale = game.i18n.lang.toLowerCase();
            if (locale === "de" || locale.startsWith("de-")) {
                BulkImporter.selectedLanguage = "de-de";
            } else if (locale === "fr" || locale.startsWith("fr-")) {
                BulkImporter.selectedLanguage = "fr-fr";
            } else if (locale === "pt" || locale.startsWith("pt-")) {
                BulkImporter.selectedLanguage = "pt-br";
            } else if (locale === "ja" || locale.startsWith("ja-")) {
                BulkImporter.selectedLanguage = "ja-jp";
            } else if (locale === "zh" || locale.startsWith("zh-")) {
                BulkImporter.selectedLanguage = "zh-cn";
            } else {
                BulkImporter.selectedLanguage = "en-us";
            }
        }

        const languages = BulkImporter.SUPPORTED_LANGUAGES.map(lang => ({
            ...lang,
            selected: lang.value === BulkImporter.selectedLanguage
        }));

        return {
            ...baseContext,

            // UI and import state
            progress: {
                message: BulkImporter.progress.message,
                pct: (BulkImporter.progress.idx / BulkImporter.progress.total * 100).toFixed(0),
            },
            importDone: BulkImporter.importDone,
            isImporting: BulkImporter.isImporting,
            zipFileName: BulkImporter.zipFile?.name,
            deleteCompendiums: BulkImporter.deleteCompendiums,
            overrideDocuments: BulkImporter.overrideDocuments,
            languages,

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

        try {
            // Unlock all world compendiums for editing
            for (const compendium of Object.values(Constants.MAP_COMPENDIUM_CONFIG))
                await game.packs.get("world." + compendium.pack)?.configure({ locked: false });

            // Optionally delete existing compendiums
            if (BulkImporter.deleteCompendiums)
                for (const compendium of Object.values(Constants.MAP_COMPENDIUM_CONFIG))
                    await game.packs.get("world." + compendium.pack)?.deleteCompendium();

            // Load ZIP file if provided
            const ZIP = BulkImporter.zipFile ? await (new JSZip()).loadAsync(BulkImporter.zipFile) : null;

            ImportHelper.translationMap = { global: {}, files: {} };

            const langCode = BulkImporter.selectedLanguage || "en-us";
            ImportHelper.isTranslationEnabled = (langCode !== "en-us");

            // Only fetch/load translations if the selected language is not English
            if (langCode !== "en-us") {
                const langFile = `${langCode}.xml`;
                let langXml: string | undefined;
                if (ZIP) {
                    langXml = await ZIP.file(`lang/${langFile}`)?.async("string");
                } else {
                    try {
                        langXml = await BulkImporter.fetchGitHubFile(`Chummer/lang/${langFile}`);
                    } catch (e) {
                        console.error(`Failed to fetch language file ${langFile} from GitHub:`, e);
                    }
                }

                if (langXml) {
                    try {
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(langXml, "text/xml");
                        const stringNodes = xmlDoc.getElementsByTagName("string");
                        for (const node of stringNodes) {
                            const key = node.getElementsByTagName("key")[0]?.textContent;
                            const text = node.getElementsByTagName("text")[0]?.textContent;
                            if (key && text) {
                                ImportHelper.translationMap.global[key] = text;
                            }
                        }
                        console.log(`Loaded ${Object.keys(ImportHelper.translationMap.global).length} translations from Chummer ${langFile}`);
                    } catch (e) {
                        console.error(`Failed to parse language XML:`, e);
                    }
                }

                const dataLangFile = `${langCode}_data.xml`;
                let dataLangXml: string | undefined;
                if (ZIP) {
                    dataLangXml = await ZIP.file(`lang/${dataLangFile}`)?.async("string");
                } else {
                    try {
                        dataLangXml = await BulkImporter.fetchGitHubFile(`Chummer/lang/${dataLangFile}`);
                    } catch (e) {
                        console.debug(`No data language file ${dataLangFile} found on GitHub or it failed to fetch:`, e);
                    }
                }

                if (dataLangXml) {
                    try {
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(dataLangXml, "text/xml");
                        const chummerSections = xmlDoc.getElementsByTagName("chummer");
                        let dataKeysCount = 0;

                        for (const section of chummerSections) {
                            const fileName = section.getAttribute("file");
                            if (!fileName) continue;

                            ImportHelper.translationMap.files[fileName] ??= { names: {}, ids: {} };

                            // Find all <name> tags inside this section
                            const nameNodes = section.getElementsByTagName("name");
                            for (const nameNode of nameNodes) {
                                const parent = nameNode.parentElement;
                                if (parent) {
                                    const translateNode = parent.getElementsByTagName("translate")[0];
                                    if (translateNode) {
                                        const key = nameNode.textContent?.trim();
                                        const text = translateNode.textContent?.trim();
                                        if (key && text) {
                                            ImportHelper.translationMap.files[fileName].names[key] = text;
                                            const idNode = parent.getElementsByTagName("id")[0];
                                            const id = idNode?.textContent?.trim();
                                            if (id) {
                                                ImportHelper.translationMap.files[fileName].ids[id] = text;
                                            }
                                            dataKeysCount++;
                                        }
                                    }
                                }
                            }

                            // Populate categoryMap for this file
                            const fileKey = fileName.replace(".xml", "") as ChummerFile;
                            const categoryNodes = section.getElementsByTagName("category");
                            for (const node of categoryNodes) {
                                const translateAttr = node.getAttribute("translate");
                                const key = node.textContent?.trim();
                                if (key && translateAttr) {
                                    ImportHelper.categoryMap[fileKey] ??= {};
                                    ImportHelper.categoryMap[fileKey][key] = translateAttr;
                                    dataKeysCount++;
                                }
                            }
                        }
                        console.log(`Loaded ${dataKeysCount} additional data translations from ${dataLangFile}`);
                    } catch (e) {
                        console.error(`Failed to parse data language XML:`, e);
                    }
                }
            }

            // Configure shared importer settings
            DataImporter.overrideDocuments = BulkImporter.overrideDocuments;

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

                        try {
                            ImportHelper.currentFile = fileName;
                            await importer.parse(file);
                        } finally {
                            ImportHelper.currentFile = null;
                        }

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

            // Lock all compendiums and update compendium order
            const compendiumList = new Set(game.settings.get(SYSTEM_NAME, FLAGS.ImporterCompendiumOrder));
            for (const { pack } of Object.values(Constants.MAP_COMPENDIUM_CONFIG)) {
                // Lock compendium
                await game.packs.get(`world.${pack}`)?.configure({ locked: true });

                // Add to compendium order if not present
                compendiumList.add(`world.${pack}`);
            }

            await game.settings.set(SYSTEM_NAME, FLAGS.ImporterCompendiumOrder, Array.from(compendiumList));

            // Finalize and notify
            ui.notifications?.warn("SR5.Warnings.BulkImportPerformanceWarning", { localize: true });
            BulkImporter.importDone = true;
        } catch (error) {
            console.error("Bulk import failed:", error);
            ui.notifications?.error("Bulk import failed. Check console for details.");
        } finally {
            // Lock all compendiums as a fallback safety measure
            for (const { pack } of Object.values(Constants.MAP_COMPENDIUM_CONFIG)) {
                try {
                    await game.packs.get(`world.${pack}`)?.configure({ locked: true });
                } catch (e) {
                    console.error(`Failed to lock pack ${pack} in finally block:`, e);
                }
            }

            BulkImporter.isImporting = false;
            await this.render();

            // Clear ImportHelper caches
            ImportHelper.folders = {};
            ImportHelper.categoryMap = {};
            ImportHelper.nameToId = {};
            ImportHelper.idToName = {};
            ImportHelper.translationMap = { global: {}, files: {} };
            ImportHelper.currentFile = null;
            ImportHelper.isTranslationEnabled = false;

            console.debug(`Bulk import time: ${(performance.now() - start).toFixed(2)} ms`);
        }
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

        // Select: selectedLanguage
        const selectedLanguage = this.element.querySelector<HTMLSelectElement>("#selectedLanguage");
        selectedLanguage?.addEventListener("change", (event) => {
            BulkImporter.selectedLanguage = (event.currentTarget as HTMLSelectElement).value;
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
