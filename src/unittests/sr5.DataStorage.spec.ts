import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { DataStorage } from "@/module/data/DataStorage";
import { FLAGS } from "@/module/constants";

/**
 * Coverage for the global data storage backing everything without a FoundryVTT document.
 *
 * NOTE: These tests write the real world setting. Everything lives under one dedicated top
 * level key and the whole storage is snapshotted and restored, so a failed run can't take
 * the worlds extended tests or marks with it.
 *
 * Not covered, deliberately:
 * - The non GM branches of set / unset, which hand over to a GM by socket. Quench runs as a
 *   GM, so the branch can't be reached, and neither can the isGM guard in the handlers.
 * - validate(), whose only real behaviour is overwriting the setting with an empty object.
 *   That is exactly the destructive path that mustn't run against a live world.
 */
export const shadowrunDataStorage = (context: QuenchBatchContext) => {
    const { describe, it, before, after, afterEach } = context;
    const assert: Chai.AssertStatic = context.assert;

    // Every test writes below this, so nothing else in the storage is ever a target.
    const ROOT = 'quenchDataStorage';
    const key = (...path: string[]) => [ROOT, ...path].join('.');

    let snapshot: any;

    before(() => {
        snapshot = foundry.utils.deepClone(DataStorage.storage());
    });

    afterEach(async () => {
        await DataStorage.unset(ROOT);
    });

    after(async () => {
        await DataStorage.save(snapshot);
        // changedKeys keeps its baseline in module state, shared with the live
        // sr5e.storageChanged listener. Left as the tests saw it, the next real write would
        // report the wrong changed keys to every open application.
        DataStorage.changedKeys(DataStorage.storage());
    });

    describe('Setting and reading values', () => {
        it('creates the intermediate objects of a deep key', async () => {
            await DataStorage.set(key('nested', 'deep'), { value: 5 });

            assert.deepEqual(DataStorage.get(key('nested', 'deep')), { value: 5 });
            assert.deepEqual(DataStorage.get(key('nested')), { deep: { value: 5 } });
        });

        it('reports a missing key as undefined', () => {
            assert.isUndefined(DataStorage.get(key('missing')));
            assert.isUndefined(DataStorage.get(key('missing', 'deeper')));
        });

        it('leaves the siblings of a written key alone', async () => {
            await DataStorage.set(key('first'), 'one');
            await DataStorage.set(key('second'), 'two');
            await DataStorage.set(key('first'), 'changed');

            assert.strictEqual(DataStorage.get(key('first')), 'changed');
            assert.strictEqual(DataStorage.get(key('second')), 'two');
        });
    });

    describe('Unsetting values', () => {
        it('removes only the target key, keeping its parent and siblings', async () => {
            await DataStorage.set(key('records', 'first'), { name: 'First' });
            await DataStorage.set(key('records', 'second'), { name: 'Second' });

            await DataStorage.unset(key('records', 'first'));

            assert.isUndefined(DataStorage.get(key('records', 'first')));
            assert.deepEqual(DataStorage.get(key('records', 'second')), { name: 'Second' });
            // The parent object survives as an object, rather than being dropped with its key.
            assert.deepEqual(DataStorage.get(key('records')), { second: { name: 'Second' } });
        });

        it('does nothing for a key that leads nowhere', async () => {
            await DataStorage.set(key('kept'), 'value');

            // No parent at all, and a parent that isn't an object. Neither may throw, as
            // storage is shared and a caller can't know what another one already removed.
            await DataStorage.unset(key('missing', 'deeper'));
            await DataStorage.unset(key('kept', 'deeper'));
            await DataStorage.unset('');

            assert.strictEqual(DataStorage.get(key('kept')), 'value');
        });
    });

    describe('Change detection', () => {
        /**
         * The keys reported to applications for a write.
         *
         * Goes through the hook rather than calling changedKeys, as the setting onChange
         * consumes each diff and re-baselines. A second caller only ever sees an empty list,
         * which is what 'call it once per storage change' in changedKeys means.
         */
        const changesFrom = async (write: () => Promise<unknown>): Promise<string[]> => {
            let reported: string[] = [];
            const hook = Hooks.on('sr5e.storageChanged', keys => { reported = keys; });
            await write();
            Hooks.off('sr5e.storageChanged', hook);
            return reported;
        };

        it('reports added, modified and removed top level keys', async () => {
            assert.include(await changesFrom(() => DataStorage.set(key('value'), 1)), ROOT);
            assert.include(await changesFrom(() => DataStorage.set(key('value'), 2)), ROOT);
            assert.include(await changesFrom(() => DataStorage.unset(ROOT)), ROOT);
        });

        it('reports a change below the top level key as that key', async () => {
            await DataStorage.set(key('first'), 1);

            // A second key under the same root is still one changed top level key, as that
            // is the granularity applications re-render on.
            const reported = await changesFrom(() => DataStorage.set(key('second'), 2));

            assert.include(reported, ROOT);
        });

        it('re-baselines on every call, so one change is only reported once', async () => {
            await DataStorage.set(key('value'), 1);

            // Whatever the pending change was, taking it clears it for the next caller.
            DataStorage.changedKeys(DataStorage.storage());
            assert.isEmpty(DataStorage.changedKeys(DataStorage.storage()));
        });
    });

    describe('GM socket handlers', () => {
        const message = (type: string, data: object): Shadowrun.SocketMessageData => ({ type, data });

        it('applies a set request from a player', async () => {
            await DataStorage._handleSetDataStorageSocketMessage(
                message(FLAGS.SetDataStorage, { key: key('fromPlayer'), value: { hits: 3 } }));

            assert.deepEqual(DataStorage.get(key('fromPlayer')), { hits: 3 });
        });

        it('applies an unset request from a player', async () => {
            await DataStorage.set(key('fromPlayer'), { hits: 3 });

            await DataStorage._handleUnsetDataStorageSocketMessage(
                message(FLAGS.UnsetDataStorage, { key: key('fromPlayer') }));

            assert.isUndefined(DataStorage.get(key('fromPlayer')));
        });
    });
}
