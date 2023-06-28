import { ImportHelper } from "../helper/ImportHelper";
import { DataImporter } from "./DataImporter";

import ProgramItemData = Shadowrun.ProgramItemData;
import { Constants } from './Constants';

/**
 * Programs are part of the Chummer5 gear.xml
 */
export class ProgramImporter extends DataImporter<ProgramItemData, Shadowrun.ProgramData> {
    public files = ['gear.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('gears') && jsonObject['gears'].hasOwnProperty('gear');
    }

    ExtractTranslation(fileName?: string) {
        if (!DataImporter.jsoni18n) {
            return;
        }

        let jsonGeari18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
        this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonGeari18n);
        this.itemTranslations = ImportHelper.ExtractItemTranslation(jsonGeari18n, 'gears', 'gear');
    }

    filterGearToPrograms(jsonObject: object) {
        const categories = [
            'Hacking Programs',
            'Common Programs',
        ]

        return jsonObject['gears']['gear'].filter(gear => categories.includes(ImportHelper.StringValue(gear, 'category', '')));
    }

    async parsePrograms(programs: object[]) {
        const items: ProgramItemData[] = [];

        for (const program of programs) {
            if (DataImporter.unsupportedEntry(program)) continue;

            const item = this.GetDefaultData({type: 'program'});

            item.name = ImportHelper.StringValue(program, 'name');
            item.name = ImportHelper.MapNameToTranslation(this.itemTranslations, item.name);

            item.system.technology.rating = ImportHelper.IntValue(program, 'rating', 0);
            item.system.description.source = `${ImportHelper.StringValue(program, 'source')} ${ImportHelper.MapNameToPageSource(this.itemTranslations, ImportHelper.StringValue(program, 'name'), ImportHelper.StringValue(program, 'page'))}`;
            item.system.technology.availability = ImportHelper.StringValue(program, 'avail');
            item.system.technology.cost = ImportHelper.IntValue(program, 'cost', 0);
            item.system.type = Constants.MAP_CHUMMER_PROGRAMM_CATEGORY[ImportHelper.StringValue(program, 'category')]

            const category = ImportHelper.TranslateCategory(ImportHelper.StringValue(program, 'category'), this.categoryTranslations).replace('/', ' ');
            let categoryFolder = await ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/${game.i18n.localize('SR5.Programs')}/${category}`, true);
            
            //@ts-ignore TODO: foundry-vtt-types v10
            item.folder = categoryFolder.id;

            // TODO: Move this to a more general base class
            item.img = this.iconAssign(item.type, item.name, item.system);
            
            items.push(item);
        }

        return items;
    } 


    async Parse(jsonObject: object): Promise<Item> {
        const programs = this.filterGearToPrograms(jsonObject);
        const items = await this.parsePrograms(programs);
        // @ts-ignore I have bigger issues than fully typing this.
        return await Item.create(items);
    }
}