import { SR5Actor } from "src/module/actor/SR5Actor";
import { SR5Item } from "src/module/item/SR5Item";

export class SR5TestFactory {
    readonly actors: SR5Actor[] = [];
    readonly items: SR5Item[] = [];
    readonly scenes: Scene[] = [];

    async createActor<T extends Actor.ConfiguredSubType>(
        data: Omit<Actor.CreateData, "name"> & { name?: string, type: T },
        context?: Actor.ConstructionContext
    ): Promise<SR5Actor<T>> {
        const actor = await SR5Actor.create({ name: `#QUENCH`, ...data }, context) as SR5Actor<T>;
        this.actors.push(actor);
        return actor;
    }

    async createItem<T extends Item.ConfiguredSubType>(
        data: Omit<Item.CreateData, "name"> & { name?: string, type: T },
        context?: Item.ConstructionContext
    ): Promise<SR5Item<T>> {
        const item = await SR5Item.create({ name: `#QUENCH`, ...data }, context) as SR5Item<T>;
        this.items.push(item);
        return item;
    }

    async createScene(
        data: Omit<Scene.CreateData, "name"> & { name?: string },
        context?: Scene.ConstructionContext
    ): Promise<Scene> {
        const scene = await Scene.create({ name: `#QUENCH`, ...data }, context) as Scene;
        this.scenes.push(scene);
        return scene;
    }

    destroy() {
        void Actor.deleteDocuments(this.actors.map(actor => actor.id!));
        void Item.deleteDocuments(this.items.map(item => item.id!));
        void Scene.deleteDocuments(this.scenes.map(scene => scene.id!));

        this.actors.length = 0;
        this.items.length = 0;
        this.scenes.length = 0;
    }
}
