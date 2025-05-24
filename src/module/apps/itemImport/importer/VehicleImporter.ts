import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { VehicleParser } from '../parser/vehicle/VehicleParser';
import { Constants } from './Constants';
import { SR5Actor } from '../../../actor/SR5Actor';
import { StoredDocument } from '@league-of-foundry-developers/foundry-vtt-types/src/types/utils.mjs';

export class VehicleImporter extends DataImporter<Shadowrun.VehicleActorData, Shadowrun.VehicleData> {
    public files = ["vehicles.xml"];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('vehicles') && jsonObject['vehicles'].hasOwnProperty('vehicle');
    }

    ExtractTranslation() {
        if (!DataImporter.jsoni18n) {
            return;
        }

        const jsonVehiclei18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
        this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonVehiclei18n);
        this.itemTranslations = { ... ImportHelper.ExtractItemTranslation(jsonVehiclei18n, 'vehicles', 'vehicle'),
                                  ... ImportHelper.ExtractItemTranslation(jsonVehiclei18n, 'weapons', 'weapon') };
    }

    async createFolders(chummerData: object, translations: Record<string, string>): Promise<Record<string, any>> {
        const categories = (chummerData as { categories: any })?.categories?.category || [];

        const { drones, vehicles } = categories.reduce(
            (acc: { drones: any[]; vehicles: any[] }, category: { _TEXT: string }) => {
                if (category._TEXT?.toLowerCase().startsWith("drones:")) {
                    const cleanedCategory = { ...category, _TEXT: category._TEXT.replace(/^drones: /i, '').trim() };
                    acc.drones.push(cleanedCategory);
                } else {
                    acc.vehicles.push(category);
                }
                return acc;
            },
            { drones: [], vehicles: [] }
        );

        const dronesData = { categories: { category: [...drones] } };
        const vehiclesData = { categories: { category: [...vehicles] } };

        const droneFolders = await ImportHelper.MakeCategoryFolders("Actor", dronesData, 'Drones', translations);
        const vehicleFolders = await ImportHelper.MakeCategoryFolders("Actor", vehiclesData, 'Vehicles', translations);

        const folders = { ...droneFolders, ...vehicleFolders };
        folders['Other'] = await ImportHelper.GetFolderAtPath("Actor", `${Constants.ROOT_IMPORT_FOLDER_NAME}/Vehicles/Other`, true);

        return folders;
    }

    async Parse(chummerData: object, setIcons: boolean): Promise<StoredDocument<SR5Actor>[]> {
        const actors: Shadowrun.VehicleActorData[] = [];
        const jsonDatas = chummerData['vehicles']['vehicle'];
        this.iconList = await this.getIconFiles();
        const parserType = 'vehicle';
        const parser = new VehicleParser();
        const folders = await this.createFolders(chummerData, this.categoryTranslations);
        
        for (let i = 0; i < jsonDatas.length; i++) {
            const jsonData = jsonDatas[i];

            // Check to ensure the data entry is supported and the correct category
            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            const actor = parser.Parse(jsonData, this.GetDefaultData({type: parserType, entityType: "Actor"}), this.itemTranslations);
            const category = ImportHelper.StringValue(jsonData, 'category').replace(/^drones:\s*/i, '').toLowerCase();
            
            //@ts-expect-error TODO: Foundry Where is my foundry base data?
            actor.folder = folders[category]?.id || folders['Other'].id;

            actor.system.importFlags = this.genImportFlags(actor.name, actor.type, this.formatAsSlug(category));
            if (setIcons) {actor.img = await this.iconAssign(actor.system.importFlags, actor.system, this.iconList)};

            actor.name = ImportHelper.MapNameToTranslation(this.itemTranslations, actor.name);

            actors.push(actor);
        }

        // @ts-expect-error // TODO: TYPE: Remove this.
        return await Actor.create(actors);
    }
}
