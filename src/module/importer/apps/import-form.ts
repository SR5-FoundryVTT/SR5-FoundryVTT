import { WeaponImporter } from '../importer/WeaponImporter';
import { ArmorImporter } from '../importer/ArmorImporter';
import { DataImporter } from '../importer/DataImporter';
import { AmmoImporter } from '../importer/AmmoImporter';
import { ModImporter } from '../importer/ModImporter';
import { SpellImporter } from '../importer/SpellImporter';
import { QualityImporter } from '../importer/QualityImporter';
import { ComplexFormImporter } from '../importer/ComplexFormImporter';
import { WareImporter } from '../importer/WareImporter';
import { CritterPowerImporter } from '../importer/CritterPowerImporter';
import { ImportHelper, ImportMode } from '../helper/ImportHelper';
import {DeviceImporter} from "../importer/DeviceImporter";
import {EquipmentImporter} from "../importer/EquipmentImporter";


export class Import extends Application {
    private supportedDataFiles: string[] = [];
    private dataFiles: File[] = [];
    private langDataFile: File;
    private parsedFiles: string[] = [];
    private disableImportButton: boolean = true;
    private currentParsedFile: string;

    constructor() {
        super();

        this.collectDataImporterFileSupport();
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'chummer-data-import';
        options.classes = ['app', 'window-app', 'filepicker'];
        options.title = 'Chummer/Data Import';
        options.template = 'systems/shadowrun5e/dist/templates/apps/compendium-import.html';
        options.width = 600;
        options.height = 'auto';
        return options;
    }

    getData(options?: any) {
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
        data.langDataFile = this.langDataFile ? this.langDataFile.name : '';
        data.finishedOverallParsing = this.supportedDataFiles.length === this.parsedFiles.length;
        data.disableImportButton = this.disableImportButton;

        return { ...data };
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

    private clearParsingStatus() {
        this.parsedFiles = [];
    }

    //Order is important, ex. some weapons need mods to fully import
    static Importers: DataImporter[] = [
        new ModImporter(),
        new WeaponImporter(),
        new ArmorImporter(),
        new AmmoImporter(),
        new SpellImporter(),
        new ComplexFormImporter(),
        new QualityImporter(),
        new WareImporter(),
        new CritterPowerImporter(),
        new DeviceImporter(),
        new EquipmentImporter()
    ];

    async parseXML(xmlSource, fileName) {
        let jsonSource = await DataImporter.xml2json(xmlSource);
        ImportHelper.SetMode(ImportMode.XML);

        for (const di of Import.Importers) {
            if (di.CanParse(jsonSource)) {
                di.ExtractTranslation(fileName);
                await di.Parse(jsonSource);
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

    activateListeners(html) {
        html.find("button[type='submit']").on('click', async (event) => {
            event.preventDefault();

            this.clearParsingStatus();
            this.disableImportButton = true;

            await this.render();

            if (this.langDataFile) {
                const text = await this.langDataFile.text();
                await this.parseXmli18n(text);
            }

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


                    await this.parseXML(text, dataFile.name);

                    // Store status to show parsing progression.
                    if (!this.parsedFiles.some((parsedFileName) => parsedFileName === dataFile.name)) {
                        this.parsedFiles.push(dataFile.name);
                    }

                    await this.render();
                }
            }

            this.disableImportButton = false;

            await this.render();
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
