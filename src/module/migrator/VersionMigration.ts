import { SR5Actor } from '../actor/SR5Actor';
import {SR5Item} from "../item/SR5Item";
import {ActorData} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";
import ShadowrunItemData = Shadowrun.ShadowrunItemData;
import ShadowrunActorData = Shadowrun.ShadowrunActorData;

export type SystemMigrationDocuments = SR5Actor|SR5Item|Scene;
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

            if (embeddedItems !== null) {
                const actor = entity as SR5Actor;
                // @ts-ignore
                await actor.updateEmbeddedDocuments('Item', embeddedItems);
            }

            if (updateData !== null ) {
                await entity.update(updateData, { enforceTypes: false });
            }
        }
    }

    /**
     * Iterate through all scenes and migrate each if needed.
     * @param game
     * @param entityUpdates
     */
    protected async IterateScenes(game: Game, entityUpdates: Map<SystemMigrationDocuments, DocumentUpdate>) {
        // @ts-ignore // ignore null state
        for (const scene of game.scenes.contents) {
            try {
                if (!(await this.ShouldMigrateSceneData(scene))) {
                    continue;
                }

                // Migrate SceneData itself.
                console.log(`Migrating Scene entity ${scene.name}`);
                const updateData = await this.MigrateSceneData(duplicate(scene.data));

                expandObject(updateData);
                entityUpdates.set(scene, {
                    updateData,
                    embeddedItems: null,
                });

                // Migrate embedded TokenDocument / ActorData within SceneData
                for (const token of scene.data.tokens) {
                    // Don't migrate tokens without or a linked actor.
                    if (!token.actor || token.data.actorLink) continue;
                    
                    //@ts-ignore // TODO: foundry-vtt-types v10
                    if (foundry.utils.isEmpty(token.actor.data)) continue;

                    // @ts-ignore
                    const updateData = await this.MigrateActorData(foundry.utils.duplicate(token.actor.data));

                    expandObject(updateData);
                    entityUpdates.set(token.actor, {
                        updateData: updateData.data || null,
                        embeddedItems: updateData.items || null
                    });
                }

                //@ts-ignore // TODO: foundry-vtt-types v10
                if (foundry.utils.isEmpty(updateData)) {
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
     * @param entityUpdates The current map of document updates.
     */
    protected async IterateItems(game: Game, entityUpdates: Map<SystemMigrationDocuments, DocumentUpdate>) {
        // @ts-ignore // ignore null state
        for (const item of game.items.contents) {
            try {
                if (!(await this.ShouldMigrateItemData(item.data))) {
                    continue;
                }

                console.log(`Migrating Item: ${item.name}`);
                const updateData = await this.MigrateItemData(item.data);

                //@ts-ignore // TODO: foundry-vtt-types v10
                if (foundry.utils.isEmpty(updateData)) {
                    continue;
                }

                expandObject(updateData);
                // @ts-ignore
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
     * @param entityUpdates The current map of document updates.
     */
    protected async IterateActors(game: Game, entityUpdates: Map<SystemMigrationDocuments, DocumentUpdate>) {
        // @ts-ignore // ignore null state
        for (const actor of game.actors.contents) {
            try {
                if (!(await this.ShouldMigrateActorData(actor.data))) {
                    continue;
                }

                console.log(`Migrating Actor ${actor.name}`);
                console.log(actor);
                // @ts-ignore
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
    protected async IterateActorItems(actorData: ShadowrunActorData, updateData) {
        let hasItemUpdates = false;
        // @ts-ignore
        if (actorData.items !== undefined) {
            const items = await Promise.all(
                // @ts-ignore
                actorData.items.map(async (itemData) => {
                    if (itemData instanceof SR5Item) console.error('Shadowrun 5e | Migration encountered an Item when it should have encountered ItemData / Object');
                    if (!await this.ShouldMigrateItemData(itemData)) return itemData;
                    let itemUpdate = await this.MigrateItemData(itemData);

                    hasItemUpdates = true;
                    itemUpdate['_id'] = itemData._id;

                    return mergeObject(itemData, itemUpdate.data, {
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
    protected async MigrateSceneData(scene: any): Promise<any> {
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
    protected async ShouldMigrateItemData(item: ShadowrunItemData): Promise<boolean> {
        return false;
    }
    /**
     * Migrate the specified item's data.
     * @param item The item to migrate.
     * @return A promise that resolves with the update data.
     */
    protected async MigrateItemData(item: ShadowrunItemData): Promise<any> {
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
    protected async ShouldMigrateActorData(actor: ActorData): Promise<boolean> {
        return false;
    }
    /**
     * Migrate the specified actor's data.
     * @param actor The actor to migrate.
     * @return A promise that resolves with the update data.
     */
    protected async MigrateActorData(actor: ActorData): Promise<any> {
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
                    // @ts-ignore // TODO: vtt-types v9 document.data.type check added to type gate... but didn't work
                    updateData = await this.MigrateItemData(foundry.utils.duplicate(document.data));

                    //@ts-ignore // TODO: foundry-vtt-types v10
                    if (foundry.utils.isEmpty(updateData)) {
                        continue;
                    }

                    if (updateData.data) {
                        expandObject(updateData.data);
                        document.update(updateData.data);
                    }

                // TODO: Uncomment when foundry allows embeddeds to be updated in packs
                //@ts-ignore
                } else if (pack.metadata.type === 'Actor') {
                    // @ts-ignore
                    updateData = await this.MigrateActorData(foundry.utils.duplicate(document.data));

                    //@ts-ignore // TODO: foundry-vtt-types v10
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
                        expandObject(updateData.data);
                        await document.update(updateData.data);
                    }

                } else if (pack.metadata.type === 'Scene') {
                    updateData = await this.MigrateSceneData(foundry.utils.duplicate(document.data));

                    //@ts-ignore // TODO: foundry-vtt-types v10
                    if (foundry.utils.isEmpty(updateData)) {
                        continue;
                    }

                    if (updateData.data) {
                        expandObject(updateData.data);
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
};
