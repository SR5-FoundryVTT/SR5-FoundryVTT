import {SR5TestingDocuments} from "./utils";
import {SR5Actor} from "../module/actor/SR5Actor";
import {SR5Item} from "../module/item/SR5Item";
import {SuccessTest} from "../module/tests/SuccessTest";

export const shadowrunTesting = context => {
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

    describe('SuccessTest', () => {
        it('Should evaluate a roll from action data', async () => {
            const actionData = {'type': 'action',
                                'data.action.attribute': 'body',
                                'data.action.skill': 'automatics'};
            const action = await testItem.create(actionData);

            const actorData = {'type': 'character',
                               'data.attributes.body.base': 5,
                               'data.skills.active.automatics.base': 5};
            const actor = await testActor.create(actorData);

            const test = SuccessTest.fromAction(action, actor);

            if (test) {
                await test.evaluate();

                const rollChat = await test.roll.toMessage();
                const testChat = await test.toMessage();
            }
        });
    })
};