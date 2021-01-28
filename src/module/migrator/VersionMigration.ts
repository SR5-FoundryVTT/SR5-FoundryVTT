import { SR5Actor } from '../actor/SR5Actor';

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
        // @ts-ignore
        ui.notifications.error(`Data migration has been aborted: ${reason}`, { permanent: true });
    }

    /**
     * Begin migration for the specified game.
     * @param game The world that should be migrated.
     */
    public async Migrate(game: Game) {
        // @ts-ignore TODO Unignore when Foundry Types updates
        ui.notifications.info(`${game.i18n.localize('SR5.MIGRATION.BeginNotification')} ${this.SourceVersionFriendlyName} -> ${this.TargetVersionFriendlyName}.`);
        // @ts-ignore TODO Unignore when Foundry Types updates
        ui.notifications.warn(game.i18n.localize('SR5.MIGRATION.DoNotCloseNotification'), {
            permanent: true,
        });

        // Map of entities to update, store until later to reduce chance of partial updates
        // which may result in impossible game states.
        const entityUpdates: Map<Entity, EntityUpdate> = new Map<Entity, EntityUpdate>();

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
        // @ts-ignore TODO Unignore when Foundry Types updates
        ui.notifications.info(`${game.i18n.localize('SR5.MIGRATION.SuccessNotification')} ${this.TargetVersion}.`, { permanent: true });
    }

    /**
     * Applies the specified mapping of entities, iteratively updating each.
     * @param entityUpdates A mapping of entity updateData pairs.
     */
    protected async Apply(entityUpdates: Map<Entity, EntityUpdate>) {
        for (const [entity, { updateData, embeddedItems }] of entityUpdates) {
            if (embeddedItems !== null) {
                const actor = entity as SR5Actor;
                await actor.updateOwnedItem(embeddedItems);
            }
            await entity.update(updateData, { enforceTypes: false });
        }
    }

    /**
     * Iterate through all scenes and migrate each if needed.
     * @param game
     * @param entityUpdates
     */
    protected async IterateScenes(game: Game, entityUpdates: Map<Entity, EntityUpdate>) {
        //@ts-ignore  // TypeScript expects entries (Collection.entries) to be a call, yet it's a get property.
        for (const scene of game.scenes.entries) {
            try {
                if (!(await this.ShouldMigrateSceneData(scene))) {
                    continue;
                }

                if (scene._id === 'MAwSFhlXRipixOWw') {
                    console.log('Scene Pre-Update');
                    console.log(scene);
                }

                console.log(`Migrating Scene entity ${scene.name}`);
                const updateData = await this.MigrateSceneData(duplicate(scene.data));

                let hasTokenUpdates = false;
                updateData.tokens = await Promise.all(
                    // @ts-ignore
                    scene.data.tokens.map(async (token) => {
                        if (isObjectEmpty(token.actorData)) {
                            return token;
                        }

                        let tokenDataUpdate = await this.MigrateActorData(token.actorData);
                        if (!isObjectEmpty(tokenDataUpdate)) {
                            hasTokenUpdates = true;
                            tokenDataUpdate['_id'] = token._id;

                            const newToken = duplicate(token);
                            newToken.actorData = await mergeObject(token.actorData, tokenDataUpdate, {
                                enforceTypes: false,
                                inplace: false,
                            });
                            console.log(newToken);
                            return newToken;
                        } else {
                            return token;
                        }
                    }),
                );
                if (scene._id === 'MAwSFhlXRipixOWw') {
                    console.log('Scene Pre-Update');
                    console.log(scene);
                }

                if (isObjectEmpty(updateData)) {
                    continue;
                }

                expandObject(updateData);
                entityUpdates.set(scene, {
                    updateData,
                    embeddedItems: null,
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
     * @param entityUpdates The current map of entity updates.
     */
    protected async IterateItems(game: Game, entityUpdates: Map<Entity, EntityUpdate>) {
        for (const item of game.items.entities) {
            try {
                if (!(await this.ShouldMigrateItemData(item.data))) {
                    continue;
                }

                console.log(`Migrating Item: ${item.name}`);
                const updateData = await this.MigrateItemData(item.data);

                if (isObjectEmpty(updateData)) {
                    continue;
                }

                expandObject(updateData);
                entityUpdates.set(item, {
                    updateData,
                    embeddedItems: null,
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
     * @param entityUpdates The current map of entity updates.
     */
    protected async IterateActors(game: Game, entityUpdates: Map<Entity, EntityUpdate>) {
        for (const actor of game.actors.entities) {
            try {
                if (!(await this.ShouldMigrateActorData(actor.data))) {
                    continue;
                }

                console.log(`Migrating Actor ${actor.name}`);
                console.log(actor);
                const updateData = await this.MigrateActorData(duplicate(actor.data));
                console.log(updateData);
                let items = [];
                if (updateData.items) {
                    items = updateData.items;
                    delete updateData.items;
                }

                expandObject(updateData);

                entityUpdates.set(actor, {
                    updateData,
                    embeddedItems: items,
                });
            } catch (error) {
                console.error(error);
                return Promise.reject(error);
            }
        }
    }

    /**
     * Iterate over an actor's items, updating those that need updating.
     * @param actorData The actor to iterate over
     * @param updateData The existing update data to merge into
     */
    protected async IterateActorItems(actorData: Actor.Data, updateData) {
        let hasItemUpdates = false;
        // @ts-ignore
        if (actorData.items !== undefined) {
            const items = await Promise.all(
                // @ts-ignore
                actorData.items.map(async (item) => {
                    let itemUpdate = await this.MigrateItemData(item);

                    if (!isObjectEmpty(itemUpdate)) {
                        hasItemUpdates = true;
                        itemUpdate['_id'] = item._id;
                        return await mergeObject(item, itemUpdate, {
                            enforceTypes: false,
                            inplace: false,
                        });
                    } else {
                        return item;
                    }
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
    protected async MigrateSceneData(scene: any): Promise<any> {
        return {};
    }
    /**
     * Do something right before scene data is migrated.
     * @param game The game to be updated.
     * @param entityUpdates The current map of entity updates.
     */
    protected async PreMigrateSceneData(game: Game, entityUpdates: Map<Entity, EntityUpdate>): Promise<void> {}
    /**
     * Do something right before scene data is migrated.
     * @param game The game to be updated.
     * @param entityUpdates The current map of entity updates.
     */
    protected async PostMigrateSceneData(game: Game, entityUpdates: Map<Entity, EntityUpdate>): Promise<void> {}

    /**
     * Check if an item requires updates.
     * @param item The item to check.
     * @return A promise that resolves true or false.
     */
    protected async ShouldMigrateItemData(item: Entity.Data): Promise<boolean> {
        return false;
    }
    /**
     * Migrate the specified item's data.
     * @param item The item to migrate.
     * @return A promise that resolves with the update data.
     */
    protected async MigrateItemData(item: Entity.Data): Promise<any> {
        return {};
    }
    /**
     * Do something right before item data is migrated.
     * @param game The game to be updated.
     * @param entityUpdates The current map of entity updates.
     */
    protected async PreMigrateItemData(game: Game, entityUpdates: Map<Entity, EntityUpdate>): Promise<void> {}
    /**
     * Do something right before item data is migrated.
     * @param game The game to be updated.
     * @param entityUpdates The current map of entity updates.
     */
    protected async PostMigrateItemData(game: Game, entityUpdates: Map<Entity, EntityUpdate>): Promise<void> {}

    /**
     * Check if an actor requires updates.
     * @param actor The actor to check.
     * @return A promise that resolves true or false.
     */
    protected async ShouldMigrateActorData(actor: Actor.Data): Promise<boolean> {
        return false;
    }
    /**
     * Migrate the specified actor's data.
     * @param actor The actor to migrate.
     * @return A promise that resolves with the update data.
     */
    protected async MigrateActorData(actor: Actor.Data): Promise<any> {
        return {};
    }
    /**
     * Do something right before actor data is migrated.
     * @param game The game to be updated.
     * @param entityUpdates The current map of entity updates.
     */
    protected async PreMigrateActorData(game: Game, entityUpdates: Map<Entity, EntityUpdate>): Promise<void> {}
    /**
     * Do something right after actor data is migrated.
     * @param game The game to be updated.
     * @param entityUpdates The current map of entity updates.
     */
    protected async PostMigrateActorData(game: Game, entityUpdates: Map<Entity, EntityUpdate>): Promise<void> {}

    /**
     * Migrate a compendium pack
     * @param pack
     */
    public async MigrateCompendiumPack(pack: Compendium) {
        const entity = pack.metadata.entity;
        if (!['Actor', 'Item', 'Scene'].includes(entity)) return;

        // Begin by requesting server-side data model migration and get the migrated content
        await pack.migrate({});
        const content = await pack.getContent();

        // Iterate over compendium entries - applying fine-tuned migration functions
        for (let ent of content) {
            try {
                let updateData: any = null;
                if (entity === 'Item') {
                    updateData = await this.MigrateItemData(ent.data);

                    if (isObjectEmpty(updateData)) {
                        continue;
                    }

                    expandObject(updateData);
                    updateData['_id'] = ent._id;
                    await pack.updateEntity(updateData);
                    // TODO: Uncomment when foundry allows embeddeds to be updated in packs
                    // } else if (entity === 'Actor') {
                    //     updateData = await this.MigrateActorData(ent.data);
                    //
                    //     if (isObjectEmpty(updateData)) {
                    //         continue;
                    //     }
                    //
                    //     updateData['_id'] = ent._id;
                    //     await pack.updateEntity(updateData);
                } else if (entity === 'Scene') {
                    updateData = await this.MigrateSceneData(ent.data);

                    if (isObjectEmpty(updateData)) {
                        continue;
                    }

                    expandObject(updateData);
                    updateData['_id'] = ent._id;
                    await pack.updateEntity(updateData);
                }
            } catch (err) {
                console.error(err);
            }
        }
        console.log(`Migrated all ${entity} entities from Compendium ${pack.collection}`);
    }
}

type EntityUpdate = {
    updateData: any;
    embeddedItems: null | any[];
};
