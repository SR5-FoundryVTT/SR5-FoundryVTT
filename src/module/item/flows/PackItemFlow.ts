import { SR5Actor } from "@/module/actor/SR5Actor";
import { SR5Item } from "../SR5Item";
import { FLAGS, SYSTEM_NAME } from "@/module/constants";
import { SR5 } from "@/module/config";
import { Helpers } from "@/module/helpers";

/**
 * Handle interaction with the system packs for predefined items.
 * 
 * This includes all system item packs, including actions and skills.
 */
export const PackItemFlow = {
    /**
     * Return the matrix action pack name to use, when the matrix actions pack is referenced.
     */
    getMatrixActionsPackName(): Shadowrun.PackName {
        const overrideMatrixPackName = game.settings.get(SYSTEM_NAME, FLAGS.MatrixActionsPack) as Shadowrun.PackName;
        return overrideMatrixPackName || SR5.packNames.MatrixActionsPack as Shadowrun.PackName;
    },

    /**
     * Returns the general actions pack name to use, when the general actions pack is referenced.
     */
    getGeneralActionsPackName(): Shadowrun.PackName {
        const overrideGeneralpackName = game.settings.get(SYSTEM_NAME, FLAGS.GeneralActionsPack) as Shadowrun.PackName;
        return overrideGeneralpackName || SR5.packNames.GeneralActionsPack as Shadowrun.PackName;
    },

    /**
     * Return the matrix action pack name to use, when the matrix actions pack is referenced.
     */
    getICActionsPackName(): Shadowrun.PackName {
        const overrideMatrixPackName = game.settings.get(SYSTEM_NAME, FLAGS.ICActionsPack) as Shadowrun.PackName;
        return overrideMatrixPackName || SR5.packNames.ICActionsPack as Shadowrun.PackName;
    },

    /**
     * Return the skills pack name to use, when the skills pack is referenced.
     */
    getSkillsPackName(): Shadowrun.PackName {
        const overrideSkillsPackName = game.settings.get(SYSTEM_NAME, FLAGS.SkillsPack) as Shadowrun.PackName;
        return overrideSkillsPackName || SR5.packNames.SkillsPack as Shadowrun.PackName;
    },

    /**
     * Return the skill sets pack name to use, when the skill sets pack is referenced.
     */
    getSkillSetsPackName(): Shadowrun.PackName {
        const overrideSkillSetsPackName = game.settings.get(SYSTEM_NAME, FLAGS.SkillSetsPack) as Shadowrun.PackName;
        return overrideSkillSetsPackName || SR5.packNames.SkillSetsPack as Shadowrun.PackName;
    },

    /**
     * Return the skill groups pack name to use, when the skill groups pack is referenced.
     */
    getSkillGroupsPackName(): Shadowrun.PackName {
        const overrideSkillGroupsPackName = game.settings.get(SYSTEM_NAME, FLAGS.SkillGroupsPack) as Shadowrun.PackName;
        return overrideSkillGroupsPackName || SR5.packNames.SkillGroupsPack as Shadowrun.PackName;
    },

    /**
     * Retrieve all actions from a given pack.
     *
     * Other item types in that pack will be ignored.
     *
     * TODO: Allow filtering by categories?
     * TODO: Generalize this to search for items of a certain type?
     *
     * @param packName The item pack that contains actions.
     */
    async getPackActions(packName: string): Promise<SR5Item<'action'>[]> {
        console.debug(`Shadowrun 5e | Trying to fetch all actions from pack ${packName}`);
        const pack = game.packs.find(pack => pack.metadata.system === SYSTEM_NAME && pack.metadata.name === packName)as foundry.documents.collections.CompendiumCollection<'Item'> | undefined;
        if (!pack) return [];

        const packEntries = pack.index.filter(data => data.type === 'action');

        const documents: SR5Item<'action'>[] = [];
        for (const packEntry of packEntries) {
            const document = await pack.getDocument(packEntry._id) as unknown as SR5Item<'action'>;
            if (!document) continue;
            documents.push(document);
        }

        console.debug(`Shadowrun5e | Fetched all actions from pack ${packName}`, documents);
        return documents;
    },

    /**
     * Pack document names don't necessarily match what is displayed in the UI.
     *
     * TODO: Why even do this? Does the ui actually not match to the pack document name?
     * @param documentName A string to be transformed. Malformed values will result in empty strings.
     * @returns
     */
    packDocumentName(documentName?: string) {
        // Fail gracefully.
        documentName ??= '';
        // eslint-disable-next-line
        return documentName.toLowerCase().replace(new RegExp(' ', 'g'), '_')
    },

    /**
     * Check packs for a given action.
     *
     * TODO: Use pack and action ids to avoid polluted user namespaces
     *
     * @param packName The metadata name of the pack
     * @param actionName The name of the action within that pack
     */
    async getPackAction(packName: string, actionName: string): Promise<SR5Item | undefined> {
        console.debug(`Shadowrun 5e | Trying to fetch action ${actionName} from pack ${packName}`);
        const pack = game.packs.find(pack =>
            pack.metadata.system === SYSTEM_NAME &&
            (pack.metadata.name === packName || pack.metadata.label === packName));

        if (!pack) return undefined;

        // TODO: Use predefined ids instead of names...
        // TODO: use replaceAll instead, which needs an change to es2021 at least for the ts compiler
        actionName = this.packDocumentName(actionName).toLocaleLowerCase();

        const packEntry = pack.index.find(data => this.packDocumentName(data.name) === actionName);
        if (!packEntry) return undefined;

        const item = await pack.getDocument(packEntry._id) as unknown as SR5Item;
        if (item?.type !== 'action') return undefined;

        console.debug(`Shadowrun5e | Fetched action ${actionName} from pack ${packName}`, item);
        return item;
    },
    /**
     * Collect all actions of an actor.
     *
     * @param actor The actor to collect actions from.
     * @return List of action items the actor has.
     */
    getActions(actor: SR5Actor): SR5Item<'action'>[] {
        const actions = actor.itemsForType.get('action') as SR5Item<'action'>[];
        // Normally all item types should exist, though during actor creation this might not be the case.
        if (!actions) {
            return [];
        }
        return actions;
    },

    /**
     * Collect all actions of an actor for their sheet
     *
     * @param actor The actor to collect actions from.
     * @returns Combined list of pack and actor actions.
     */
    async getActorSheetActions(actor: SR5Actor) {
        const packName = this.getGeneralActionsPackName();
        // Collect all sources for matrix actions.
        const packActions = await this.getPackActions(packName);
        const filteredPackActions = packActions.filter(action => {
            const testName = action.getAction()?.test ?? '';
            if (['DronePerceptionTest', 'DroneInfiltrationTest', 'PilotVehicleTest'].includes(testName)) {
                return actor.isType('vehicle');
            }
            if (testName === 'DrainTest') {
                return actor.isAwakened();
            }
            if (testName === 'FadeTest') {
                return actor.isEmerged();
            }
            if (['NaturalRecoveryPhysicalTest', 'NaturalRecoveryStunTest'].includes(testName)) {
                return false;
            }
            // hide these rolls on some sheets
            if (['Composure', 'Lift Carry', 'Memory', 'Judge Intentions'].includes(action.name)) {
                return !actor.isType('vehicle', 'ic', 'sprite');
            }
            return true;
        })
        const actorActions = this.getActions(actor);
        return [...filteredPackActions, ...actorActions];
    },

    /**
     * Collect all matrix actions of an actor.
     *
     * @param actor The actor to collect matrix actions from.
     * @return List of matrix action items the actor has.
     */
    getMatrixActions(actor: SR5Actor): SR5Item<'action'>[] {
        const actions = actor.itemsForType.get('action') as SR5Item<'action'>[];
        // Normally all item types should exist, though during actor creation this might not be the case.
        if (!actions) {
            return [];
        }
        return actions.filter((action: SR5Item) => action.hasActionCategory('matrix'));
    },
    
    /**
     * Collect all matrix actions of an actor.
     * 
     * @param actor The actor to collect matrix actions from.
     * @returns Combined list of pack and actor matrix actions.
     */
    async getActorMatrixActions(actor: SR5Actor) {
        const matrixPackName = this.getMatrixActionsPackName();
        // Collect all sources for matrix actions.
        const packActions = await this.getPackActions(matrixPackName);
        const actorActions = this.getMatrixActions(actor);
        return [...packActions, ...actorActions];
    },

    /**
     * Localizes a pack action name if a translation exists.
     *
     * Content tends to be the name on an item.
     *
     * @param name The content name to localize.
     * @returns Sheet usable text, either translated or original name.
     */
    localizePackAction(name: string): string {
        return Helpers.localizeName(name, 'SR5.Content.Actions');
    },

    /**
     * Retrieve all skill items from the configured skills pack.
     *
     * @returns Array of skill items from the pack.
     */
    async getPackSkills(): Promise<SR5Item<'skill'>[]> {
        const packName = this.getSkillsPackName();
        console.debug(`Shadowrun 5e | Trying to fetch all skills from pack ${packName}`);
        const pack = game.packs.find(pack => pack.metadata.system === SYSTEM_NAME && pack.metadata.name === packName) as foundry.documents.collections.CompendiumCollection<'Item'> | undefined;
        if (!pack) return [];

        const packEntries = pack.index.filter(data => data.type === 'skill');

        const documents: SR5Item<'skill'>[] = [];
        for (const packEntry of packEntries) {
            const document = await pack.getDocument(packEntry._id) as unknown as SR5Item<'skill'>;
            if (!document) continue;
            documents.push(document);
        }

        console.debug(`Shadowrun5e | Fetched all skills from pack ${packName}`, documents);
        return documents;
    },

    /**
     * Retrieve a single skill set item from the configured pack.
     *
     * @param name The name of the skill set to retrieve.
     * @returns The skill set item, or undefined if not found.
     */
    async getPackSkillSet(name: string) {
        if (!name) return;
        const packName = this.getSkillSetsPackName();
        const pack = game.packs.find(pack => pack.metadata.system === SYSTEM_NAME && pack.metadata.name === packName) as foundry.documents.collections.CompendiumCollection<'Item'> | undefined;
        if (!pack) return;

        const packEntry = pack.index.find(data => data.type === 'skill' && data.name === name);
        if (!packEntry) return;

        const document = await pack.getDocument(packEntry._id) as unknown as SR5Item<'skill'>;
        if (!document.isType('skill')) {
            console.error(`Shadowrun 5e | Document ${name} in pack ${packName} is not of type skill`, document);
            return;
        };
        return document;
    },

    /**
     * Retrieve all skills defined in a skill set.
     * 
     * @param name Skill set name to retrieve from the pack and get skills for.
     * @returns A list of skills or empty.
     */
    async getSkillsForSkillSet(name: string) {
        const skillset = await PackItemFlow.getPackSkillSet(name);
        if (!skillset) {
            console.error(`Shadowrun 5e | No skill set named ${name} found in pack ${this.getSkillSetsPackName()}`);
            return [];
        }
        if (skillset.system.type !== 'set') {
            console.error(`Shadowrun 5e | Document ${name} in pack ${this.getSkillSetsPackName()} is not of type set`, skillset);
            return [];
        }

        const skillRatings: Record<string, number> = {};
        for (const skill of skillset.system.set.skills) {
            skillRatings[skill.name] = skill.rating;
        }

        // Reduce pack skills down to skill set skills.
        const skills = await PackItemFlow.getPackSkills()
        if (!skills) return [];
        const skillData = skills.map(skill => skill.toObject());

        for (const skill of skillData) {
            if (!Object.hasOwn(skillRatings, skill.name)) continue;

            const rating = skillRatings[skill.name];
            skill.system.skill.rating = rating;
        }

        return skillData;
    }
};
