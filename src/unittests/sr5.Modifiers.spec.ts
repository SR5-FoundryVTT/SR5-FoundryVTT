import { EnvironmentalModifier } from './../module/rules/modifiers/EnvironmentalModifier';

import {DocumentSituationModifiers} from "../module/rules/DocumentSituationModifiers";
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SituationModifier } from "../module/rules/modifiers/SituationModifier";
import { SR5TestingDocuments } from './utils';
import { SR5Actor } from '../module/actor/SR5Actor';
import { SR5Item } from '../module/item/SR5Item';

export const shadowrunRulesModifiers = (context: QuenchBatchContext) => {
    const {describe, it, before, after} = context;
    const assert: Chai.AssertStatic = context.assert;

    let testActor;
    let testItem;
    let testScene;

    before(async () => {
        testActor = new SR5TestingDocuments(SR5Actor);
        testItem = new SR5TestingDocuments(SR5Item);
        testScene = new SR5TestingDocuments(Scene);
    })

    after(async () => {
        await testActor.teardown();
        await testItem.teardown();
        await testScene.teardown();
    })

    const defaultSourceModifiers = {
        environmental: {
            active: {}
        },
        noise: {
            active: {}
        },
        background_count: {
            active: {}
        }
    };

    describe('SR5 Modifiers', () => {
        
        describe('class SituationalModifiers', () => {
            it('create valid applied modifiers without any input', () => {
                const sitMod = new SituationModifier();

                assert.deepEqual(sitMod.source, {active: {}});
                assert.equal(sitMod.hasActive, false);
                assert.equal(sitMod.total, 0);
            });

            it('determine if documents have been added to it', () => {
                assert.equal(new SituationModifier().hasDocuments, false);
                assert.equal(new SituationModifier(undefined, new DocumentSituationModifiers()).hasDocuments, true);
            });

            it('determine it has active modifiers', () => {
                assert.equal(new SituationModifier({active: {a: 0}}).hasActive, true);
            })

            it('apply source active values to a sum of all active modifiers', () => {
                const sitMod = new SituationModifier({
                    active: {
                        a: -1,
                        b: -3
                    }
                });

                // Result of -1 + -3
                assert.equal(sitMod.total, -4);
            });

            it('apply source fixed value instead of the sum of all active modifiers', () => {
                const sitMod = new SituationModifier({
                    active: {
                        a: -1,
                        b: -3
                    },
                    fixed: 0
                });

                // Result of -1 + -3
                assert.equal(sitMod.total, 0);
                assert.equal(sitMod._calcActiveTotal(), -4);
            });

            it('correctly report the state of active modifier selections', () => {
                const sitMod = new SituationModifier({
                    active: {
                        a: -1
                    }
                });

                assert.equal(sitMod.isActive('a'), true);
                assert.equal(sitMod.isActive('b'), false);
                assert.equal(sitMod.isActive(''), false);
            })

            it('correctly active a modifier selection', () => {
                const sitMod = new SituationModifier();
                assert.equal(sitMod.source.active['a'], undefined);
                
                sitMod.setActive('a', 1);
                assert.equal(sitMod.source.active['a'], 1);
            })

            it('correctly deactivate a modifier selection', () => {
                const sitMod = new SituationModifier({active: {a: 1, b: 2}});
                assert.equal(sitMod.isActive('a'), true)

                sitMod.setInactive('a');
                assert.equal(sitMod.isActive('a'), false); // Make sure it's not active anymore.
                assert.equal(sitMod.isActive('b'), true); // Make sure only a is touched.
            });

            it('correctly determine if a fixed modifier is set', () => {
                const sitMod = new SituationModifier();
                sitMod.apply({source: {fixed: 0, active: {}}});
                assert.isTrue(sitMod.hasFixed);

                sitMod.apply({source: {active: {}}});
                assert.isFalse(sitMod.hasFixed);
            });

            it('correctly determine if an active modifier selection matches', () => {
                const sitMod = new SituationModifier({active: {a: 1, b: 2}});
                
                sitMod.apply();

                assert.equal(sitMod.isMatching('a', 1), true); // matching
                assert.equal(sitMod.isMatching('b', 1), false); // matching wrong value
                assert.equal(sitMod.isMatching('c', 0), false); // matching wrong active
            });

            it('correctly clear an active set of selections', () => {
                const sitMod = new SituationModifier({active: {a: 1, b: 2}, fixed: 0});
                assert.equal(sitMod.hasActive, true);

                sitMod.clear();
                assert.equal(sitMod.hasActive, false);
            });

            it('use a fixed user selection instead of summing up', () => {
                const sitMod = new SituationModifier({active: {value: 3, a: 1, b: 3}});
                sitMod.apply();

                assert.equal(sitMod.total, 3);
            });

            it('use a fixed value before a fixed user selection', () => {
                const sitMod = new SituationModifier({active: {value: 3, a: 1, b: 3}, fixed: -3});
                assert.equal(sitMod.total, -3);
            });

            it('should only apply applicable selections', () => {
                const sitMod = new SituationModifier({active: {a: 1, b: 3, c: 4}});
                sitMod.apply({applicable: ['a', 'c']});

                assert.equal(sitMod.total, 5);
            });
        });

        describe('class EnvironmentalModifier', () => {
            it('apply higher level modifier for two same level selections', () => {
                const envMod = new EnvironmentalModifier();
                envMod.apply({source: {active: {light: 0, wind: 0}}});
                assert.equal(envMod.total, 0);

                envMod.apply({source: {active: {light: -1, wind: -1}}});
                assert.equal(envMod.total, -3);

                envMod.apply({source: {active: {light: -3, wind: -3}}});
                assert.equal(envMod.total, -6);

                envMod.apply({source: {active: {light: -6, wind: -6}}});
                assert.equal(envMod.total, -10);
            });

            it('apply fixed modifier values instead of level selections', () => {
                const envMod = new EnvironmentalModifier();
                envMod.apply({source: {active: {light: 0, wind: 0, value: -3}}});
                assert.equal(envMod.total, -3);

                envMod.apply({source: {active: {light: -1, wind: -1, value: -1}}});
                assert.equal(envMod.total, -1);
            });
        });
        
        describe('class DocumentSituationModifiers', () => {
            it('create default modifier values', () => {
                const modifiers = DocumentSituationModifiers._defaultModifiers;
    
                assert.deepEqual(modifiers, defaultSourceModifiers)
            })

            it('use default modifiers for faulty constructor params', () => {
                //@ts-expect-error
                assert.deepEqual(new DocumentSituationModifiers({}).source, defaultSourceModifiers);
                assert.deepEqual(new DocumentSituationModifiers(undefined).source, defaultSourceModifiers);
                //@ts-expect-error
                assert.deepEqual(new DocumentSituationModifiers(null).source, defaultSourceModifiers);
                //@ts-expect-error
                assert.deepEqual(new DocumentSituationModifiers(0).source, defaultSourceModifiers);
                //@ts-expect-error
                assert.deepEqual(new DocumentSituationModifiers(1).source, defaultSourceModifiers);
                assert.deepEqual(new DocumentSituationModifiers().source, defaultSourceModifiers);
            })

            it('Store data depending on document type', async () => {
                const actor = await testActor.create({type: 'character'}) as SR5Actor;
                let modifiers = actor.getSituationModifiers();

                assert.deepEqual(modifiers.source, DocumentSituationModifiers._defaultModifiers);

                modifiers.source.noise.fixed = 1;
                await modifiers.updateDocument();

                assert.equal(modifiers.source.noise.fixed, 1);

                const scene = await testScene.create() as Scene;
                modifiers = DocumentSituationModifiers.fromDocument(scene);

                assert.deepEqual(modifiers.source, DocumentSituationModifiers._defaultModifiers);

                modifiers.source.noise.fixed = 1;
                await modifiers.updateDocument();

                assert.equal(modifiers.source.noise.fixed, 1);
            })

            it('clear documents data to defaults', async () => {
                
                const actor = await testActor.create({
                    type: 'character'}) as SR5Actor;

                const modifiers = actor.getSituationModifiers();
                
                modifiers.source.noise.fixed = 1;
                await modifiers.updateDocument();
                assert.notDeepEqual(modifiers.source, DocumentSituationModifiers._defaultModifiers);

                await modifiers.clearAll();
                assert.deepEqual(modifiers.source, DocumentSituationModifiers._defaultModifiers);
            });
        })
    })
}

