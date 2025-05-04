import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { VehicleParser } from '../parser/vehicle/VehicleParser';
import { Constants } from './Constants';
import { SR5Actor } from '../../../actor/SR5Actor';
import { VehiclesSchema } from '../schema/VehiclesSchema';

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

    async createFolders(chummerData: VehiclesSchema, translations: Record<string, string>): Promise<Record<string, any>> {
        const categories = chummerData.categories.category;

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

        const droneFolders = await ImportHelper.MakeCategoryFolders("Drone", dronesData, 'Drones', translations);
        const vehicleFolders = await ImportHelper.MakeCategoryFolders("Drone", vehiclesData, 'Vehicles', translations);

        const folders = { ...droneFolders, ...vehicleFolders };
        folders['Other'] = await ImportHelper.GetFolderAtPath("Drone", "Vehicles/Other", true);

        return folders;
    }

    async Parse(chummerData: VehiclesSchema, setIcons: boolean): Promise<StoredDocument<SR5Actor>[]> {
        const actors: Shadowrun.VehicleActorData[] = [];
        this.iconList = await this.getIconFiles();
        const parserType = 'vehicle';
        const parser = new VehicleParser();
        const folders = await this.createFolders(chummerData, this.categoryTranslations);
        
        for (const jsonData of chummerData.vehicles.vehicle) {

            // Check to ensure the data entry is supported and the correct category
            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            try {
                const actor = await parser.Parse(jsonData, this.GetDefaultData({type: parserType, entityType: "Actor"}), this.itemTranslations);
                const category = ImportHelper.StringValue(jsonData, 'category').replace(/^drones:\s*/i, '').toLowerCase();
                
                //@ts-expect-error TODO: Foundry Where is my foundry base data?
                actor.folder = folders[category]?.id || folders['Other'].id;

                actor.system.importFlags = this.genImportFlags(actor.name, actor.type, this.formatAsSlug(category));
                if (setIcons) {actor.img = await this.iconAssign(actor.system.importFlags, actor.system, this.iconList)};

                actor.name = ImportHelper.MapNameToTranslation(this.itemTranslations, actor.name);

                actors.push(actor);
            } catch (error) {
                console.error("Error while parsing Vehicle:", jsonData.name._TEXT ?? "Unknown");
                ui.notifications?.error("Falled Parsing Vehicle:" + (jsonData.name._TEXT ?? "Unknown"));
            }
        }

        // @ts-expect-error // TODO: TYPE: Remove this.
        return await Actor.create(actors, { pack: Constants.MAP_COMPENDIUM_KEY['Drone'].pack });
    }
}
