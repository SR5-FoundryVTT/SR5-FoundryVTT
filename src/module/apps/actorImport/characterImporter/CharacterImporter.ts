import { SR5Actor } from "src/module/actor/SR5Actor";
import { ImportHelper as IH } from "src/module/apps/itemImport/helper/ImportHelper";

import { ActorSkillImport } from '../ActorSkillImport';
import { DataDefaults } from "@/module/data/DataDefaults";
import { Sanitizer } from "@/module/sanitizer/Sanitizer";

import { ActorSchema } from "../ActorSchema";
import { ItemsParser } from "../itemImporter/ItemsParser";
import { VehicleParser } from "../itemImporter/vehicleImport/VehicleParser";

// Type Definitions
export type ImportOptionsType = Partial<{
    assignIcons: boolean;
    folderId: string | null;
    armor: boolean;
    contacts: boolean;
    cyberware: boolean;
    equipment: boolean;
    lifestyles: boolean;
    metamagics: boolean;
    powers: boolean;
    qualities: boolean;
    rituals: boolean;
    spells: boolean;
    vehicles: boolean;
    weapons: boolean;
}>;

export interface BlankCharacter extends Actor.CreateData {
    type: 'character',
    name: string,
    items: Item.CreateData[],
    effects: ActiveEffect.CreateData[],
    system: ReturnType<typeof DataDefaults.baseSystemData<'character'>>,
};

/**
 * Imports characters from other tools into an existing foundry actor.
 */
export class CharacterImporter {
    /**
     * Maps Chummer attribute abbreviations to SR5-Foundry attribute names.
     * @param attName The Chummer attribute abbreviation.
     * @returns The corresponding SR5-Foundry attribute name, or an empty string if not found.
     */
    static parseAttName(
        attName: string
    ): ReturnType<typeof ActorSkillImport.parseAttName> {
        return ActorSkillImport.parseAttName(attName);
    }

    static parseSkillName(skillName: string): string {
        return ActorSkillImport.parseSkillName(skillName);
    }

    // --------------------------------------------------------------------------
    // Public Methods
    // --------------------------------------------------------------------------

    /**
     * Imports a chummer character into an existing actor. The actor will be updated. This might lead to duplicate items.
     * @param chummerCharacter The complete chummer file as json object. The first character will be selected for import.
     * @param importOptions Additional import option that specify what parts of the chummer file will be imported.
     */
    static async import(chummerCharacter: ActorSchema, importOptions: ImportOptionsType): Promise<[SR5Actor<'character'>, ...SR5Actor<'vehicle'>[]]> {
        const character: BlankCharacter = {
            effects: [],
            type: 'character',
            folder: importOptions.folderId ?? null,
            system: DataDefaults.baseSystemData('character'),
            items: await new ItemsParser().parse(chummerCharacter, importOptions),
            name: chummerCharacter.alias ?? chummerCharacter.name ?? '[Name not found]',
        };

        await this.update(character, chummerCharacter);

        const consoleLogs = Sanitizer.sanitize(CONFIG.Actor.dataModels.character.schema, character.system);
        if (consoleLogs) {
            console.warn(`Document Sanitized on Import; Name: ${chummerCharacter.name}\n`);
            console.table(consoleLogs);
        }

        const actor = (await SR5Actor.create(character))! as SR5Actor<'character'>;

        await this.fixAttributes(actor, chummerCharacter);

        let createdVehicles: SR5Actor<'vehicle'>[] = [];
        if (importOptions.vehicles) {
            const chummerVehicles = IH.getArray(chummerCharacter.vehicles?.vehicle);
            const vehicleData = await new VehicleParser().parseVehicles(actor, chummerVehicles);
            const createdDocs = await SR5Actor.create(vehicleData) as SR5Actor<'vehicle'>[] | SR5Actor<'vehicle'>;
            createdVehicles = Array.isArray(createdDocs) ? createdDocs : [createdDocs];
        }

        return [actor, ...createdVehicles];
    }

    // --------------------------------------------------------------------------
    // Private Orchestration Methods
    // --------------------------------------------------------------------------

    /**
     * Parses the actor data from the chummer file and returns an updated clone of the actor data.
     * @param actor The actor data (actor not actor.system) that is used as the basis for the import. Will not be changed.
     * @param chummerChar The chummer character to parse.
     */
    private static async update(actor: BlankCharacter, chummerChar: ActorSchema) {
        // Name is required, so we need to always set something (even if the chummer field is empty)
        actor.name = chummerChar.alias ?? chummerChar.name ?? '[Name not found]';

        this.importBasicData(actor.system, chummerChar);
        await this.importBio(actor.system, chummerChar);
        this.importAttributes(actor.system, chummerChar);
        this.importInitiative(actor.system, chummerChar);
        await ActorSkillImport.importSkills(actor, chummerChar);

        actor.system.is_critter = chummerChar.critter === 'True';
    }

