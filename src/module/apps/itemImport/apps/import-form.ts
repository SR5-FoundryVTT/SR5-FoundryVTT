import { ProgramImporter } from './../importer/ProgramImporter';
import { WeaponImporter } from '../importer/WeaponImporter';
import { ArmorImporter } from '../importer/ArmorImporter';
import { DataImporter } from '../importer/DataImporter';
import { AmmoImporter } from '../importer/AmmoImporter';
import { WeaponModImporter } from '../importer/WeaponModImporter';
import { VehicleModImporter } from '../importer/VehicleModImporter';
import { SpellImporter } from '../importer/SpellImporter';
import { QualityImporter } from '../importer/QualityImporter';
import { ComplexFormImporter } from '../importer/ComplexFormImporter';
import { WareImporter } from '../importer/WareImporter';
import { CritterPowerImporter } from '../importer/CritterPowerImporter';
import { ImportHelper, ImportMode } from '../helper/ImportHelper';
import { DeviceImporter } from "../importer/DeviceImporter";
import { EquipmentImporter } from "../importer/EquipmentImporter";
import { SpritePowerImporter } from '../importer/SpritePowerImporter';
import { VehicleImporter } from '../importer/VehicleImporter';
import { CritterImporter } from '../importer/CritterImporter';
import { SpiritImporter } from '../importer/SpiritImporter';
import { SpriteImporter } from '../importer/SpriteImporter';


export class Import extends Application {
    private githubConfig = {
        user: "BM123499",
        repo: "chummer5a",
        branch: "XSD_Remake",
    } as const;
    private gitURL = `https://raw.githubusercontent.com/${this.githubConfig.user}/${this.githubConfig.repo}/${this.githubConfig.branch}` as const;

    private supportedDataFiles: string[] = [];
    private dataFiles: File[] = [];
    private langDataFile: File;
    private parsedFiles: string[] = [];
    private disableImportButton: boolean = true;
    private currentParsedFile: string;
    private showAdvanced: boolean = false;
    private selectedLanguage: string = "";
    private icons: boolean = true;

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
        data.disableImportButton = this.disableImportButton;
        data.langDataFile = this.langDataFile ? this.langDataFile.name : '';
        data.finishedOverallParsing = this.supportedDataFiles.length === this.parsedFiles.length;

        data.info = {
            version: "Temporary Database",
            versionLink: `https://www.github.com/${this.githubConfig.user}/${this.githubConfig.repo}/tree/${this.githubConfig.branch}/Chummer/data`
        };

