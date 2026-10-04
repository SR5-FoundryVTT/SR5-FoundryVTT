type AnyPack = foundry.documents.collections.CompendiumCollection<any>;

/**
 * Persistence helpers shared by the Migrator and individual version migrations.
 *
 * Kept apart from Migrator so version migrations can use them without importing the class that
 * imports them.
 */
export const MigrationStorage = {
    /** Max serialized length per update request, well below Foundry's 100MB socket message limit. */
    MAX_BATCH_LENGTH: 10_000_000,

    /** Split documents into batches of at most MAX_BATCH_LENGTH serialized length. */
    *batchBySize<T>(docs: T[]): Generator<T[]> {
        let batch: T[] = [], length = 0;
        for (const doc of docs) {
            const docLength = JSON.stringify(doc).length;
            if (batch.length && length + docLength > MigrationStorage.MAX_BATCH_LENGTH) {
                yield batch;
                batch = []; length = 0;
            }
            batch.push(doc);
            length += docLength;
        }
        if (batch.length) yield batch;
    },

    /**
     * Token source of a scene, ready to be written back as a whole.
     */
    tokenSources(scene: Scene.Implementation): any[] {
        return scene.tokens.map(token => {
            const data = token.toObject() as any;

            // Foundry uses the parent token ID as the ActorDelta ID.
            // Provide it upfront to avoid ActorDeltaField._updateDiff assigning _id to the cleaned update value.
            if (!token.actorLink && data.delta && !data.delta._id)
                data.delta._id = token.id;

            return data;
        });
    },

    /**
     * Replace token data of a scene, in batches. The scene may live in a compendium.
     */
    async updateTokens(scene: Scene.Implementation, tokens: any[]) {
        for (const batch of MigrationStorage.batchBySize(tokens)) {
            try {
                await TokenDocument.implementation.updateDocuments(
                    batch,
                    // Save migrated data silently (no hooks/renders) to avoid intermediate state issues.
                    { parent: scene, diff: false, recursive: false, noHook: true, render: false }
                );
            } catch (error) {
                console.error(`Failed migration update for Token documents in ${scene.uuid}.`, error);
            }
        }
    },

    /**
     * Run a write against a compendium, unlocking it for the duration if needed.
     */
    async withUnlockedPack(pack: AnyPack, fn: () => Promise<unknown>) {
        const wasLocked = pack.locked;
        if (wasLocked) {
            try {
                await pack.configure({ locked: false });
            } catch (error) {
                console.error(`Failed to unlock compendium ${pack.collection} for migration.`, error);
                return;
            }
        }

        try {
            await fn();
        } finally {
            if (wasLocked) {
                try {
                    await pack.configure({ locked: true });
                } catch (error) {
                    console.error(`Failed to re-lock compendium ${pack.collection} after migration.`, error);
                }
            }
        }
    },
};
