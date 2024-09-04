import { SR5Actor } from '../actor/SR5Actor';
import {SR5Item} from "../item/SR5Item";

export type SystemMigrationDocuments = SR5Actor|SR5Item|Scene;

// This interface is used as data container between migration methods and the actual document update.
export interface UpdateData {
    data?: any
    items?: any
    effects?: any
}

/**
 * Converts a game's data model from source version to a target version.
 * Extending classes are only required to handle items, actors, and scenes,
 *  other methods are implementable purely for convenience and atomicity.
 */
export abstract class VersionMigration {
    static readonly MODULE_NAME = 'shadowrun5e';
    static readonly KEY_DATA_VERSION = 'systemMigrationVersion';
    static readonly NO_VERSION = '0';

    private m_Abort: boolean = false;
    private m_AbortReason: string;

    /**
     * The allowed version this migrator should be able to operate on.
     */
    public abstract get SourceVersion(): string;
    /**
     * The resulting version this migrator will produce.
     */
    public abstract get TargetVersion(): string;

    public get SourceVersionFriendlyName(): string {
        return `v${this.SourceVersion}`;
    }
    public get TargetVersionFriendlyName(): string {
        return `v${this.TargetVersion}`;
    }

    /**
     * Flag the migration to be aborted.
     * @param reason The reason that the migration must be aborted, to be displayed
     *  to the user and returned from the migration call.
     */
    protected abort(reason: string): void {
        this.m_Abort = true;
        this.m_AbortReason = reason;
        ui.notifications?.error(`Data migration has been aborted: ${reason}`, { permanent: true });
    }

    /**
     * Show a version specific dialog to the user to inform or confirm about certain migration aspects.
     */
    public async AskForUserConsentAndConfiguration(): Promise<boolean> {
        return true;
    }

    /**
     * Begin migration for the specified game.
     * @param game The world that should be migrated.
     */
    public async Migrate(game: Game) {
        ui.notifications?.info(`${game.i18n.localize('SR5.MIGRATION.BeginNotification')} ${this.SourceVersionFriendlyName} -> ${this.TargetVersionFriendlyName}.`);
        ui.notifications?.warn(game.i18n.localize('SR5.MIGRATION.DoNotCloseNotification'), {
            permanent: true,
        });

        // Map of entities to update, store until later to reduce chance of partial updates
        // which may result in impossible game states.
        const entityUpdates: Map<SystemMigrationDocuments, DocumentUpdate> = new Map();

        // Migrate World Items
        await this.PreMigrateItemData(game, entityUpdates);
        if (this.m_Abort) {
            return Promise.reject(this.m_AbortReason);
        }
        await this.IterateItems(game, entityUpdates);
        await this.PostMigrateItemData(game, entityUpdates);
        if (this.m_Abort) {
            return Promise.reject(this.m_AbortReason);
        }

        // Migrate World Actors
        await this.PreMigrateActorData(game, entityUpdates);
        if (this.m_Abort) {
            return Promise.reject(this.m_AbortReason);
        }
        await this.IterateActors(game, entityUpdates);
        await this.PostMigrateActorData(game, entityUpdates);
        if (this.m_Abort) {
            return Promise.reject(this.m_AbortReason);
        }

        // Migrate Actor Tokens
        await this.PreMigrateSceneData(game, entityUpdates);
        if (this.m_Abort) {
            return Promise.reject(this.m_AbortReason);
        }
        await this.IterateScenes(game, entityUpdates);
        await this.PostMigrateSceneData(game, entityUpdates);
        if (this.m_Abort) {
            return Promise.reject(this.m_AbortReason);
        }

        // Apply the updates, this should *always* work, now that parsing is complete.
        await this.Apply(entityUpdates);

        await game.settings.set(VersionMigration.MODULE_NAME, VersionMigration.KEY_DATA_VERSION, this.TargetVersion);
        ui.notifications?.info(`${game.i18n.localize('SR5.MIGRATION.SuccessNotification')} ${this.TargetVersion}.`, { permanent: true });
    }

    /**
     * Applies the specified mapping of entities, iteratively updating each.
     * @param documentUpdates A mapping of document updateData pairs.
     */
    protected async Apply(documentUpdates: Map<SystemMigrationDocuments, DocumentUpdate>) {
        for (const [entity, { updateData, embeddedItems }] of documentUpdates) {
            
            // v9 -> v10 workaround, should be removed when safe.
            const updateSystem = updateData?.data ? {system: updateData.data} : updateData;

            if (embeddedItems !== null) {
                const actor = entity as SR5Actor;
                await actor.updateEmbeddedDocuments('Item', embeddedItems);
            }

            if (updateData !== null ) {
                await entity.update(updateSystem, { enforceTypes: false });
            }
        }
    }

