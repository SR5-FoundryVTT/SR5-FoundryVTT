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

    private setIcons: boolean = true;
    private isImporting: boolean = false;
    private deleteCompendiums: boolean = false;
    private overrideDocuments: boolean = true;

    private zipFile: File | null = null;

    static override get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'chummer-data-import';
        options.classes = ['app', 'window-app', 'filepicker'];
        options.title = 'Chummer/Data Import';
        options.template = 'systems/shadowrun5e/dist/templates/apps/compendium-import.hbs';
        options.width = 525;
        options.height = 'auto';
        return options;
    }

    override getData(options?: any) {
        const data = super.getData(options) as any;

        data.icons = this.setIcons;
        data.isImporting = this.isImporting;
        data.zipFileName = this.zipFile?.name;
        data.deleteCompendiums = this.deleteCompendiums;
        data.overrideDocuments = this.overrideDocuments;

        const {owner, repo, branch, version} = this.githubConfig;
        data.info = {
            version,
            versionLink: `https://www.github.com/${owner}/${repo}/tree/${branch}/Chummer/data`
        };

        return data;
    }

    //Order is important, ex. some weapons need mods to fully import, or it might take longer to import.
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

    async fetchGitHubFile(path: string): Promise<string | undefined> {
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

        return undefined
    }

    async handleBulkImport() {
        this.isImporting = true;
        for (const [, compendium] of Object.entries(Constants.MAP_COMPENDIUM_CONFIG))
                await game.packs.get("world." + compendium.pack)?.configure({locked: false});

        if (this.deleteCompendiums)
            for (const [, compendium] of Object.entries(Constants.MAP_COMPENDIUM_CONFIG))
                await game.packs.get("world." + compendium.pack)?.deleteCompendium();

        const ZIP = this.zipFile ? await (new JSZip()).loadAsync(this.zipFile) : null;

        DataImporter.setIcons = this.setIcons;
        DataImporter.overrideDocuments = this.overrideDocuments;
        DataImporter.iconList = await IconAssign.getIconFiles();

        this.render();

        for (const importer of Import.Importers) {
            for (const fileName of importer.files) {
                try {
                    const start = performance.now();

                    const file = ZIP
                        ? await ZIP.file(fileName)?.async('string')
                        : await this.fetchGitHubFile(`Chummer/data/${fileName}`);

                    if (file === undefined) throw new Error(`File ${fileName} not found`);
                    const json = await DataImporter.xml2json(file);

                    await importer.Parse(json as any);
                    const duration = performance.now() - start;
                    console.debug(`Importing ${fileName} took ${duration.toFixed(2)} ms`);
                } catch (error) {
                    console.error(`Error importing ${fileName}:`, error);
                    ui.notifications.error(`Error importing ${fileName}`);
                }
            }
            this.render();
        }

        for (const [, compendium] of Object.entries(Constants.MAP_COMPENDIUM_CONFIG))
            await game.packs.get("world." + compendium.pack)?.configure({locked: true});
        
        ui.notifications?.warn('SR5.Warnings.BulkImportPerformanceWarning', { localize: true });
        this.isImporting = false;
        this.render();
    }

    override activateListeners(html: JQuery<HTMLElement>) {
        // --- Quick Import from GitHub ---
        html.find('#importBtn').on('click', () => {
            const start = performance.now();
            void this.handleBulkImport()
                .then(() => {
                    console.log(`Quick import time: ${(performance.now() - start).toFixed(2)} ms`);
                });
        });

        // --- ZIP File Input Handler ---
        html.find('#zipFileInput').on('change', (event: JQuery.TriggeredEvent) => {
            const input = event.target as HTMLInputElement;
            this.zipFile = input.files?.[0] ?? null;
            this.render();
        });

        html.find('#setIcons').on('click', (event: JQuery.TriggeredEvent) => {
            this.setIcons = (event.currentTarget as HTMLInputElement).checked;
        });

        html.find('#deleteCompendiums').on('click', (event: JQuery.TriggeredEvent) => {
            this.deleteCompendiums = (event.currentTarget as HTMLInputElement).checked;
        });

        html.find('#overrideDocuments').on('click', (event: JQuery.TriggeredEvent) => {
            this.overrideDocuments = (event.currentTarget as HTMLInputElement).checked;
        });
    }
}
