import { CharacterImporter } from "../../importer/actorImport/characterImporter/CharacterImporter";
import { SpiritImporter } from "../../importer/actorImport/spiritImporter/SpiritImporter";
import { SpriteImporter } from "../../importer/actorImport/spriteImporter/SpriteImporter";
import { ActorFile, ActorSchema } from "../../importer/actorImport/ActorSchema";
import { ImportHelper as IH } from "../helper/ImportHelper";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

interface ImporterContext extends foundry.applications.api.ApplicationV2.RenderContext {
    folders: { id: string, name: string }[]
};

const BaseClass = HandlebarsApplicationMixin(ApplicationV2<ImporterContext>);
type BaseClassType = InstanceType<typeof BaseClass>;

export class ActorImporter extends BaseClass {
    /**
     * Default options for the application window.
     */
    static override DEFAULT_OPTIONS = {
        id: "chummer-data-import",
        tag: "form",
        position: {
            width: 600,
            height: "auto" as const,
        },
        window: {
            classes: ["chummer-import"],
            title: "Chummer/Data Import",
            icon: "fas fa-file-import",
        },
        actions: {
            import: function(this: ActorImporter) {
                void this.handleActorImport();
            }
        }
    };

    /**
     * Template parts used by the HandlebarsApplicationMixin.
     */
    static override PARTS = {
        content: {
            template: "systems/shadowrun5e/dist/templates/apps/actor-importer.hbs",
        },
    };

    /**
     * Dynamic title for the application window.
     */
    override get title() {
        return game.i18n.localize("SR5.Import.ActorImporter.Title");
    }

    override async _prepareContext(...args: Parameters<BaseClassType['_prepareContext']>) {
        const baseContext = await super._prepareContext(...args);
        const compareOptions = { numeric: true, sensitivity: 'base' } satisfies Intl.CollatorOptions;

        const folders = game.folders
            .filter(f => f.type === "Actor")
            .map(folder => ({
                id: folder.id,
                name: `${'─'.repeat(folder.ancestors.length) + ' '}${folder.name}`.trim(),
                sortKey: [...folder.ancestors.reverse().map(a => a.name), folder.name]
            }))
            .sort((a, b) => {
                const len = Math.min(a.sortKey.length, b.sortKey.length);
                for (let i = 0; i < len; i++) {
                    const cmp = a.sortKey[i].localeCompare(b.sortKey[i], undefined, compareOptions);
                    if (cmp !== 0) return cmp;
                }
                return a.sortKey.length - b.sortKey.length;
            })
            .map(({ id, name }) => ({ id, name }));

        return { ...baseContext, folders };
    }

    private async handleActorImport() {
        // Get the JSON input from the textarea
        const textarea = document.getElementById('chummer-input') as HTMLTextAreaElement;
        const jsonText = textarea?.value.trim();

        if (!jsonText) {
            ui.notifications?.warn("Please paste Chummer JSON data to import.");
            return;
        }

        let actorData: ActorSchema;
        try {
            actorData = IH.getArray((JSON.parse(jsonText) as ActorFile).characters.character)[0];
        } catch (e) {
            ui.notifications?.error("Invalid JSON. Please check your input.");
            console.error("JSON Parse Error:", e);
            return;
        }

        const getCheckboxValue = (selector: string): boolean =>
            (document.querySelector(selector) as HTMLInputElement)?.checked ?? false;

        const getInputValue = (selector: string): string | null =>
            (document.querySelector(selector) as HTMLInputElement)?.value || null;

        const importOptions = {
            assignIcons: getCheckboxValue('#assign-icons'),
            folderId: getInputValue('#chummer-folder-select'),

            armor: getCheckboxValue('input[data-field="armor"]'),
            contacts: getCheckboxValue('input[data-field="contacts"]'),
            cyberware: getCheckboxValue('input[data-field="cyberware"]'),
            gear: getCheckboxValue('input[data-field="gear"]'),
            lifestyles: getCheckboxValue('input[data-field="lifestyles"]'),
            powers: getCheckboxValue('input[data-field="powers"]'),
            qualities: getCheckboxValue('input[data-field="qualities"]'),
            spells: getCheckboxValue('input[data-field="spells"]'),
            vehicles: getCheckboxValue('input[data-field="vehicles"]'),
            weapons: getCheckboxValue('input[data-field="weapons"]'),
        };

        // Log everything for now (replace with actual import logic)
        console.log("Parsed Chummer Data:", actorData);
        console.log("Import Options:", importOptions);

        const spiritType = this.getSpiritType(actorData);
        if (spiritType)
            await SpiritImporter.import(actorData, spiritType, importOptions);
        else if (actorData.metatype_english?.toLowerCase().includes('sprite'))
            await SpriteImporter.import(actorData, importOptions);
        else
            await CharacterImporter.import(actorData, importOptions);

        await this.close();
    }

    private getSpiritType(chummerChar: ActorSchema) {
        const chummerType = chummerChar.metatype_english;

        const spiritTypes = [
            'air', 'aircraft', 'airwave', 'ally', 'automotive', 'beasts', 'ceramic', 'earth', 'energy',
            'fire', 'guardian', 'guidance', 'homunculus', 'man', 'metal','plant', 'ship', 'task', 'train',
            'water', 'watcher', 'toxic_air', 'toxic_beasts', 'toxic_earth', 'toxic_fire', 'toxic_man',
            'toxic_water', 'blood', 'muse', 'nightmare', 'shade', 'succubus', 'wraith',

            //shedim
            'shedim', 'hopper', 'blade_summoned', 'horror_show', 'unbreakable', 'master_shedim',

            // insect
            'caretaker', 'nymph', 'scout', 'soldier', 'worker', 'queen',

            "carcass", "corpse", "rot", "palefile", "detritus",

            // Howling Shadow
            "anarch", "arboreal", "blackjack", "boggle", "bugul", "chindi", "corpselight", "croki",
            "duende", "ejerian", "elvar", "erinyes", "green_man", "imp", "jarl", "kappa", "kokopelli",
            "morbi", "nocnitsa", "phantom", "preta", "stabber", "tungak", "vucub_caquix",
            
            // Aetherology
            'gum_toad', 'crawler', 'ghasts', 'vryghots', 'gremlin', 'anansi', 'tsuchigumo_warrior',

            // Horror Terrors
            'corps_cadavre',
        ]

        const specialMapping = new Map([
            ['Noxious Spirit', 'toxic_air'],
            ['Abomination Spirit', 'toxic_beasts'],
            ['Barren Spirit', 'toxic_earth'],
            ['Nuclear Spirit', 'toxic_fire'],
            ['Plague Spirit', 'toxic_man'],
            ['Sludge Spirit', 'toxic_water']
        ]);

        return spiritTypes.find(v => chummerType?.toLowerCase().includes(v)) ?? specialMapping.get(chummerType);
    }
}