    /**
     * Iterate through all scenes and migrate each if needed.
     * @param game
     * @param entityUpdates
     */
    protected async IterateScenes(game: Game, entityUpdates: Map<SystemMigrationDocuments, DocumentUpdate>) {
        // @ts-expect-error // ignore null state
        for (const scene of game.scenes.contents) {
            try {
                if (!(await this.ShouldMigrateSceneData(scene))) {
                    continue;
                }

                // Migrate SceneData itself.
                console.log(`Migrating Scene entity ${scene.name}`);
                const updateData = await this.MigrateSceneData(scene);

                foundry.utils.expandObject(updateData);
                entityUpdates.set(scene, {
                    updateData,
                    embeddedItems: null,
                    embeddedEffects: null,
                });

                // Migrate embedded TokenDocument / ActorData within SceneData
                for (const token of scene.data.tokens) {
                    // Don't migrate tokens without or a linked actor.
                    if (!token.actor || token.data.actorLink) continue;
                    
                    //@ts-expect-error // TODO: foundry-vtt-types v10
                    if (foundry.utils.isEmpty(token.actor)) continue;

                    const updateData = await this.MigrateActorData(token.actor);

                    foundry.utils.expandObject(updateData);
                    entityUpdates.set(token.actor, {
                        updateData: updateData.data || null,
                        embeddedItems: updateData.items || null,
                        embeddedEffects: updateData.effects || null
                    });
                }

                //@ts-expect-error // TODO: foundry-vtt-types v10
                if (foundry.utils.isEmpty(updateData)) {
                    continue;
                }

                foundry.utils.expandObject(updateData);
                entityUpdates.set(scene, {
                    updateData,
                    embeddedItems: null,
                    embeddedEffects: null
                });
            } catch (error) {
                console.error(error);
                return Promise.reject(error);
            }
        }
    }
    /**
     * Iterate through all items and migrate each if needed.
     * @param game The game to be updated.
     * @param entityUpdates The current map of document updates.
     */
    protected async IterateItems(game: Game, entityUpdates: Map<SystemMigrationDocuments, DocumentUpdate>) {
        // @ts-expect-error // ignore null state
        for (const item of game.items.contents) {
            try {
                if (!(await this.ShouldMigrateItemData(item))) {
                    continue;
                }

                console.log(`Migrating Item: ${item.name}`);
                const updateData = await this.MigrateItemData(item);

                //@ts-expect-error // TODO: foundry-vtt-types v10
                if (foundry.utils.isEmpty(updateData)) {
                    continue;
                }

                foundry.utils.expandObject(updateData);
                entityUpdates.set(item, {
                    updateData,
                    embeddedItems: null,
                    embeddedEffects: updateData.effects || null
                });
            } catch (error) {
                console.error(error);
                return Promise.reject(error);
            }
        }
    }
    /**
     * Iterate through all actors and migrate each if needed.
     * @param game The game to be updated.
     * @param entityUpdates The current map of document updates.
     */
    protected async IterateActors(game: Game, entityUpdates: Map<SystemMigrationDocuments, DocumentUpdate>) {
        // @ts-expect-error // ignore null state
        for (const actor of game.actors.contents) {
            try {
                if (!(await this.ShouldMigrateActorData(actor))) {
                    continue;
                }

                console.log(`Migrating Actor ${actor.name}`);
                console.log(actor);
                const updateData = await this.MigrateActorData(actor);
                console.log(updateData);
                let items = [];
                if (updateData.items) {
                    items = updateData.items;
                    delete updateData.items;
                }

                foundry.utils.expandObject(updateData);

                entityUpdates.set(actor, {
                    updateData,
                    embeddedItems: items,
                    embeddedEffects: updateData.effects || null
                });
            } catch (error) {
                console.error(error);
                return Promise.reject(error);
            }
        }
    }

    /**
     * Iterate over an actor's items, updating those that need updating.
     * @param actor The actor to iterate over
     * @param updateData The existing update data to merge into
     */
    protected async IterateActorItems(actor: SR5Actor, updateData) {
        let hasItemUpdates = false;
        if (actor.items !== undefined) {
            const items = await Promise.all(
                actor.items.map(async (item) => {
                    if (item instanceof SR5Item) console.error('Shadowrun 5e | Migration encountered an Item when it should have encountered ItemData / Object');
                    if (!await this.ShouldMigrateItemData(item)) return item;
                    const itemUpdate = await this.MigrateItemData(item);

                    hasItemUpdates = true;
                    itemUpdate['_id'] = item.id;

                    return foundry.utils.mergeObject(item, itemUpdate.data, {
                        enforceTypes: false,
                        inplace: false,
                    });
                }),
            );
            if (hasItemUpdates) {
                updateData.items = items;
            }
        }

        return updateData;
    }

