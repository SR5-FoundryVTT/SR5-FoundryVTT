import {SR5TestingDocuments} from "./utils";
import {SR5Actor} from "../module/actor/SR5Actor";
import {SR5Item} from "../module/item/SR5Item";

export const shadowrunSR5ActiveEffect = context => {
    const {describe, it, assert, before, after} = context;

    let testActor;
    let testItem;

    before(async () => {
        testActor = new SR5TestingDocuments(SR5Actor);
        testItem = new SR5TestingDocuments(SR5Item);
    })

    after(async () => {
        await testActor.teardown();
        await testItem.teardown();
    })

    describe('SR5ActiveEffect', () => {
        it('apply the custom modify mode', async () => {
            const actor = await testActor.create({type: 'character'});
            const effect = await actor.createEmbeddedDocuments('ActiveEffect', [{
                origin: actor.uuid,
                disabled: false,
                label: 'Test Effect'
            }]);

            await effect[0].update({'changes': [{key: 'data.attributes.body.mod', value: 2, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM}]});

            assert.deepEqual(actor.data.data.attributes.body.mod, [{name: 'Test Effect', value: 2}]);
            assert.strictEqual(actor.data.data.attributes.body.value, 2);

            await effect[0].update({'changes': [{key: 'data.attributes.body.mod', value: 2, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM},
                                                {key: 'data.attributes.body.mod', value: 2, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM}]});

            assert.deepEqual(actor.data.data.attributes.body.mod, [{name: 'Test Effect', value: 2}, {name: 'Test Effect', value: 2}]);
            assert.strictEqual(actor.data.data.attributes.body.value, 4);
        });

        it('apply the custom mode mode, when using ADD mode on a mod array', async () => {
            const actor = await testActor.create({type: 'character'});
            const effect = await actor.createEmbeddedDocuments('ActiveEffect', [{
                origin: actor.uuid,
                disabled: false,
                label: 'Test Effect'
            }]);

            await effect[0].update({'changes': [{key: 'data.attributes.body.mod', value: 3, mode: CONST.ACTIVE_EFFECT_MODES.ADD}]});

            assert.deepEqual(actor.data.data.attributes.body.mod, [{name: 'Test Effect', value: 3}]);
            assert.strictEqual(actor.data.data.attributes.body.value, 3);

            await effect[0].update({'changes': [{key: 'data.attributes.body.mod', value: 3, mode: CONST.ACTIVE_EFFECT_MODES.ADD},
                                                {key: 'data.attributes.body.mod', value: 3, mode: CONST.ACTIVE_EFFECT_MODES.ADD}]});

            assert.deepEqual(actor.data.data.attributes.body.mod, [{name: 'Test Effect', value: 3}, {name: 'Test Effect', value: 3}]);
            assert.strictEqual(actor.data.data.attributes.body.value, 6);
        })
    })
}