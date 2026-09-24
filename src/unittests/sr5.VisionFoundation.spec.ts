import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { PerceptionFlow } from '@/module/vision/PerceptionFlow';
import { PerceptionResolver } from '@/module/vision/PerceptionResolver';
import { SR5TestFactory } from './utils';

const actorData = (overrides: Record<string, unknown> = {}): any => ({
    system: {
        visibilityChecks: {
            targets: {
                physical: { active: true, thermographic: 'warm' },
                astral: { hasAura: true, astralActive: false, affectedBySpell: false },
                matrix: { hasIcon: true, runningSilent: false },
            },
            capabilities: {
                physical: { lowLight: false, thermographic: false, ultrasound: false },
                astral: { perception: false, projection: false },
                matrix: { perception: false },
            },
        },
        magic: { type: 'mundane', astralPerceptionOverride: 'default', astralProjectionOverride: 'default' },
        ...overrides,
    },
    effects: [],
    items: [],
});

export const shadowrunVisionFoundation = (context: QuenchBatchContext) => {
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;
    const factory = new SR5TestFactory({ skipDefaultSkills: true });

    after(async () => { await factory.destroy(); });

    describe('Vision foundation', () => {
        it('keeps the actor thermographic signature level', async () => {
            const actor = await factory.createActor({
                type: 'character',
                system: { visibilityChecks: { targets: { physical: { thermographic: 'cold' } } } },
            });
            assert.strictEqual(actor.system.visibilityChecks.targets.physical.thermographic, 'cold');

            await actor.update({
                system: { visibilityChecks: { targets: { physical: { thermographic: 'hot' } } } },
            });
            assert.strictEqual(actor.system.visibilityChecks.targets.physical.thermographic, 'hot');
        });

        it('resolves magical subtype eligibility and applies explicit overrides last', () => {
            const magician = actorData({
                magic: { type: 'magician', astralPerceptionOverride: 'default', astralProjectionOverride: 'default' },
            });
            assert.isTrue(PerceptionResolver.resolve(magician).astral.perception);
            assert.isTrue(PerceptionResolver.resolve(magician).astral.projection);

            const overridden = actorData({
                magic: { type: 'magician', astralPerceptionOverride: 'deny', astralProjectionOverride: 'deny' },
            });
            assert.isFalse(PerceptionResolver.resolve(overridden).astral.perception);
            assert.isFalse(PerceptionResolver.resolve(overridden).astral.projection);

            const mundaneOverride = actorData({
                magic: { type: 'mundane', astralPerceptionOverride: 'allow', astralProjectionOverride: 'allow' },
            });
            assert.isTrue(PerceptionResolver.resolve(mundaneOverride).astral.perception);
            assert.isTrue(PerceptionResolver.resolve(mundaneOverride).astral.projection);
        });

        it('uses active grants and removes them when the effect is disabled', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const [effect] = await actor.createEmbeddedDocuments('ActiveEffect', [{
                name: '#QUENCH Vision Grant',
                system: {
                    targets: [{ id: 'actor', name: 'Actor', applyTo: 'actor' }],
                    changes: [{
                        key: 'system.visibilityChecks.capabilities.physical.lowLight',
                        type: 'override',
                        value: true,
                        target: 'actor',
                    }],
                },
            }]);
            assert.isTrue(PerceptionResolver.resolve(actor).physical.lowLight);

            await effect.update({ disabled: true });
            assert.isFalse(PerceptionResolver.resolve(actor).physical.lowLight);
        });

        it('updates equipment grants when the item is equipped or unequipped', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const [item] = await actor.createEmbeddedDocuments('Item', [{
                name: '#QUENCH Ultrasound Equipment',
                type: 'equipment',
                system: { technology: { equipped: true } },
                effects: [{
                    name: '#QUENCH Ultrasound Grant',
                    system: {
                        onlyForEquipped: true,
                        targets: [{ id: 'actor', name: 'Actor', applyTo: 'actor' }],
                        changes: [{
                            key: 'system.visibilityChecks.capabilities.physical.ultrasound',
                            type: 'override',
                            value: true,
                            target: 'actor',
                        }],
                    },
                }],
            }]);
            assert.isTrue(PerceptionResolver.resolve(actor).physical.ultrasound);

            await item.update({ system: { technology: { equipped: false } } });
            assert.isFalse(PerceptionResolver.resolve(actor).physical.ultrasound);
        });

        it('preserves unrelated detection modes while reconciling managed senses', () => {
            const existing = {
                basicSight: { enabled: true, range: 30 },
                tremor: { enabled: true, range: 12 },
                lowlight: { enabled: true, range: 5 },
            };
            const capabilities = PerceptionResolver.resolve(actorData());
            capabilities.physical.thermographic = true;

            const reconciled = PerceptionFlow.reconcileDetectionModes(existing, capabilities, 10000);
            assert.deepEqual(reconciled.basicSight, existing.basicSight);
            assert.deepEqual(reconciled.tremor, existing.tremor);
            assert.notProperty(reconciled, 'lowlight');
            assert.deepEqual(reconciled.thermographic, { enabled: true, range: 10000 });
        });

        it('honors the world setting and per-token automatic-sense opt-out', () => {
            const automatic = { flags: { shadowrun5e: {} } } as unknown as TokenDocument;
            const optedOut = {
                flags: { shadowrun5e: { AutomaticTokenSenses: false } },
            } as unknown as TokenDocument;

            assert.isTrue(PerceptionFlow.isRefreshEnabled(automatic, true));
            assert.isFalse(PerceptionFlow.isRefreshEnabled(optedOut, true));
            assert.isFalse(PerceptionFlow.isRefreshEnabled(automatic, false));
        });

        it('reconciles derived senses when a scene is loaded', async () => {
            const actor = await factory.createActor({
                type: 'character',
                system: { metatype: 'elf' },
            });
            const scene = await factory.createScene({});
            const [token] = await scene.createEmbeddedDocuments('Token', [
                {
                    actorId: actor.id,
                    actorLink: true,
                    sight: { enabled: true, range: 30 },
                },
            ]);

            token.updateSource({ detectionModes: {} });
            PerceptionFlow.refreshScene(scene);

            assert.isTrue(token.detectionModes.lowlight.enabled);
            assert.strictEqual(token.detectionModes.lowlight.range, 10000);
        });
    });
};
