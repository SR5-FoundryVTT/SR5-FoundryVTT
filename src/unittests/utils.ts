import { SR5Actor } from "src/module/actor/SR5Actor";
import { SR5Item } from "src/module/item/SR5Item";
import { ExtendedTestStorage } from "src/module/storage/ExtendedTestStorage";

export class SR5TestFactory {
    static readonly folderName = '#Quench';

    readonly actors: Actor.Stored[] = [];
    readonly items: Item.Stored[] = [];
    readonly scenes: Scene.Stored[] = [];
    readonly createdFolder = new Map<string, string>();

    async getOrCreateFolderId(type: 'Actor' | 'Item' | 'Scene'): Promise<string> {
        if (this.createdFolder.has(type)) return this.createdFolder.get(type)!;

        const folder = await Folder.create({ name: SR5TestFactory.folderName, type });
        if (!folder) throw new Error(`Shadowrun 5e | Failed to create ${SR5TestFactory.folderName} folder for ${type} documents`);

        this.createdFolder.set(type, folder.id);
        return folder.id;
    }

    async createActor<T extends Actor.ConfiguredSubType>(
        data: Omit<Actor.CreateData, "name"> & { name?: string, type: T },
        context?: Actor.ConstructionContext
    ) {
        const folder = await this.getOrCreateFolderId('Actor');
        const actor = await SR5Actor.create({ name: `#QUENCH`, folder: folder, ...data }, context) as Actor.Stored<T>;
        this.actors.push(actor);
        return actor;
    }

    async createItem<T extends Item.ConfiguredSubType>(
        data: Omit<Item.CreateData, "name"> & { name?: string, type: T },
        context?: Item.ConstructionContext
    ) {
        const folder = await this.getOrCreateFolderId('Item');
        const item = await SR5Item.create({ name: `#QUENCH`, folder: folder, ...data }, context) as Item.Stored<T>;
        this.items.push(item);
        return item;
    }

    async createScene(
        data: Omit<Scene.CreateData, "name"> & { name?: string },
        context?: Scene.ConstructionContext
    ): Promise<Scene.Stored> {
        const folder = await this.getOrCreateFolderId('Scene');
        const scene = await Scene.create({ name: `#QUENCH`, folder: folder, ...data }, context) as Scene.Stored;
        this.scenes.push(scene);
        return scene;
    }

    /** Remove extended test records rolling these actors registered, leaving the world's own. */
    async destroyExtendedTestRecords(actorUuids: Set<string>) {
        if (!actorUuids.size) return;

        const owned = Object.values(ExtendedTestStorage.getAll())
            .filter(record => record.actorUuid && actorUuids.has(record.actorUuid));

        for (const record of owned) {
            await ExtendedTestStorage.delete(record.id);
        }
    }

    async destroy() {
        // Captured before deletion, the records only keep the uuid string.
        const actorUuids = new Set(this.actors.map(actor => actor.uuid));

        await Actor.deleteDocuments(this.actors.map(actor => actor.id));
        await Item.deleteDocuments(this.items.map(item => item.id));
        await Scene.deleteDocuments(this.scenes.map(scene => scene.id));
        await Folder.deleteDocuments(Array.from(this.createdFolder.values()));

        await this.destroyExtendedTestRecords(actorUuids);

        this.actors.length = 0;
        this.items.length = 0;
        this.scenes.length = 0;
        this.createdFolder.clear();
    }
}
