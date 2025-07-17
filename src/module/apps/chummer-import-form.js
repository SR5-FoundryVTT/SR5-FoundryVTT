import { CharacterImporter } from "./importer/actorImport/characterImporter/CharacterImporter"
import { SpiritImporter } from "./importer/actorImport/spiritImporter/SpiritImporter"

export class ChummerImportForm extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'chummer-import';
        options.classes = ['shadowrun5e'];
        options.title = 'Chummer/Hero Lab Import';
        options.template = 'systems/shadowrun5e/dist/templates/apps/import.hbs';
        options.width = 600;
        options.height = 'auto';
        return options;
    }

    getData() {
        return {};
    }

    activateListeners(html) {
        html.find('.submit-chummer-import').click(async (event) => {
            event.preventDefault();

            const chummerFile = JSON.parse($('.chummer-text').val());
            const importOptions = {
                assignIcons: $('.assignIcons').is(':checked'),

                armor: $('.armor').is(':checked'),
                contacts: $('.contacts').is(':checked'),
                cyberware: $('.cyberware').is(':checked'),
                equipment: $('.gear').is(':checked'),
                lifestyles: $('.lifestyles').is(':checked'),
                powers: $('.powers').is(':checked'),
                qualities: $('.qualities').is(':checked'),
                spells: $('.spells').is(':checked'),
                vehicles: $('.vehicles').is(':checked'),
                weapons: $('.weapons').is(':checked'),
            };

            let importer;
            switch(this.object.type) {
                case 'character': importer = new CharacterImporter(); break;
                case 'spirit': importer = new SpiritImporter(); break;
            }
            await importer.importChummerCharacter(this.object, chummerFile, importOptions);

            ui.notifications?.info(
                'Complete! Check everything. Notably: Ranged weapon mods and ammo; Strength based weapon damage; Specializations on all spells, powers, and weapons;'
            );
            this.close();
        });
    }
}