        return { ...data };
    }

    private collectDataImporterFileSupport() {
        this.supportedDataFiles = [];
        Import.ItemImporters.forEach(importer => {
            if (this.supportedDataFiles.some(supported => importer.files.includes(supported))) {
                return;
            }
            this.supportedDataFiles = this.supportedDataFiles.concat(importer.files);
        });
        Import.ActorImporters.forEach(importer => {
            if (this.supportedDataFiles.some(supported => importer.files.includes(supported))) {
                return;
            }
            this.supportedDataFiles = this.supportedDataFiles.concat(importer.files);
        });
    }

    private clearParsingStatus() {
        this.parsedFiles = [];
    }

    //Order is important, ex. some weapons need mods to fully import
    static ItemImporters: DataImporter<Shadowrun.ShadowrunItemData, Shadowrun.ShadowrunItemDataData>[] = [
        new WeaponModImporter(),
        new WeaponImporter(),
        new ArmorImporter(),
        new AmmoImporter(),
        new SpellImporter(),
        new ComplexFormImporter(),
        new QualityImporter(),
        new WareImporter(),
        new CritterPowerImporter(),
        new SpritePowerImporter(),
        new DeviceImporter(),
        new EquipmentImporter(),
        new ProgramImporter(),
        new VehicleModImporter()
    ];

    //Order is important, ex. some weapons need mods to fully import
    static ActorImporters: DataImporter<Shadowrun.ShadowrunActorData, Shadowrun.ShadowrunActorDataData>[] = [
        new VehicleImporter(),
        new CritterImporter(),
        new SpiritImporter(),
        new SpriteImporter(),
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
    async parseXML(xmlSource, fileName, setIcons) {

        let jsonSource = await DataImporter.xml2json(xmlSource);
        ImportHelper.SetMode(ImportMode.XML);

        // Apply Item Importers based on file and their ability to parse that file.
        for (const di of Import.ItemImporters.filter(importer => importer.files.includes(fileName))) {
            if (di.CanParse(jsonSource)) {
                di.ExtractTranslation(fileName);
                await di.Parse(jsonSource, setIcons);
            }
        }

        // Apply Actor Importers based on their ability to parse that file.
        for (const di of Import.ActorImporters.filter(importer => importer.files.includes(fileName))) {
            if (di.CanParse(jsonSource)) {
                di.ExtractTranslation(fileName);
                await di.Parse(jsonSource, setIcons);
            }
        }
    }

    async parseXmli18n(xmlSource) {
        if (!xmlSource) {
            return;
        }
        let jsonSource = await DataImporter.xml2json(xmlSource);

        if (DataImporter.CanParseI18n(jsonSource)) {
            DataImporter.ParseTranslation(jsonSource);
        }
    }

    isDataFile = (file: File): boolean => {
        return this.supportedDataFiles.some((supported) => supported === file.name);
    };

    isLangDataFile = (file: File): boolean => {
        const pattern = /[a-zA-Z]{2}-[a-zA-Z]{2}_data\.xml/;
        return file.name.match(pattern) !== null;
    };

    override activateListeners(html) {
        html.find('.setIcons').on('click', () => {
            this.icons = !this.icons;
        });

        html.find('.toggleAdvancedBtn').on('click', async () => {
            this.showAdvanced = !this.showAdvanced;
            await this.render();
        });

        html.find('.quickImportBtn').on('click', async () => {
            const dataURL = this.gitURL + '/Chummer/data';
            const setIcons = $('.setIcons').is(':checked');

            this.clearParsingStatus();
            this.disableImportButton = true;
            await this.render();

            if (this.selectedLanguage) {
                try {
                    const langUrl = this.gitURL + `/Chummer/lang/${this.selectedLanguage}`;
                    const langResponse = await fetch(langUrl);
                    if (!langResponse.ok) throw new Error();
                    const langXml = await langResponse.text();
                    await this.parseXmli18n(langXml);
                } catch {
                    ui.notifications?.warn(`Failed to load language file: ${this.selectedLanguage}`);
                }
            }

            for (const fileName of this.supportedDataFiles) {
                const url = `${dataURL}/${fileName}`;

                try {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    const xmlText = await response.text();

                    this.currentParsedFile = fileName;
                    await this.render();

                    await this.parseXML(xmlText, fileName, setIcons);

                    if (!this.parsedFiles.includes(fileName)) {
                        this.parsedFiles.push(fileName);
                    }

                    await this.render();

                } catch (err) {
                    console.error(`Error importing ${fileName}:`, err);
                    ui.notifications?.error(`Failed to import ${fileName}`);
                }
            }

            this.disableImportButton = false;
            await this.render();
            ui.notifications?.warn('SR5.Warnings.BulkImportPerformanceWarning', { localize: true });
        });

        html.find("button[type='submit']").on('click', async (event) => {
            const start = performance.now();
            event.preventDefault();

            this.clearParsingStatus();
            this.disableImportButton = true;

            await this.render();

            if (this.langDataFile) {
                const text = await this.langDataFile.text();
                await this.parseXmli18n(text);
            }

            const setIcons = $('.setIcons').is(':checked');

            // Use 'for of'-loop to allow await to actually pause.
            // don't use .forEach as it won't await for async callbacks.
            // iterate over supportedDataFiles to adhere to Importer order
            for (const supportedFile of this.supportedDataFiles) {
                // Only try supported files.
                const dataFile = this.dataFiles.find((dataFile) => dataFile.name === supportedFile);
                if (dataFile) {
                    const text = await dataFile.text();

                     // Show status for current parsing progression.
                    this.currentParsedFile = dataFile.name;
                    await this.render();

                    await this.parseXML(text, dataFile.name, setIcons);

                    // Store status to show parsing progression.
                    if (!this.parsedFiles.some((parsedFileName) => parsedFileName === dataFile.name)) {
                        this.parsedFiles.push(dataFile.name);
                    }

                    await this.render();
                }
            }

            this.disableImportButton = false;

            await this.render();

            ui.notifications?.warn('SR5.Warnings.BulkImportPerformanceWarning', {localize: true});
            const end = performance.now();
            console.log(`Time used: ${(end - start).toFixed(2)} ms`);
        });

        html.find("input[type='file'].langDataFileDrop").on('change', async (event) => {
            Array.from(event.target.files).forEach((file: File) => {
                if (this.isLangDataFile(file)) {
                    this.langDataFile = file;
                    this.render();
                }
            });
            return true;
        });

        html.find("input[type='file'].filedatadrop").on('change', async (event) => {
            Array.from(event.target.files).forEach((file: File) => {
                if (this.isDataFile(file)) {
                    // Allow user to overwrite an already added file, they have their reasons.
                    const existingIdx = this.dataFiles.findIndex((dataFile) => dataFile.name === file.name);
                    if (existingIdx === -1) {
                        this.dataFiles.push(file);
                    } else {
                        this.dataFiles[existingIdx] = file;
                    }
                }
            });

            if (this.dataFiles.length > 0) {
                this.disableImportButton = false;
            }

            this.render();
        });
    }
}
