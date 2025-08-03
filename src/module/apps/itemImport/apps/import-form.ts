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
import { TranslationHelper } from '../helper/TranslationHelper';
import { VehicleImporter } from '../importer/VehicleImporter';
import { VehicleModImporter } from '../importer/VehicleModImporter';
import { WareImporter } from '../importer/WareImporter';
import { WeaponImporter } from '../importer/WeaponImporter';
import { WeaponModImporter } from '../importer/WeaponModImporter';
import { Constants } from '../importer/Constants';
import * as IconAssign from  '../../iconAssigner/iconAssign';

export class Import extends Application {
    // Update Schemas in util/generate_schemas.py
    private readonly githubConfig = {
        owner: "chummer5a",
        repo: "chummer5a",
        version: "v5.225.937",
        branch: "fb3bd44a2bfa68d015faf7831b2c8de565acb60d",
    } as const;

    private currentParsedFile: string;
    private dataFiles: File[] = [];
    private parsedFiles: string[] = [];
    private supportedDataFiles: string[] = [];

    private langDataFile: File;
    private selectedLanguage: string = "";

    private icons: boolean = true;
    private deleteCompendiums: boolean = false;
    private disableImportButton: boolean = false;

    private showAdvanced: boolean = false;
    private showImportOptions: boolean = false;

    private readonly shadowrunBooks = [
        { name: "Aetherology", code: "AET", default: true, value: true },
        { name: "Assassin's Primer", code: "AP", default: true, value: true },
        { name: "Better Than Bad", code: "BTB", default: true, value: true },
        { name: "Bloody Business", code: "BLB", default: true, value: true },
        { name: "Book of the Lost", code: "BOTL", default: true, value: true },
        { name: "Bullets & Bandages", code: "BB", default: true, value: true },
        { name: "Chrome Flesh", code: "CF", default: true, value: true },
        { name: "Cutting Aces", code: "CA", default: true, value: true },
        { name: "Dark Terrors", code: "DTR", default: true, value: true },
        { name: "Data Trails", code: "DT", default: true, value: true },
        { name: "Data Trails (Dissonant Echoes)", code: "DTD", default: false, value: false },
        { name: "Datapuls SOTA 2080 (German-exclusive)", code: "SOTG", default: false, value: false },
        { name: "Datapuls Verschlusssache (German-exclusive)", code: "DPVG", default: false, value: false },
        { name: "Forbidden Arcana", code: "FA", default: true, value: true },
        { name: "Grimmes Erwachen (German-exclusive)", code: "GE", default: false, value: false },
        { name: "Gun Heaven 3", code: "GH3", default: true, value: true },
        { name: "Hamburg (German-exclusive)", code: "HAMG", default: false, value: false },
        { name: "Hard Targets", code: "HT", default: true, value: true },
        { name: "Hong Kong Sourcebook", code: "HKS", default: false, value: false },
        { name: "Howling Shadows", code: "HS", default: true, value: true },
        { name: "Kill Code", code: "KC", default: true, value: true },
        { name: "Krime Katalog", code: "KK", default: true, value: true },
        { name: "Lockdown", code: "LCD", default: true, value: true },
        { name: "No Future", code: "NF", default: true, value: true },
        { name: "Nothing Personal", code: "NP", default: true, value: true },
        { name: "Rigger 5.0", code: "R5", default: true, value: true },
        { name: "Run Faster", code: "RF", default: true, value: true },
        { name: "Run and Gun", code: "RG", default: true, value: true },
        { name: "Sail Away, Sweet Sister", code: "SASS", default: true, value: true },
        { name: "Schattenhandbuch (German Handbook)", code: "SHB", default: false, value: false },
        { name: "Schattenhandbuch 2 (German Handbook)", code: "SHB2", default: false, value: false },
        { name: "Schattenhandbuch 3 (German Handbook)", code: "SHB3", default: false, value: false },
        { name: "Shadow Spells", code: "SSP", default: true, value: true },
        { name: "Shadowrun 2050 (5th Edition)", code: "2050", default: false, value: false },
        { name: "Shadowrun 5th Edition", code: "SR5", default: true, value: true },
        { name: "Shadowrun Missions 0803: 10 Block Tango", code: "SRM0803", default: true, value: true },
        { name: "Shadowrun Missions 0804: Dirty Laundry", code: "SRM0804", default: true, value: true },
        { name: "Shadowrun Quick-Start Rules", code: "QSR", default: true, value: true },
        { name: "Shadows In Focus: Butte", code: "SFB", default: true, value: true },
        { name: "Shadows In Focus: Metropole", code: "SFME", default: true, value: true },
        { name: "Shadows In Focus: San Francisco Metroplex", code: "SFM", default: true, value: true },
        { name: "Shadows In Focus: Sioux Nation: Counting Coup", code: "SFCC", default: true, value: true },
        { name: "Splintered State", code: "SPS", default: true, value: true },
        { name: "Sprawl Wilds", code: "SW", default: true, value: true },
        { name: "State of the Art ADL (German Handbook)", code: "SAG", default: false, value: false },
        { name: "Stolen Souls", code: "SS", default: true, value: true },
        { name: "Street Grimoire", code: "SG", default: true, value: true },
        { name: "Street Grimoire Errata", code: "SGE", default: true, value: true },
        { name: "Street Lethal", code: "SL", default: true, value: true },
        { name: "The Complete Trog", code: "TCT", default: true, value: true },
        { name: "The Seattle Gambit", code: "TSG", default: true, value: true },
        { name: "The Vladivostok Gauntlet", code: "TVG", default: true, value: true }
    ];

