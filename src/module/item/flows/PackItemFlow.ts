import { SkillNamingFlow } from '@/module/flows/SkillNamingFlow';
import { SR5Actor } from "@/module/actor/SR5Actor";
import { SR5Item } from "../SR5Item";
import { FLAGS, SYSTEM_NAME } from "@/module/constants";
import { SR5 } from "@/module/config";
import { Helpers } from "@/module/helpers";

import CompendiumCollection = foundry.documents.collections.CompendiumCollection;

/**
 * Handle interaction with the system packs for predefined items.
 * 
 * This includes all system item packs, including actions and skills.
 */
export const PackItemFlow = {
    _packSkillsCache: new Map<string, Promise<SR5Item<'skill'>[]>>(),
    _packSkillGroupsCache: new Map<string, Promise<SR5Item<'skill'>[]>>(),
    _packSkillSetsCache: new Map<string, Promise<SR5Item<'skill'>[]>>(),

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
     * Resolve a configured SR5 item compendium pack by metadata name.
     *
     * @param packName The metadata name of the pack.
     * @param options.matchLabel Also accept the pack label. Needed where users supply the pack name
     *                           themselves, as they can't be expected to know the metadata name.
     */
    getItemPack(packName: string, options: { matchLabel?: boolean } = {}): CompendiumCollection<'Item'> | undefined {
        return game.packs.find(
            pack => pack.metadata.system === SYSTEM_NAME
            && pack.documentName === 'Item'
            && (pack.metadata.name === packName || (!!options.matchLabel && pack.metadata.label === packName))
        ) as CompendiumCollection<'Item'> | undefined;
    },

    /**
     * A pack document retrieval helper for typed items.
     * @param pack The pack to retrieve documents from.
     * @param entryIds The list of ids to retrieve
     * @returns A list of documents of the given type.
     */
    async getPackDocuments<T extends Item.ConfiguredSubType>(
        pack: CompendiumCollection<'Item'>,
        entryIds: string[]
    ): Promise<SR5Item<T>[]> {
        if (entryIds.length === 0) return [];

        return await pack.getDocuments({ _id__in: entryIds }) as unknown as SR5Item<T>[];
    },

    /**
     * A pack document retrieval helper for a single typed item.
     * @param pack The pack to retrieve documents from.
     * @param entryId The id of the document to retrieve
     * @returns The document of the given type, or undefined if not found.
     */
    async getSinglePackDocument<T extends Item.ConfiguredSubType>(
        pack: CompendiumCollection<'Item'>,
        entryId: string
    ) {
        return await pack.getDocument(entryId) as unknown as SR5Item<T> | undefined;
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
     * Memoize pack-document loading by key, including in-flight promises.
     */
    async getCachedPackDocuments<T>(
        cache: Map<string, Promise<T>>,
        key: string,
        loader: () => Promise<T>
    ): Promise<T> {
        const cached = cache.get(key);
        if (cached) return await cached;

        const loading = loader().catch(error => { cache.delete(key); throw error; });
        cache.set(key, loading);
        return await loading;
    },

    /**
     * Retrieve skill items from one of the configured skill packs, memoized per pack.
     *
     * @param cache The cache bucket belonging to the given pack.
     * @param packName The configured pack to read skill items from.
     * @param subType Only return skill items of this sub type. Omit to return all of them.
     * @returns Array of skill items, owned by the caller.
     */
    async getCachedSkillItems(
        cache: Map<string, Promise<SR5Item<'skill'>[]>>,
        packName: string,
        subType?: 'group' | 'set'
    ): Promise<SR5Item<'skill'>[]> {
        const label = subType ? `skill ${subType}s` : 'skills';

        // Resolve the pack before reading the cache, so a pack that's missing right now isn't
        // memoized as an empty result for the rest of the session.
        const pack = this.getItemPack(packName);
        if (!pack) return [];

        const documents = await this.getCachedPackDocuments(cache, packName, async () => {
            console.debug(`Shadowrun 5e | Trying to fetch all ${label} from pack ${packName}`);

            const packEntryIds = pack.index.filter(data => data.type === 'skill').map(data => data._id);
            const skills = await this.getPackDocuments<'skill'>(pack, packEntryIds);
            const documents = subType ? skills.filter(skill => skill.system.type === subType) : skills;

            console.debug(`Shadowrun5e | Fetched all ${label} from pack ${packName}`, documents);
            return documents;
        });

        // Callers treat the result as a list of their own and add to it, so hand out a copy
        // instead of the cached array itself.
        return [...documents];
    },

    /**
     * Remove all skill-related cache buckets.
     */
    invalidateAllSkillCaches() {
        this._packSkillsCache.clear();
        this._packSkillGroupsCache.clear();
        this._packSkillSetsCache.clear();
    },

    /**
     * Prime configured skill caches once to reduce first-use latency.
     */
    async warmSkillCaches() {
        try {
            await Promise.all([
                this.getPackSkills(),
                this.getPackSkillgroups(),
                this.getAllPackSkillSets(),
            ]);
        } catch (error) {
            console.warn('Shadowrun 5e | Failed warming skill pack caches. Falling back to lazy loading.', error);
        }
    },

    /**
     * Reset and warm all skill caches after settings changes.
     */
    refreshSkillCachesForConfiguredPacks() {
        this.invalidateAllSkillCaches();
        void this.warmSkillCaches();
    },

    /**
     * React to a compendium whose contents changed by invalidating the caches reading from it.
     *
     * Driven by the updateCompendium hook, which fires once per modification operation on every
     * connected client. Using the per document item hooks instead would re-fetch each pack once
     * per changed document, turning a bulk write into as many full reloads.
     *
     * @param packName The metadata name of the pack that changed.
     */
    handleCompendiumMutation(packName: string) {
        if (!packName) return;

        const caches: [string, Map<string, Promise<SR5Item<'skill'>[]>>][] = [
            [this.getSkillsPackName(), this._packSkillsCache],
            [this.getSkillGroupsPackName(), this._packSkillGroupsCache],
            [this.getSkillSetsPackName(), this._packSkillSetsCache],
        ];

        let affected = false;
        for (const [configuredPackName, cache] of caches) {
            if (configuredPackName !== packName) continue;
            cache.delete(packName);
            affected = true;
        }

        if (affected) void this.warmSkillCaches();
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
        const pack = this.getItemPack(packName);
        if (!pack) return [];

        const packEntryIds = pack.index.filter(data => data.type === 'action').map(data => data._id);
        const documents = await this.getPackDocuments<'action'>(pack, packEntryIds);

        console.debug(`Shadowrun5e | Fetched all actions from pack ${packName}`, documents);
        return documents;
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
        // Reachable from macros through SR5Actor#packActionTest, where the pack is named by a user.
        const pack = this.getItemPack(packName, { matchLabel: true });

        if (!pack) return undefined;

        // TODO: Use predefined ids instead of names...
        // TODO: use replaceAll instead, which needs an change to es2021 at least for the ts compiler
        actionName = this.packDocumentName(actionName).toLocaleLowerCase();

        const packEntry = pack.index.find(data => this.packDocumentName(data.name) === actionName);
        if (!packEntry) return undefined;

        const item = await this.getSinglePackDocument<'action'>(pack, packEntry._id);
        if (item?.type !== 'action') return undefined;

        console.debug(`Shadowrun5e | Fetched action ${actionName} from pack ${packName}`, item);
        return item;
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
        const actorActions = actor.itemsForType.get('action') ?? [];
        return [...filteredPackActions, ...actorActions];
    },

    /**
     * Collect all matrix actions of an actor.
     *
     * @param actor The actor to collect matrix actions from.
     * @return List of matrix action items the actor has.
     */
    getMatrixActions(actor: SR5Actor): SR5Item<'action'>[] {
        const actions = actor.itemsForType.get('action') ?? [];
        return actions.filter((action: SR5Item) => action.hasActionCategory('matrix'));
    },

    /**
     * Retrieve matrix actions from the configured matrix actions pack.
     *
     * Only actions with the matrix category are returned to avoid showing unrelated actions.
     */
    async getMatrixPackActions(): Promise<SR5Item<'action'>[]> {
        const matrixPackName = this.getMatrixActionsPackName();
        const packActions = await this.getPackActions(matrixPackName);
        return packActions.filter(action => action.hasActionCategory('matrix'));
    },

    /**
     * Collect all matrix actions of an actor.
     * 
     * @param actor The actor to collect matrix actions from.
     * @returns Combined list of pack and actor matrix actions.
     */
    async getActorMatrixActions(actor: SR5Actor) {
        const packActions = await this.getMatrixPackActions();
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
        return this.getCachedSkillItems(this._packSkillsCache, this.getSkillsPackName());
    },

    /**
     * Retrieve all skill items of type group from the configured skill groups pack.
     *
     * @returns Array of skill group items from the pack.
     */
    async getPackSkillgroups(): Promise<SR5Item<'skill'>[]> {
        return this.getCachedSkillItems(this._packSkillGroupsCache, this.getSkillGroupsPackName(), 'group');
    },

    /**
     * Retrieve all skillsets from the configured pack.
     */
    async getAllPackSkillSets(): Promise<SR5Item<'skill'>[]> {
        return this.getCachedSkillItems(this._packSkillSetsCache, this.getSkillSetsPackName(), 'set');
    },

    /**
     * Retrieve all skills and skill groups defined in a skill set in a single pass.
     *
     * This avoids repeatedly fetching skill group data for the same skill set preparation.
     */
    async prepareSkillSetItems(skillSet: SR5Item<'skill'>): Promise<{ skills: Item.CreateData[]; groups: Item.CreateData[] }> {
        if (skillSet.system.type !== 'set') {
            console.error(`Shadowrun 5e | Document ${skillSet.name} in pack ${this.getSkillSetsPackName()} is not of type set`, skillSet);
            return { skills: [], groups: [] };
        }

        // Collect data for skills.
        const setSkills = new Map<string, number>();
        const skillSpecs = new Map<string, string[]>();
        for (const skill of skillSet.system.set.skills) {
            const skillKey = SkillNamingFlow.nameToKey(skill.name);
            if (!skillKey) continue;
            setSkills.set(skillKey, skill.rating);
            skillSpecs.set(skillKey, skill.specializations.map(spec => spec.name));
        }

        // Collect ratings for skills in groups.
        // Apply group ratings last, as they will override skill ratings.
        const skillGroupRatings: Record<string, number> = {};
        for (const group of skillSet.system.set.groups) {
            skillGroupRatings[group.name] = group.rating;
        }

        // Resolve groups once and use them both for the group items and the skill rating overrides.
        const packSkillGroups = await PackItemFlow.getPackSkillgroups();
        const skillGroup = new Map<string, string>();

        const groups = packSkillGroups
            .filter(group => Object.hasOwn(skillGroupRatings, group.name))
            .map(group => group.toObject());

        for (const group of groups) {
            const groupRating = skillGroupRatings[group.name] ?? 0;

            for (const groupSkill of group.system.group.skills) {
                const skillKey = SkillNamingFlow.nameToKey(groupSkill);
                if (!skillKey) continue;
                setSkills.set(skillKey, groupRating);
                skillGroup.set(skillKey, group.name);
            }

            group.system.group.rating = groupRating;
            group.system.source.uuid = skillSet.uuid;

            // @ts-expect-error _id might be non-optional, though we do not want it. Instead of fully retyping, just lie.
            delete group._id;
        }

        // Reduce pack skills down to skill set skills.
        const packSkills = await PackItemFlow.getPackSkills();

        // Inject ratings as defined by set skills and groups.
        const skills = packSkills.flatMap(skill => {
            const skillKey = SkillNamingFlow.nameToKey(skill.name);
            if (!skillKey || !setSkills.has(skillKey)) return [];

            const skillSource = skill.toObject();
            // @ts-expect-error _id might be non-optional, though we do not want it. Instead of fully retyping, just lie.
            delete skillSource._id;

            skillSource.system.skill.rating = setSkills.get(skillKey) ?? skillSource.system.skill.rating;
            skillSource.system.skill.group = skillGroup.get(skillKey) ?? '';
            skillSource.system.skill.specializations = skillSpecs.get(skillKey)?.map(name => ({ name })) ?? [];
            skillSource.system.source.uuid = skillSet.uuid;

            return [skillSource];
        });

        return { skills, groups };
    },

    /**
     * Get all groups in a skill set as their items out of the skill groups pack.
     * @param skillSet Retrieve groups for this skill set.
     */
    async getSkillGroupsForSkillSet(skillSet: SR5Item<'skill'>) {
        const groups = await this.getPackSkillgroups();
        return groups.filter(group => skillSet.system.set.groups.some(setGroup => setGroup.name === group.name));
    },

    /**
     * Retrieve a single skill from the skills pack.
     * @param name The name of the skill to retrieve.
     * @returns The skill item, or undefined if not found.
     */
    async getSkill(name: string) {
        if (!name) return;
        const packName = this.getSkillsPackName();
        const pack = this.getItemPack(packName);
        if (!pack) return;

        // Catch users adding skill to the pack without a name.
        const packEntry = pack.index.find(
            data => data.type === 'skill' && SkillNamingFlow.nameToKey(data.name ?? '') === SkillNamingFlow.nameToKey(name)
        );

        if (!packEntry) return;

        return this.getSinglePackDocument<'skill'>(pack, packEntry._id);
    }
};
