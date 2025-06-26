import { SR5Item } from "src/module/item/SR5Item";
import { SR5Actor } from "../../actor/SR5Actor";
import { VersionMigration } from "../VersionMigration";

/**
 * Version 0.27.0
 * 
 * Fixing a few spirit type names to match the Chummer formatting.
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

    private async updateIfInvalid(docs: Iterable<any>) {
        for (const doc of docs)
            if (doc.invalid)
                await doc.update(doc.toObject(), { diff: false, recursive: false });
    }

    private async updateInvalidByIds(collection: any) {
        for (const id of collection.invalidDocumentIds) {
            const doc = collection.getInvalid(id);
            await doc.update(doc.toObject(), { diff: false, recursive: false });
        }
    }

    public override async Migrate(): Promise<any> {
        await super.Migrate();

        await this.updateInvalidByIds(game.actors);
        await this.updateInvalidByIds(game.items);

        for (const actor of game.actors)
            await this.updateInvalidByIds(actor.items);

        await this.updateIfInvalid(Array.from(game.items).flatMap((item: any) => item.items));

        for (const scene of game.scenes.contents)
            await this.updateInvalidByIds(scene.tokens);
    }

    public override async MigrateCompendiumPack(pack: CompendiumCollection<'Actor' | 'Item' | 'Scene'>) {
        await super.MigrateCompendiumPack(pack);

        const documents = await pack.getDocuments();

        for (const document of documents) {
            if (document instanceof SR5Actor || document instanceof SR5Item) {
                await this.updateIfInvalid([document]);
                await this.updateIfInvalid(document.items);
            } else {
                await this.updateInvalidByIds(document.tokens);
            }
        }
    }
}