    // --------------------------------------------------------------------------
    // Private Data Import Methods
    // --------------------------------------------------------------------------

    private static importBasicData(system: BlankCharacter['system'], chummerChar: ActorSchema) {
        if (chummerChar.metatype) {
            // Avoid i18n metatype field issues. Chummer metatype aren't lowercase but foundry system metatypes are.
            system.metatype = chummerChar.metatype_english.toLowerCase() as any;
        }

        system.street_cred = Number(chummerChar.calculatedstreetcred) || 0;
        system.notoriety = Number(chummerChar.calculatednotoriety) || 0;
        system.public_awareness = Number(chummerChar.calculatedpublicawareness) || 0;
        system.karma.value = Number(chummerChar.karma) || 0;
        system.karma.max = Number(chummerChar.totalkarma) || 0;
        system.nuyen = parseInt(chummerChar.nuyen.replace(/[,.]/g, ''));

        if (chummerChar.technomancer === 'True') {
            system.special = 'resonance';
            const initiationGrades = IH.getArray(chummerChar.initiationgrade?.initiationgrade);
            const technoGrades = initiationGrades
                .filter(grade => grade.technomancer === 'True')
                .map(grade => Number(grade.grade) || 0);
            system.technomancer.submersion = Math.max(0, ...technoGrades);
        } else if (chummerChar.magician === 'True' || chummerChar.adept === 'True') {
            system.special = 'magic';

            let attr: string[] = [];
            // @ts-expect-error legacy chummer attribute
            if (chummerChar.tradition?.drainattribute?.attr) {
                // @ts-expect-error legacy chummer attribute
                attr = chummerChar.tradition.drainattribute.attr;
            } else if (chummerChar.tradition?.drainattributes) {
                attr = chummerChar.tradition.drainattributes
                    .split('+')
                    .map((item) => item.trim());
            }

            const filteredAttr = attr.find((att) => att !== 'willpower');
            if (filteredAttr) {
                system.magic.attribute = this.parseAttName(filteredAttr) as any;
            }

            const initiationGrades = IH.getArray(chummerChar.initiationgrade?.initiationgrade);
            const magicianGrades = initiationGrades
                .filter(grade => grade.technomancer === 'False')
                .map(grade => Number(grade.grade) || 0);
            system.magic.initiation = Math.max(0, ...magicianGrades);
        }
    }

    private static async importBio(system: BlankCharacter['system'], chummerChar: ActorSchema) {
        let bioHtml = '';

        if (chummerChar.description) bioHtml += chummerChar.description + '<br/>';
        if (chummerChar.background) bioHtml += chummerChar.background + '<br/>';
        if (chummerChar.concept) bioHtml += chummerChar.concept + '<br/>';
        if (chummerChar.notes) bioHtml += chummerChar.notes + '<br/>';

        // Chummer outputs html and wraps every section in <p> tags.
        // Adding the option async.true is necessary for the pdf-pager module not to cause an error on import.
        system.description.value = await foundry.applications.ux.TextEditor.implementation.enrichHTML(bioHtml);
    }

    private static importAttributes(system: BlankCharacter['system'], chummerChar: ActorSchema) {
        if (!chummerChar.attributes) return;

        for (const att of chummerChar.attributes[1].attribute) {
            const attName = this.parseAttName(att.name_english);
            if (!attName) continue;

            system.attributes[attName].base = parseInt(att.base);
        }
    }

    private static async fixAttributes(actor: SR5Actor, chummerChar: ActorSchema) {
        const fixes: Partial<Record<ReturnType<typeof CharacterImporter['parseAttName']>, number>> = {};
        for (const att of chummerChar.attributes[1].attribute) {
            const attName = this.parseAttName(att.name_english);
            if (!attName) continue;

            if (actor.system.attributes[attName].value !== parseInt(att.total))
                fixes[attName] = parseInt(att.total) - actor.system.attributes[attName].value;
        }

        if (Object.keys(fixes).length > 0) {
            const changes = Object.entries(fixes).map(([key, value]) => ({
                key: `system.attributes.${key}.value`, value: String(value)
            }));
            await actor.createEmbeddedDocuments('ActiveEffect', [{
                name: `Attribute Fixes on Import`, changes
            }]);
        }
    }

    private static importInitiative(system: BlankCharacter['system'], chummerChar: ActorSchema) {
        // TODO: These modifiers are very unclear in how they're used here and where they come from.
        system.modifiers.meat_initiative = Number(chummerChar.initbonus) || 0;

        // 'initdice' contains the total amount of initiative dice, not just the bonus.
        system.modifiers.meat_initiative_dice = (Number(chummerChar.initdice) || 1) - 1;
        system.modifiers.astral_initiative_dice = (Number(chummerChar.astralinitdice) || 2) - 2;
        system.modifiers.matrix_initiative_dice = (Number(chummerChar.matrixarinitdice) || 3) - 3;
    }

}
