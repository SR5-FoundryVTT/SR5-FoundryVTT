import { SR5Actor } from "src/module/actor/SR5Actor";
import { SR5Item } from "src/module/item/SR5Item";

export class SR5TestFactory {
    readonly actors: SR5Actor[] = [];
    readonly items: SR5Item[] = [];
    readonly scenes: Scene[] = [];

    async createActor<T extends Actor.ConfiguredSubTypes>(
        data: Omit<Actor.CreateData, "name"> & { type: T },
        context?: Actor.ConstructionContext
    ): Promise<SR5Actor<T>> {
        const actor = await SR5Actor.create({ name: `#QUENCH`, ...data }, context) as SR5Actor<T>;
        this.actors.push(actor);
        return actor;
    }

    async createItem<T extends Item.ConfiguredSubTypes>(
        data: Omit<Item.CreateData, "name"> & { type: T },
        context?: Item.ConstructionContext
    ): Promise<SR5Item<T>> {
        const item = await SR5Item.create({ name: `#QUENCH`, ...data }, context) as SR5Item<T>;
        this.items.push(item);
        return item;
    }

    async createScene(
        data: Omit<Scene.CreateData, "name">,
        context?: Scene.ConstructionContext
    ): Promise<Scene> {
        const scene = await Scene.create({ name: `#QUENCH`, ...data }, context) as Scene;
        this.scenes.push(scene);
        return scene;
    }

    destroy() {
        for (const actor of this.actors)
            void actor.delete();

        for (const item of this.items)
            void item.delete();

        for (const scene of this.scenes)
            void scene.delete();

        this.actors.length = 0;
        this.items.length = 0;
        this.scenes.length = 0;
    }
}