    constructor() {
        super();

        this.collectDataImporterFileSupport();
    }

    static override get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'chummer-data-import';
        options.classes = ['app', 'window-app', 'filepicker'];
        options.title = 'Chummer/Data Import';
        options.template = 'systems/shadowrun5e/dist/templates/apps/compendium-import.html';
        options.width = 600;
        options.height = 'auto';
        return options;
    }

    override getData(options?: any) {
        const data = super.getData(options) as any;

        data.dataFiles = {};
        this.supportedDataFiles.forEach((supportedFileName: string) => {
            const missing = !this.dataFiles.some((dataFile) => supportedFileName === dataFile.name);
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
        data.showAdvanced = this.showAdvanced;
        data.selectedLanguage = this.selectedLanguage;
        data.deleteCompendiums = this.deleteCompendiums;
        data.showImportOptions = this.showImportOptions;
        data.disableImportButton = this.disableImportButton;
        data.langDataFile = this.langDataFile ? this.langDataFile.name : '';
        data.finishedOverallParsing = this.supportedDataFiles.length === this.parsedFiles.length;

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

    async parseXmli18n(xmlSource: string) {
        if (!xmlSource) return;

        const jsonSource = await DataImporter.xml2json(xmlSource);
        TranslationHelper.ParseTranslation(jsonSource);
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

                return await response.text();
            } catch (err) {
                if (i === attempts - 1) throw err;
                console.warn(`Retrying fetch from git after failure... (${i + 1}/${attempts})`, err);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }

        throw new Error(`fetchGitHubFile failed after ${attempts} attempts`);
    }

    async handleBulkImport(
        setIcons: boolean,
        deleteCompendiums: boolean,
        languageText: string | undefined,
        getTextForFile: (param: any) => Promise<{ text: string; name: string; } | null>
    ) {
        if (deleteCompendiums)
            for (const [_, compendium] of Object.entries(Constants.MAP_COMPENDIUM_CONFIG))
                await game.packs?.get(compendium.pack)?.deleteCompendium();

        this.parsedFiles = [];

        DataImporter.setIcons = setIcons;
        DataImporter.supportedBooks = this.shadowrunBooks
        .filter((book) => book.value).map((book) => book.code);
        DataImporter.iconList = await IconAssign.getIconFiles();

        this.disableImportButton = true;
        await this.render();

        // Parse language if available
        if (languageText) {
            try {
                await this.parseXmli18n(languageText);
            } catch (err) {
                ui.notifications?.warn(`Failed to parse language text`);
            }
        }

        for (const fileName of this.supportedDataFiles) {
            try {
                const result = await getTextForFile(fileName);
                if (!result) continue;
                const { text, name } = result;
                if (!text) continue;

                this.currentParsedFile = name;
                await this.render();

                await this.parseXML(text, name);

                if (!this.parsedFiles.includes(name))
                    this.parsedFiles.push(name);

                await this.render();
            } catch (err) {
                console.error(`Error importing ${fileName}:`, err);
                ui.notifications?.error(`Failed to import ${fileName}`);
            }
        }

        this.disableImportButton = false;
        await this.render();

        ui.notifications?.warn('SR5.Warnings.BulkImportPerformanceWarning', { localize: true });
    }

    override activateListeners(html: JQuery<HTMLElement>) {
        html.find('#quickImportBtn').on('click', async () => {
            const start = performance.now();

            const setIcons = $('.setIcons').is(':checked');
            const deleteCompendiums = $('.deleteCompendiums').is(':checked');

            const languageText = this.selectedLanguage 
                ? await this.fetchGitHubFile(`Chummer/lang/${this.selectedLanguage}`) 
                : undefined;

            const getTextForFile = async (fileName: string) => {
                const text = await this.fetchGitHubFile(`Chummer/data/${fileName}`);
                return { text, name: fileName };
            };

            await this.handleBulkImport(setIcons, deleteCompendiums, languageText, getTextForFile);
            console.log(`Time used: ${(performance.now() - start).toFixed(2)} ms`);
        });

        html.find('#advanceImportBtn').on('click', async () => {
            const start = performance.now();

            const setIcons = $('.setIcons').is(':checked');
            const deleteCompendiums = $('.deleteCompendiums').is(':checked');

            const languageText = this.langDataFile
                ? await this.langDataFile.text()
                : undefined;
            
            const getTextForFile = async (fileName: string) => {
                const file = this.dataFiles.find(f => f.name === fileName);
                if (!file) return null;
                const text = await file.text();
                return { text, name: file.name };
            };

            await this.handleBulkImport(setIcons, deleteCompendiums, languageText, getTextForFile);
            console.log(`Time used: ${(performance.now() - start).toFixed(2)} ms`);
        });

        html.find("input[type='file'].langDataFileDrop").on('change', async (event: JQuery.ChangeEvent<HTMLInputElement>) => {
            Array.from(event.target.files).forEach((file: File) => {
                if (this.isLangDataFile(file))
                    this.langDataFile = file;
            });
            await this.render();
        });

        html.find("input[type='file'].filedatadrop").on('change', async (event: JQuery.ChangeEvent<HTMLInputElement>) => {
            Array.from(event.target.files).forEach((file: File) => {
                if (this.isDataFile(file)) {
                    // Allow user to overwrite an already added file, they have their reasons.
                    const existingIdx = this.dataFiles.findIndex((dataFile) => dataFile.name === file.name);
                    if (existingIdx === -1)
                        this.dataFiles.push(file);
                    else
                        this.dataFiles[existingIdx] = file;
                }
            });

            if (this.dataFiles.length > 0) {
                this.disableImportButton = false;
            }

            await this.render();
        });

        html.find('.setIcons').on('click', () => {
            this.icons = !this.icons;
        });

        html.find('.deleteCompendiums').on('click', () => {
            this.deleteCompendiums = !this.deleteCompendiums;
        });

        html.find('.toggleAdvancedBtn').on('click', async () => {
            this.showAdvanced = !this.showAdvanced;
            await this.render();
        });

        html.find('.deleteFileBtn').on('click', async (event) => {
            const name = event.currentTarget.getAttribute('data-name');
            if (!name) return;

            this.dataFiles = this.dataFiles.filter(file => file.name !== name);

            await this.render();
        });

        html.find('.importOptionsBtn').on('click', async () => {
            this.showImportOptions = true;
            await this.render();
        });

        html.find('.closeOptionsBtn').on('click', async () => {
            this.showImportOptions = false;
            await this.render();
        });

        html.find('.bookOption').on('click', (event: JQuery.ClickEvent<HTMLInputElement>) => {
            const checkbox = event.currentTarget;
            const bookCode = checkbox.dataset.book;
            const isChecked = checkbox.checked;

            const book = this.shadowrunBooks.find(b => b.code === bookCode);
            if (book)
                book.value = isChecked;
        });

        html.find('#languageSelect').on('change', (event: JQuery.ChangeEvent<HTMLSelectElement>) => {
            this.selectedLanguage = event.currentTarget.value;
        });

        html.find('.bookSelectAllBtn').on('click', async () => {
            this.shadowrunBooks.forEach(book => book.value = true);
            await this.render();
        });

        html.find('.bookUnselectAllBtn').on('click', async () => {
            this.shadowrunBooks.forEach(book => book.value = false);
            await this.render();
        });

        html.find('.bookDefaultsBtn').on('click', async () => {
            this.shadowrunBooks.forEach(book => book.value = book.default);
            await this.render();
        });
    }
}
