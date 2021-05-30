import {_mergeWithMissingSkillFields} from "../actor/prep/functions/SkillsPrep";
import {CharacterImporter} from "./characterImport/CharacterImporter"

export class ChummerImportForm extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'chummer-import';
        options.classes = ['shadowrun5e'];
        options.title = 'Chummer/Hero Lab Import';
        options.template = 'systems/shadowrun5e/dist/templates/apps/import.html';
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
                weapons: $('.weapons').is(':checked'),
                armor: $('.armor').is(':checked'),
                cyberware: $('.cyberware').is(':checked'),
                equipment: $('.gear').is(':checked'),
                qualities: $('.qualities').is(':checked'),
                powers: $('.powers').is(':checked'),
                spells: $('.spells').is(':checked'),
                contacts: $('.contacts').is(':checked'),
                lifestyles: $('.lifestyles').is(':checked'),
            }

            const importer = new CharacterImporter();
            await importer.importChummerCharacter(this.object, chummerFile, importOptions);

            ui.notifications?.info(
                'Complete! Check everything. Notably: Ranged weapon mods and ammo; Strength based weapon damage; Specializations on all spells, powers, and weapons;'
            );
            this.close();
        });
    }
}
