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

    // // TODO: Extract to extendable functions...
    // protected async getMigratedActorItems(
    //     actorData: any,
    //     diffOnly: boolean = true
    // ): Promise<Item[]> {
    //     // Migrate Owned Items
    //     //TODO: When SR5ActorData gets updated, remove ts-ignore
    //     // @ts-ignore
    //     if (!actorData.items) return [];
    //     //TODO: When SR5ActorData gets updated, remove ts-ignore
    //     // @ts-ignore
    //     return await actorData.items.reduce(async (accumulator, item) => {
    //         // Migrate the Owned Item
    //         let migratedItemData = await this.MigrateItemData(item);
    //         if (!isObjectEmpty(migratedItemData)) {
    //             if (!diffOnly) migratedItemData = mergeObject(item, migratedItemData);
    //             // need to copy id over of embedded entities
    //             migratedItemData._id = item._id;
    //             accumulator.then((acc) => acc.push(migratedItemData));
    //         }
    //         return accumulator;
    //     }, Promise.resolve([]));
    // }

    // /**
    //  * Get the Migrated Tokens for a scene
    //  *  returns ALL data, not just changes (scenes need all data for tokens)
    //  * @param sceneData
    //  */
    // protected async getMigratedSceneTokens(sceneData: any): Promise<Token[]> {
    //     if (!sceneData.tokens) return [];
    //     return Promise.all(
    //         duplicate(sceneData.tokens).map(async (t) => {
    //             // if we have nothing useful or are linked, return
    //             if (!t.actorId || t.actorLink || !t.actorData.data) {
    //                 t.actorData = {};
    //                 return t;
    //             }
    //
    //             // create a token from the tokenData
    //             const token = new Token(t);
    //             if (!token.actor) {
    //                 // no actor, no data to migrate
    //                 t.actorId = null;
    //                 t.actorData = {};
    //             } // don't want to update actors that are linked
    //             else {
    //                 const updateData = await this.MigrateActorData(token.data.actorData);
    //                 t.actorData = mergeObject(token.data.actorData, updateData);
    //             }
    //             // migrate token actor items
    //             if (token.data.actorData.items) {
    //                 t.actorData.items = await this.getMigratedActorItems(
    //                     token.data.actorData,
    //                     false
    //                 );
    //             }
    //             return t;
    //         })
    //     );
    // }

    // // TODO: Extract to extendable functions...
    // protected async migrateCompendium(pack) {
    //     const { entity } = pack.metadata;
    //     if (!['Actor', 'Item', 'Scene'].includes(entity)) return;
    //
    //     // Begin by requesting server-side data model migration and get the migrated content
    //     await pack.migrate();
    //     const content = await pack.getContent();
    //
    //     // Iterate over compendium entries - applying fine-tuned migration functions
    //     for (const contentEntity of content) {
    //         try {
    //             let updateData = null;
    //             if (entity === 'Item') updateData = await this.MigrateItemData(contentEntity.data);
    //             else if (entity === 'Actor') {
    //                 updateData = await this.MigrateActorData(contentEntity.data);
    //                 // TODO uncomment when items can be set on compendiums without causing errors
    //                 updateData.items = await this.getMigratedActorItems(contentEntity.data, false);
    //                 updateData._id = contentEntity.data._id;
    //             } else if (entity === 'Scene') { updateData = await this.MigrateSceneData(contentEntity.data); }
    //
    //             if (updateData === null || isObjectEmpty(updateData)) {
    //                 continue;
    //             }
    //
    //             expandObject(updateData);
    //             updateData._id = contentEntity._id;
    //             await pack.updateEntity(updateData);
    //             console.log(
    //                 `Migrated ${entity} entity ${contentEntity.name} in Compendium ${pack.collection}`
    //             );
    //         } catch (error) {
    //             console.error(error);
    //             return Promise.reject(error);
    //         }
    //     }
    //     console.log(`Migrated all ${entity} entities from Compendium ${pack.collection}`);
    // }

    protected async migrateCompendium(pack) {
        const entity = pack.metadata.entity;
        if (!['Actor', 'Item', 'Scene'].includes(entity)) return;

        // Begin by requesting server-side data model migration and get the migrated content
        await pack.migrate();
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
                    // } else if (entity === 'Actor') {
                    //     console.log('-');
                    //     console.log(ent);
                    //     updateData = await this.MigrateActorData(ent.data);
                    //
                    //     if (isObjectEmpty(updateData)) {
                    //         continue;
                    //     }
                    //
                    //     updateData['_id'] = ent._id;
                    //     console.log('push data');
                    //     console.log(updateData);
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

    /**
     * Begin migration for the specified game.
     * @param game The world that should be migrated.
     */
    public async Migrate(game: Game) {
        // @ts-ignore
        ui.notifications.info(`Beginning Shadowrun system migration from version ${this.SourceVersionFriendlyName} to ${this.TargetVersionFriendlyName}.`);
        // @ts-ignore
        ui.notifications.warn(`Please do not close your game or shutdown FoundryVTT.`, {
            permanent: true,
        });

        // Map of entities to update, store until later to reduce chance of partial updates
        // which may result in impossible game states.
        const entityUpdates: Map<Entity, EntityUpdate> = new Map();

        // Migrate World Items
        await this.PreMigrateItemData(game, entityUpdates);
        if (this.m_Abort) {
            return Promise.reject(this.m_AbortReason);
        }

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

        await this.PostMigrateItemData(game, entityUpdates);
        if (this.m_Abort) {
            return Promise.reject(this.m_AbortReason);
        }

        // Migrate World Actors
        await this.PreMigrateActorData(game, entityUpdates);
        if (this.m_Abort) {
            return Promise.reject(this.m_AbortReason);
        }

        for (const actor of game.actors.entities) {
            try {
                if (!(await this.ShouldMigrateActorData(actor.data))) {
                    continue;
                }

                console.log(`Migrating Actor ${actor.name}`);
                const updateData = await this.MigrateActorData(duplicate(actor.data));
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

        await this.PostMigrateActorData(game, entityUpdates);
        if (this.m_Abort) {
            return Promise.reject(this.m_AbortReason);
        }

        // Migrate Actor Tokens
        await this.PreMigrateSceneData(game, entityUpdates);
        if (this.m_Abort) {
            return Promise.reject(this.m_AbortReason);
        }

        for (const scene of game.scenes.entities) {
            try {
                if (!(await this.ShouldMigrateSceneData(scene))) {
                    continue;
                }

                console.log(`Migrating Scene entity ${scene.name}`);
                const updateData = await this.MigrateSceneData(duplicate(scene.data));
                // updateData.tokens = await this.getMigratedSceneTokens(scene.data);
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

        await this.PostMigrateSceneData(game, entityUpdates);
        if (this.m_Abort) {
            return Promise.reject(this.m_AbortReason);
        }

        // Apply the updates, this should *always* work, now that parsing is complete.
        await this.Apply(entityUpdates);

        await game.settings.set(VersionMigration.MODULE_NAME, VersionMigration.KEY_DATA_VERSION, this.TargetVersion);
        // @ts-ignore
        ui.notifications.info(`Shadowrun system migration successfully migrated to version ${this.TargetVersion}.`, { permanent: true });

        return Promise.resolve();
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

        // Migrate World Compendium Packs
        const packs = game.packs.filter((pack) => pack.metadata.package === 'world' && ['Actor', 'Item', 'Scene'].includes(pack.metadata.entity));
        for (const pack of packs) {
            await this.migrateCompendium(pack);
        }
    }

    /**
     * Check if a scene requires updates.
     * @param scene The scene to check.
     * @return A promise that resolves true or false.
     */
    protected abstract async ShouldMigrateSceneData(scene: Scene): Promise<boolean>;
    /**
     * Migrate the specified scene's data.
     * @param scene The scene to migrate.
     * @return A promise that resolves with the update data.
     */
    protected abstract async MigrateSceneData(scene: any): Promise<any>;
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
    protected abstract async ShouldMigrateItemData(item: BaseEntityData): Promise<boolean>;
    /**
     * Migrate the specified item's data.
     * @param item The item to migrate.
     * @return A promise that resolves with the update data.
     */
    protected abstract async MigrateItemData(item: BaseEntityData): Promise<any>;
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
    protected abstract async ShouldMigrateActorData(actor: ActorData): Promise<boolean>;
    /**
     * Migrate the specified actor's data.
     * @param actor The actor to migrate.
     * @return A promise that resolves with the update data.
     */
    protected abstract async MigrateActorData(actor: ActorData): Promise<any>;
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
}

type EntityUpdate = {
    updateData: any;
    embeddedItems: null | any[];
};
