import { AdeptPowerImporter } from '../importer/AdeptPowerImporter';
import { ArmorImporter } from '../importer/ArmorImporter';
import { ComplexFormImporter } from '../importer/ComplexFormImporter';
import { CritterImporter } from '../importer/CritterImporter';
import { CritterPowerImporter } from '../importer/CritterPowerImporter';
import { DataImporter } from '../importer/DataImporter';
import { EchoesImporter } from '../importer/EchoesImporter';
import { GearImporter } from '../importer/GearImporter';
import { QualityImporter } from '../importer/QualityImporter';
import { SpellImporter } from '../importer/SpellImporter';
import { VehicleImporter } from '../importer/VehicleImporter';
import { VehicleModImporter } from '../importer/VehicleModImporter';
import { WareImporter } from '../importer/WareImporter';
import { WeaponImporter } from '../importer/WeaponImporter';
import { WeaponModImporter } from '../importer/WeaponModImporter';
import { Constants } from '../importer/Constants';
import * as IconAssign from  '../../iconAssigner/iconAssign';
import JSZip from 'jszip';

export class Import extends foundry.appv1.api.Application {
    // Update Schemas in util/generate_schemas.py
    private readonly githubConfig = {
        owner: "chummer5a",
        repo: "chummer5a",
        version: "v5.225.937",
        branch: "fb3bd44a2bfa68d015faf7831b2c8de565acb60d",
    } as const;

    private currentParsedFile: string = "";
    private parsedFiles: string[] = [];
    private supportedDataFiles: string[] = [];

    private icons: boolean = true;
    private deleteCompendiums: boolean = false;
    private disableImportButton: boolean = false;

    private ZIP: JSZip | null = null;
    private zipFile: File | null = null;
    private showImportOptions: boolean = false;

    private readonly shadowrunBooks = Constants.shadowrunBooks.map(book => ({ ...book, value: book.default }));

    constructor() {
        super();
        this.collectDataImporterFileSupport();
    }