    /**
     * Check if a scene requires updates.
     * @param scene The scene to check.
     * @return A promise that resolves true or false.
     */
    protected async ShouldMigrateSceneData(scene: Scene): Promise<boolean> {
        return false;
    }
    /**
     * Migrate the specified scene's data.
     * @param scene The scene to migrate.
     * @return A promise that resolves with the update data.
     */
    protected async MigrateSceneData(scene: Scene): Promise<UpdateData> {
        return {};
    }
    /**
     * Do something right before scene data is migrated.
     * @param game The game to be updated.
     * @param entityUpdates The current map of document updates.
     */
    protected async PreMigrateSceneData(game: Game, entityUpdates: Map<SystemMigrationDocuments, DocumentUpdate>): Promise<void> {}
    /**
     * Do something right before scene data is migrated.
     * @param game The game to be updated.
     * @param entityUpdates The current map of document updates.
     */
    protected async PostMigrateSceneData(game: Game, entityUpdates: Map<SystemMigrationDocuments, DocumentUpdate>): Promise<void> {}

    /**
     * Check if an item requires updates.
     * @param item The item to check.
     * @return A promise that resolves true or false.
     */
    protected async ShouldMigrateItemData(item: SR5Item): Promise<boolean> {
        return false;
    }
    /**
     * Migrate the specified item's data.
     * @param item The item to migrate.
     * @return A promise that resolves with the update data.
     */
    protected async MigrateItemData(item: SR5Item): Promise<UpdateData> {
        return {};
    }
    /**
     * Do something right before item data is migrated.
     * @param game The game to be updated.
     * @param entityUpdates The current map of document updates.
     */
    protected async PreMigrateItemData(game: Game, entityUpdates: Map<SystemMigrationDocuments, DocumentUpdate>): Promise<void> {}
    /**
     * Do something right before item data is migrated.
     * @param game The game to be updated.
     * @param entityUpdates The current map of document updates.
     */
    protected async PostMigrateItemData(game: Game, entityUpdates: Map<SystemMigrationDocuments, DocumentUpdate>): Promise<void> {}

    /**
     * Check if an actor requires updates.
     * @param actor The actor to check.
     * @return A promise that resolves true or false.
     */
    protected async ShouldMigrateActorData(actor: SR5Actor): Promise<boolean> {
        return false;
    }
    /**
     * Migrate the specified actor's data.
     * @param actor The actor to migrate.
     * @return A promise that resolves with the update data.
     */
    protected async MigrateActorData(actor: SR5Actor): Promise<UpdateData> {
        return {};
    }
    /**
     * Do something right before actor data is migrated.
     * @param game The game to be updated.
     * @param entityUpdates The current map of document updates.
     */
    protected async PreMigrateActorData(game: Game, entityUpdates: Map<SystemMigrationDocuments, DocumentUpdate>): Promise<void> {}
    /**
     * Do something right after actor data is migrated.
     * @param game The game to be updated.
     * @param entityUpdates The current map of document updates.
     */
    protected async PostMigrateActorData(game: Game, entityUpdates: Map<SystemMigrationDocuments, DocumentUpdate>): Promise<void> {}

    /**
     * Migrate a compendium pack
     * @param pack
     */
    public async MigrateCompendiumPack(pack: CompendiumCollection<CompendiumCollection.Metadata>) {
        if (!['Actor', 'Item', 'Scene'].includes(pack.metadata.type)) return;

        // Begin by requesting server-side data model migration and get the migrated content
        await pack.migrate({});
        const documents = await pack.getDocuments();

        // Iterate over compendium entries - applying fine-tuned migration functions
        for (let document of documents) {
            try {
                let updateData: any = null;
                if (pack.metadata.type === 'Item') {
                    // @ts-expect-error // TODO: vtt-types v9 document.data.type check added to type gate... but didn't work
                    updateData = await this.MigrateItemData(document);

                    //@ts-expect-error // TODO: foundry-vtt-types v10
                    if (foundry.utils.isEmpty(updateData)) {
                        continue;
                    }

                    if (updateData.data) {
                        foundry.utils.expandObject(updateData.data);
                        document.update({system: updateData.data});
                    }

                } else if (pack.metadata.type === 'Actor') {
                    //@ts-expect-error
                    updateData = await this.MigrateActorData(document);

                    //@ts-expect-error // TODO: foundry-vtt-types v10
                    if (foundry.utils.isEmpty(updateData)) {
                        continue;
                    }

                    if (updateData.items) {
                        await document.updateEmbeddedDocuments('Item', updateData.items);
                    }

                    if (updateData.effects) {
                        await document.updateEmbeddedDocuments('Effect', updateData.effects);
                    }

                    if (updateData.data) {
                        foundry.utils.expandObject(updateData.data);
                        await document.update({system: updateData.data});
                    }

                } else if (pack.metadata.type === 'Scene') {
                    updateData = await this.MigrateSceneData(document as unknown as Scene);

                    //@ts-expect-error // TODO: foundry-vtt-types v10
                    if (foundry.utils.isEmpty(updateData)) {
                        continue;
                    }

                    if (updateData.data) {
                        foundry.utils.expandObject(updateData.data);
                        await document.update(updateData.data);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        }
        console.log(`Migrated all ${pack.metadata.type} entities from Compendium ${pack.collection}`);
    }
}

type DocumentUpdate = {
    updateData: any;
    embeddedItems: null | any[];
    embeddedEffects: null | any[];
};
