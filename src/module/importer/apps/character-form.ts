import {
    DataImporter
} from '../importer/DataImporter';
import {
    ImportHelper,
    ImportMode
} from '../helper/ImportHelper';

export class CharacterImport extends FormApplication {
    private disableImportButton: boolean = true;
    private chumFile: File;
    private parsedFile: string;

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'chummer-data-import';
        options.classes = ['sr5'];
        options.title = game.i18n.localize('SR5.ChummerImport.Title');
        options.template = 'systems/shadowrun5e/dist/templates/apps/character-import.html';
        options.width = 600;
        options.height = 'auto';
        return options;
    }

    getData(options ? : any): any {
        const data = super.getData(options);

        data.disableImportButton = this.disableImportButton;
        data.chumFile = this.chumFile?.name ?? '';
        return {
            ...data
        };
    }

    activateListeners(html) {
        html.find("input[type=file][name=chummer-file]").on('change', async (event) => {
            Array.from(event.target.files).forEach((file: File) => {
                if (this.isChumFileFile(file)) {
                    this.chumFile = file;
                    console.log(`SR5 - activateListeners file.onChange |`, file);
                    this.disableImportButton = false;
                    this.render();
                }
            });
            return true;
        });

        html.find("button[type='submit']").on('click', async (event) => {
            event.preventDefault();
            this.disableImportButton = true;

            const text = await this.chumFile.text();
            const parsedFile = this.parseXML(text);

            console.log(`SR5 - CharacterImport - parsedFile |`, parsedFile);
            this.render();
        });
    }

    isChumFileFile = (file: File): boolean => {
        const pattern = /^.*\.chum5/;
        return file.name.match(pattern) !== null;
    };

    async parseXML(xmlSource) {
        let jsonSource = await DataImporter.xml2json(xmlSource);
        ImportHelper.SetMode(ImportMode.XML);

        console.log(`SR5 - CharacterImport - parseXML |`, jsonSource);

        return jsonSource;
    }
}