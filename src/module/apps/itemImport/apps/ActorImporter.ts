import { CharacterImporter } from "../../importer/actorImport/characterImporter/CharacterImporter";
import { SpiritImporter } from "../../importer/actorImport/spiritImporter/SpiritImporter";
import { SpriteImporter } from "../../importer/actorImport/spriteImporter/SpriteImporter";

import AppV2 = foundry.applications.api.ApplicationV2;
import { ActorFile, ActorSchema } from "../../importer/actorImport/ActorSchema";
import { ImportHelper as IH } from "../helper/ImportHelper";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

interface ImporterContext extends AppV2.RenderContext {
    folders: { id: string, name: string }[]
};

export class ActorImporter extends HandlebarsApplicationMixin(ApplicationV2<ImporterContext>) {
    private static readonly characterImporter = new CharacterImporter();
    private static readonly spiritImporter = new SpiritImporter();
    private static readonly spriteImporter = new SpriteImporter();
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
        },
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
        return "Chummer/Data Import";
    }

    override async _prepareContext(options?: any) {
        const baseContext = await super._prepareContext(options);
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

    private async handleActorImport(event) {
        // Get the JSON input from the textarea
        const textarea = document.getElementById('chummer-input') as HTMLTextAreaElement;
        const jsonText = textarea?.value.trim();

        if(!game.user?.can("ACTOR_CREATE")) {
            ui.notifications?.error(game.i18n.format("SR5.VehicleImport.MissingPermission"))
            return;
        }

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
        if (actorData.metatype_english?.toLowerCase().includes('sprite')) {
            await ActorImporter.spriteImporter.import(actorData, importOptions);
        } else if (spiritType) {
            await ActorImporter.spiritImporter.import(actorData, spiritType, importOptions);
        } else {
            await ActorImporter.characterImporter.import(actorData, importOptions);
        }
    }

    protected override async _onRender(
        ...[context, options]: Parameters<AppV2["_onRender"]>
    ): Promise<void> {
        await super._onRender(context, options);

        const importBtn = this.element.querySelector<HTMLButtonElement>("#chummer-import-button");
        importBtn?.addEventListener("click", (event) => { void this.handleActorImport(event);});
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
