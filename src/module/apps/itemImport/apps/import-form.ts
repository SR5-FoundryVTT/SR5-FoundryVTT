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

import AppV2 = foundry.applications.api.ApplicationV2;
const {ApplicationV2, HandlebarsApplicationMixin} = foundry.applications.api;

export class Importer extends HandlebarsApplicationMixin(ApplicationV2<any>) {
    static override DEFAULT_OPTIONS = {
        id: 'chummer-data-import',
        tag: "form",
        position: {
            width: 525,
            height: 'auto' as const
        },
        window: {
            classes: ['chummer-import'],
            title: "Chummer/Data Import"
        }
    }

    static override PARTS = {
        content: {
            template: 'systems/shadowrun5e/dist/templates/apps/compendium-import.hbs'
        }
    }

    override get title() {
        return "Chummer/Data Import";
    }

    // Update Schemas in util/generate_schemas.py
    private static readonly githubConfig = {
        owner: "chummer5a",
        repo: "chummer5a",
        version: "v5.225.937",
        branch: "fb3bd44a2bfa68d015faf7831b2c8de565acb60d",
    } as const;

    private static setIcons = true;
    private static importDone = false;
    private static isImporting = false;
    private static overrideDocuments = true;
    private static deleteCompendiums = false;
    private static zipFile: File | null = null;
    private static progress = { idx: 0, total: 0, message: "" };

    override async _prepareContext(options?: any) {
        const data = await super._prepareContext(options);

        data.icons = Importer.setIcons;
        data.progress = {
            message: Importer.progress.message,
            pct: (Importer.progress.idx / Importer.progress.total * 100).toFixed(0)
        };
        data.importDone = Importer.importDone;
        data.isImporting = Importer.isImporting;
        data.zipFileName = Importer.zipFile?.name;
        data.deleteCompendiums = Importer.deleteCompendiums;
        data.overrideDocuments = Importer.overrideDocuments;

        const {owner, repo, branch, version} = Importer.githubConfig;
        data.info = {
            version,
            versionLink: `https://www.github.com/${owner}/${repo}/tree/${branch}/Chummer/data`
        };

        return data;
    }

    //Order is important, ex. some weapons need mods to fully import, or it might take longer to import.
    static readonly Importers: readonly DataImporter[] = [
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

    static async fetchGitHubFile(path: string): Promise<string | undefined> {
        const { owner, repo, branch } = Importer.githubConfig;
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
        Importer.isImporting = true;
        for (const [, compendium] of Object.entries(Constants.MAP_COMPENDIUM_CONFIG))
                await game.packs.get("world." + compendium.pack)?.configure({locked: false});

        if (Importer.deleteCompendiums)
            for (const [, compendium] of Object.entries(Constants.MAP_COMPENDIUM_CONFIG))
                await game.packs.get("world." + compendium.pack)?.deleteCompendium();

        const ZIP = Importer.zipFile ? await (new JSZip()).loadAsync(Importer.zipFile) : null;

        DataImporter.setIcons = Importer.setIcons;
        DataImporter.overrideDocuments = Importer.overrideDocuments;
        DataImporter.iconList = await IconAssign.getIconFiles();
        Importer.progress.total = Importer.Importers.length;

        await this.render();

        for (const importer of Importer.Importers) {
            for (const fileName of importer.files) {
                Importer.progress.message = "Importing: " + importer.constructor.name + " " + fileName;
                await this.render();

                try {
                    const start = performance.now();

                    const file = ZIP
                        ? await ZIP.file(fileName)?.async('string')
                        : await Importer.fetchGitHubFile(`Chummer/data/${fileName}`);

                    if (file === undefined) throw new Error(`File ${fileName} not found`);
                    const json = await DataImporter.xml2json(file);

                    await importer.Parse(json);
                    const duration = performance.now() - start;
                    console.debug(`Importing ${fileName} took ${duration.toFixed(2)} ms`);
                } catch (error) {
                    console.error(`Error importing ${fileName}:`, error);
                    ui.notifications.error(`Error importing ${fileName}`);
                }

                Importer.progress.idx++;
                await this.render();
            }
        }

        for (const [, compendium] of Object.entries(Constants.MAP_COMPENDIUM_CONFIG))
            await game.packs.get("world." + compendium.pack)?.configure({locked: true});
        
        ui.notifications?.warn('SR5.Warnings.BulkImportPerformanceWarning', { localize: true });
        Importer.isImporting = false;
        Importer.importDone = true;
        await this.render();
    }

    protected override async _onRender(
        ...[context, options]: Parameters<AppV2["_onRender"]>
    ): Promise<void> {
        await super._onRender(context, options);

        const setIcon = this.element.querySelector<HTMLSelectElement>("#setIcon");
        setIcon?.addEventListener("change", (event) => {
            Importer.setIcons = (event.currentTarget as HTMLInputElement).checked;
        });

        const deleteCompendiums = this.element.querySelector<HTMLSelectElement>("#deleteCompendiums");
        deleteCompendiums?.addEventListener("change", (event) => {
            Importer.deleteCompendiums = (event.currentTarget as HTMLInputElement).checked;
        });

        const overrideDocuments = this.element.querySelector<HTMLSelectElement>("#overrideDocuments");
        overrideDocuments?.addEventListener("change", (event) => {
            Importer.overrideDocuments = (event.currentTarget as HTMLInputElement).checked;
        });

        const zipFileInput = this.element.querySelector<HTMLInputElement>("#zipFileInput");
        zipFileInput?.addEventListener("change", (event) => {
            const input = event.currentTarget as HTMLInputElement;
            Importer.zipFile = input.files?.[0] ?? null;
            void this.render();
        });

        const importBtn = this.element.querySelector<HTMLButtonElement>("#importBtn");
        importBtn?.addEventListener("click", () => {
            const start = performance.now();
            void this.handleBulkImport().then(() => {
                    console.log(`Bulk import time: ${(performance.now() - start).toFixed(2)} ms`);
                });
        });

        const resetImport = this.element.querySelector<HTMLButtonElement>("#resetImport");
        resetImport?.addEventListener("click", () => {
            Importer.progress = { idx: 0, total: 0, message: "" };
            Importer.importDone = false;
            Importer.zipFile = null;
            void this.render();
        });
    }
}
