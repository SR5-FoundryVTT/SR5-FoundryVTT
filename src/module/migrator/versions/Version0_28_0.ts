import { SR5Item } from "src/module/item/SR5Item";
import { SR5Actor } from "../../actor/SR5Actor";
import { VersionMigration } from "../VersionMigration";

/**
 * Version 0.28.0
 * 
 * Reset invalid actors, items, and tokens.
 */

export class Version0_28_0 extends VersionMigration {
    get SourceVersion(): string {
        return '0.27.2';
    }

    get TargetVersion(): string {
        return Version0_28_0.TargetVersion;
    }

    static get TargetVersion(): string {
        return "0.28.0";
    }

    /**
     * Updates all invalid documents in the provided iterable by re-saving them.
     * @param docs Iterable of documents to check and update if invalid.
     */
    private async updateIfInvalid(docs: Iterable<any>) {
        for (const doc of docs)
            if (doc.invalid)
                await doc.update(doc.toObject(), { diff: false, recursive: false });
    }

    /**
     * Updates all invalid documents in a collection by their IDs.
     * @param collection The collection containing invalidDocumentIds and getInvalid method.
     */
    private async updateInvalidByIds(collection: any) {
        for (const id of collection.invalidDocumentIds) {
            const doc = collection.getInvalid(id);
            await doc.update(doc.toObject(), { diff: false, recursive: false });
        }
    }

    /**
     * Migrates all actors, items, and scenes in the world, updating any invalid documents.
     */
    public override async Migrate(): Promise<any> {
        await super.Migrate();

        await this.updateInvalidByIds(game.actors);
        await this.updateInvalidByIds(game.items);

        for (const actor of game.actors)
            await this.updateInvalidByIds(actor.items);

        for (const item of game.items) {
            const srItem = item as SR5Item;
            await this.updateIfInvalid(srItem.items);
            await this.updateIfInvalid(srItem.flags?.shadowrun5e?.embeddedItems || []);
        }

        for (const scene of game.scenes.contents)
            await this.updateInvalidByIds(scene.tokens);
    }

    /**
     * Migrates all documents in a compendium pack, updating any invalid actors, items, or tokens.
     * @param pack The compendium collection to migrate.
     */
    public override async MigrateCompendiumPack(pack: CompendiumCollection<'Actor' | 'Item' | 'Scene'>) {
        await super.MigrateCompendiumPack(pack);

        const documents = await pack.getDocuments();

        for (const document of documents) {
            if (document instanceof SR5Actor) {
                if (document.invalid)
                    await document.update(document.toObject() as any, { diff: false, recursive: false });

                await this.updateInvalidByIds(document.items);
            } else if (document instanceof SR5Item) {
                if (document.invalid)
                    await document.update(document.toObject() as any, { diff: false, recursive: false });

                await this.updateIfInvalid(document.items);
                await this.updateIfInvalid(document.flags?.shadowrun5e?.embeddedItems || []);
            } else {
                await this.updateInvalidByIds(document.tokens);
            }
        }
    }
}
