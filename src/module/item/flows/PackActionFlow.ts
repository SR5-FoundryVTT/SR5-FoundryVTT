import { SR5Actor } from "@/module/actor/SR5Actor";
import { SR5Item } from "../SR5Item";
import { FLAGS, SYSTEM_NAME } from "@/module/constants";
import { SR5 } from "@/module/config";
import { Helpers } from "@/module/helpers";

/**
 * Handle interaction with the system packs containing predefined actions.
 * 
 * This includes packs like general and matrix actions.
 */
export const PackActionFlow = {
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
        const pack = game.packs.find(pack => pack.metadata.system === SYSTEM_NAME && pack.metadata.name === packName)as CompendiumCollection<'Item'> | undefined;
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
        // eslint-disable-next-line
        const packEntry = pack.index.find(data => this.packDocumentName(data.name) === actionName);
        if (!packEntry) return undefined;

        const item = await pack.getDocument(packEntry._id) as unknown as SR5Item;
        if (!item || item.type !== 'action') return undefined;

        console.debug(`Shadowrun5e | Fetched action ${actionName} from pack ${packName}`, item);
        return item;
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
        const slug = Helpers.transformToLabel(name);
        const label = `SR5.Content.Actions.${slug}`;
        const localized = game.i18n.localize(label);
        return localized === label ? name : localized;
    }
};