    static override get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'chummer-data-import';
        options.classes = ['app', 'window-app', 'filepicker'];
        options.title = 'Chummer/Data Import';
        options.template = 'systems/shadowrun5e/dist/templates/apps/compendium-import.hbs';
        options.width = 600;
        options.height = 'auto';
        return options;
    }

    override getData(options?: any) {
        const data = super.getData(options) as any;

        data.dataFiles = {};
        this.supportedDataFiles.forEach((supportedFileName: string) => {
            const missing = !false;
            const parsed = this.parsedFiles.some((parsedFileName) => supportedFileName === parsedFileName);
            const parsing = supportedFileName === this.currentParsedFile;

            data.dataFiles[supportedFileName] = {
                name: supportedFileName,
                missing,
                parsed,
                parsing
            };
        });

        data.icons = this.icons;
        data.deleteCompendiums = this.deleteCompendiums;
        data.showImportOptions = this.showImportOptions;
        data.disableImportButton = this.disableImportButton;
        data.finishedOverallParsing = this.supportedDataFiles.length === this.parsedFiles.length;
        data.zipFileName = this.zipFile?.name;

        if (!data.finishedOverallParsing) {
            data.currentParsedFile = this.currentParsedFile?.replace(/\.xml$/i, '').capitalize() || '';
            data.filesImported = " (" + (this.parsedFiles.length + 1) + "/" + this.supportedDataFiles.length + ")";
        }

        const {owner, repo, branch, version} = this.githubConfig;
        data.info = {
            version,
            versionLink: `https://www.github.com/${owner}/${repo}/tree/${branch}/Chummer/data`
        };

        return { ...data, shadowrunBooks: this.shadowrunBooks };
    }

    private collectDataImporterFileSupport() {
        this.supportedDataFiles = [];
        Import.Importers.forEach(importer => {
            if (this.supportedDataFiles.some(supported => importer.files.includes(supported))) {
                return;
            }
            this.supportedDataFiles = this.supportedDataFiles.concat(importer.files);
        });
    }

    //Order is important, ex. some weapons need mods to fully import, or it might take longer to import.
    static Importers: DataImporter[] = [
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
    ];

    /**
     * Parse a single file with all applicable importers.
     * 
     * A file can contain actors and item documents, as well as both in a single file.
     * 
     * @param xmlSource The XML source as string.
     * @param fileName The XML file name. Only imported supporting this file will be considered.
     * @param setIcons Wether or not to apply system icons to the imported documents.
     */
    async parseXML(xmlSource: string, fileName: string) {
        const start = performance.now();
        const jsonSource = await DataImporter.xml2json(xmlSource);

        // Apply Item Importers based on file and their ability to parse that file.
        for (const di of Import.Importers.filter(importer => importer.files.includes(fileName)))
            if (di.CanParse(jsonSource))
                await di.Parse(jsonSource);

        const end = performance.now();
        console.log(fileName, end - start, "ms");
    }

    isDataFile = (file: File): boolean => {
        return this.supportedDataFiles.some((supported) => supported === file.name);
    };

    isLangDataFile = (file: File): boolean => {
        const pattern = /[a-zA-Z]{2}-[a-zA-Z]{2}_data\.xml/;
        return file.name.match(pattern) !== null;
    };

    async fetchGitHubFile(path: string): Promise<string> {
        const { owner, repo, branch } = this.githubConfig;
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

        const attempts = 3;
        const delayMs = 2000;

        for (let i = 0; i < attempts; i++) {
            try {
                const response = await fetch(apiUrl, {
                    headers: {
                        'Accept': 'application/vnd.github.v3.raw'
                    }
                });

                if (!response.ok)
                    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);

                return response.text();
            } catch (err) {
                if (i === attempts - 1) throw err;
                console.warn(`Retrying fetch from git after failure... (${i + 1}/${attempts})`, err);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }

        throw new Error(`fetchGitHubFile failed after ${attempts} attempts`);
    }

    async handleBulkImport(
        isOnline: boolean,
        setIcons: boolean,
        deleteCompendiums: boolean,
        getTextForFile: (fileName: string) => Promise<string | undefined>
    ) {
        for (const [, compendium] of Object.entries(Constants.MAP_COMPENDIUM_CONFIG))
                await game.packs.get("world." + compendium.pack)?.configure({locked: false});

        if (deleteCompendiums)
            for (const [, compendium] of Object.entries(Constants.MAP_COMPENDIUM_CONFIG))
                await game.packs.get("world." + compendium.pack)?.deleteCompendium();

        if (!isOnline)
            this.ZIP = await (new JSZip()).loadAsync(this.zipFile!);

        this.parsedFiles = [];

        DataImporter.setIcons = setIcons;
        DataImporter.supportedBooks = this.shadowrunBooks.filter(book => book.value).map(book => book.code);
        DataImporter.iconList = await IconAssign.getIconFiles();

        this.disableImportButton = true;
        this.render();

        for (const fileName of this.supportedDataFiles) {
            try {
                const text = await getTextForFile(fileName);
                if (text === undefined)
                    throw new Error(`File ${fileName} not found!`);

                this.currentParsedFile = fileName;
                this.render();

                await this.parseXML(text, fileName);

                if (!this.parsedFiles.includes(fileName))
                    this.parsedFiles.push(fileName);

                this.render();
            } catch (err) {
                console.error(err);
                ui.notifications?.error(`Failed to import ${fileName}`);
            }
        }

        this.disableImportButton = false;
        this.render();

        for (const [, compendium] of Object.entries(Constants.MAP_COMPENDIUM_CONFIG))
            await game.packs.get("world." + compendium.pack)?.configure({locked: true});

        ui.notifications?.warn('SR5.Warnings.BulkImportPerformanceWarning', { localize: true });
    }

    override activateListeners(html: JQuery<HTMLElement>) {
        // --- Quick Import from GitHub ---
        html.find('#quickImportBtn').on('click', () => {
            const start = performance.now();
            const setIcons = html.find('.setIcons').is(':checked');
            const deleteCompendiums = html.find('.deleteCompendiums').is(':checked');

            const getTextForFile = async (name: string) => {
                return this.fetchGitHubFile(`Chummer/data/${name}`);
            };

            void this.handleBulkImport(true, setIcons, deleteCompendiums, getTextForFile)
                .then(() => {
                    console.log(`Quick import time: ${(performance.now() - start).toFixed(2)} ms`);
                });
        });

        // --- Manual Import from ZIP file ---
        html.find('#advanceImportBtn').on('click', () => {
            const start = performance.now();
            const setIcons = html.find('.setIcons').is(':checked');
            const deleteCompendiums = html.find('.deleteCompendiums').is(':checked');

            const getTextForFile = async (name: string) => {
                return this.ZIP?.file(name)?.async('string');
            };

            void this.handleBulkImport(false, setIcons, deleteCompendiums, getTextForFile)
                .then(() => {
                    console.log(`Manual import time: ${(performance.now() - start).toFixed(2)} ms`);
                });
        });

        // --- ZIP File Input Handler ---
        html.find('#zipFileInput').on('change', (event: JQuery.TriggeredEvent) => {
            const input = event.target as HTMLInputElement;
            this.zipFile = input.files?.[0] ?? null;
            this.render();
        });

        // --- Settings Modal Listeners ---
        html.find('.importOptionsBtn').on('click', () => {
            this.showImportOptions = true;
            this.render();
        });

        html.find('.closeOptionsBtn').on('click', () => {
            this.showImportOptions = false;
            this.render();
        });
        
        html.find('.setIcons').on('click', (event: JQuery.TriggeredEvent) => {
            this.icons = (event.currentTarget as HTMLInputElement).checked;
        });

        html.find('.deleteCompendiums').on('click', (event: JQuery.TriggeredEvent) => {
            this.deleteCompendiums = (event.currentTarget as HTMLInputElement).checked;
        });

        html.find('.bookOption').on('click', (event: JQuery.TriggeredEvent) => {
            const checkbox = event.currentTarget as HTMLInputElement;
            const bookCode = checkbox.dataset.book;
            const book = this.shadowrunBooks.find(b => b.code === bookCode);
            if (book) book.value = checkbox.checked;
        });

        html.find('.bookSelectAllBtn').on('click', () => {
            this.shadowrunBooks.forEach(book => { book.value = true; });
            this.render();
        });

        html.find('.bookUnselectAllBtn').on('click', () => {
            this.shadowrunBooks.forEach(book => { book.value = false; });
            this.render();
        });

        html.find('.bookDefaultsBtn').on('click', () => {
            this.shadowrunBooks.forEach(book => { book.value = book.default; });
            this.render();
        });
    }
}
