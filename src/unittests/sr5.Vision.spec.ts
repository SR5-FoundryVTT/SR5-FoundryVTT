import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { FLAGS } from '@/module/constants';
import { TokenDocumentWithVisionFlags, TokenVisionFlow } from '@/module/token/flows/TokenVisionFlow';
import VisionConfigurator from '@/module/vision/visionConfigurator';
import { SR5VisionModeId } from '@/module/vision/visionModeState';

type VisibilityChecksData = {
    astral: {
        hasAura: boolean;
        astralActive: boolean;
        affectedBySpell: boolean;
    };
    matrix: {
        hasIcon: boolean;
        runningSilent: boolean;
    };
    meat: {
        hasHeat: boolean;
    };
};

type DetectionRangeTest = Parameters<foundry.canvas.perception.DetectionMode['_testRange']>[3];
type DetectionModeConfig = Parameters<foundry.canvas.perception.DetectionMode['_testRange']>[1];
type VisionSourceType = Parameters<foundry.canvas.perception.DetectionMode['_testRange']>[0];
type DetectionTargetType = Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>[1];
type VisionSourceState = {
    tokenFlags?: Record<string, unknown>;
    actorFlags?: Record<string, unknown>;
};

const createMockTokenVisionDocument = (
    tokenFlags: Record<string, unknown> = {},
    actorFlags: Record<string, unknown> = {},
): TokenDocumentWithVisionFlags => {
    const tokenState = { ...tokenFlags };
    const actorState = { ...actorFlags };

    return {
        actor: {
            getFlag: (_scope: 'shadowrun5e', key: typeof FLAGS.ActorDefaultVisionMode) => actorState[key],
        },
        getFlag: (_scope: 'shadowrun5e', key: typeof FLAGS.TokenActiveVisionMode) => tokenState[key],
        setFlag: async (_scope: 'shadowrun5e', key: typeof FLAGS.TokenActiveVisionMode, value: SR5VisionModeId) => {
            tokenState[key] = value;
            return value;
        },
        unsetFlag: async (_scope: 'shadowrun5e', key: typeof FLAGS.TokenActiveVisionMode) => {
            delete tokenState[key];
            return null;
        },
    };
};

const createVisibilityChecks = (data?: Partial<VisibilityChecksData>): VisibilityChecksData => ({
    astral: {
        hasAura: data?.astral?.hasAura ?? false,
        astralActive: data?.astral?.astralActive ?? false,
        affectedBySpell: data?.astral?.affectedBySpell ?? false,
    },
    matrix: {
        hasIcon: data?.matrix?.hasIcon ?? false,
        runningSilent: data?.matrix?.runningSilent ?? false,
    },
    meat: {
        hasHeat: data?.meat?.hasHeat ?? false,
    },
});

const createRangeTest = (x: number, y: number): DetectionRangeTest => ({
    point: {
        x,
        y,
        elevation: 0,
    },
    los: new Map(),
} as DetectionRangeTest);

const createModeConfig = (id: string, range: number | null): DetectionModeConfig => ({
    id,
    enabled: true,
    range,
} as DetectionModeConfig);

const createMockVisionSource = (
    visionModeId: string,
    sightRange = 25,
    statusEffects: string[] = [],
    state: VisionSourceState = {},
): VisionSourceType => {
    const statuses = new Set(statusEffects);
    const tokenFlags = state.tokenFlags ?? {};
    const actorFlags = state.actorFlags ?? {};

    const actorDocument = {
        getFlag: (_scope: string, key: string) => actorFlags[key],
    };

    const sourceDocument = {
        sight: {
            range: sightRange,
        },
        hasStatusEffect: (statusId: string) => statuses.has(statusId),
        getFlag: (_scope: string, key: string) => tokenFlags[key],
        actor: actorDocument,
    };

    const sourceObject = {
        document: sourceDocument,
        getLightRadius: (range: number) => range,
    };

    return {
        visionMode: {
            id: visionModeId,
        },
        object: sourceObject,
        data: {
            x: 0,
            y: 0,
        },
        x: 0,
        y: 0,
    } as unknown as VisionSourceType;
};

const createMockTokenTarget = (
    visibilityChecks: VisibilityChecksData,
    statusEffects: string[] = [],
): DetectionTargetType => {
    const statuses = new Set(statusEffects);
    const actorMock = {
        system: {
            visibilityChecks,
        },
        statuses,
    } as any;

    const tokenDocument = Object.create(TokenDocument.prototype) as TokenDocument;
    Object.defineProperty(tokenDocument, 'actor', {
        configurable: true,
        get: () => actorMock,
    });
    Object.defineProperty(tokenDocument, 'hasStatusEffect', {
        configurable: true,
        value: (statusId: string) => statuses.has(statusId),
    });

    const token = Object.create(Token.prototype) as Token;
    Object.defineProperty(token, 'document', {
        configurable: true,
        get: () => tokenDocument,
    });

    return token as DetectionTargetType;
};

const configureVisionModes = () => {
    VisionConfigurator.configureAstralPerception();
    VisionConfigurator.configureThermographicVision();
    VisionConfigurator.configureLowlight();
    VisionConfigurator.configureAR();
    VisionConfigurator.configureUltrasound();
};

export const shadowrunVisionModes = (context: QuenchBatchContext) => {
    const { describe, it } = context;
    const assert: Chai.AssertStatic = context.assert;

    describe('VisionConfigurator', () => {
        it('registers all SR5 vision and detection modes', () => {
            configureVisionModes();

            assert.equal(CONFIG.Canvas.detectionModes.astralPerception.id, 'astralPerception');
            assert.equal(CONFIG.Canvas.detectionModes.thermographic.id, 'thermographic');
            assert.equal(CONFIG.Canvas.detectionModes.lowlight.id, 'lowlight');
            assert.equal(CONFIG.Canvas.detectionModes.augmentedReality.id, 'augmentedReality');
            assert.equal(CONFIG.Canvas.detectionModes.ultrasound.id, 'ultrasound');

            assert.equal(CONFIG.Canvas.visionModes.astralPerception.id, 'astralPerception');
            assert.equal(CONFIG.Canvas.visionModes.thermographic.id, 'thermographic');
            assert.equal(CONFIG.Canvas.visionModes.lowlight.id, 'lowlight');
            assert.equal(CONFIG.Canvas.visionModes.augmentedReality.id, 'augmentedReality');
            assert.equal(CONFIG.Canvas.visionModes.ultrasound.id, 'ultrasound');
        });

        it('falls back to sight range for SR5 detection mode range checks', () => {
            configureVisionModes();

            const source = createMockVisionSource('basic', 20);
            const target = createMockTokenTarget(createVisibilityChecks());
            const test = createRangeTest(10, 0);

            const modeIds = ['astralPerception', 'thermographic', 'lowlight', 'augmentedReality', 'ultrasound'] as const;
            for (const modeId of modeIds) {
                const mode = CONFIG.Canvas.detectionModes[modeId];
                const modeConfig = createModeConfig(modeId, 0);
                const visibleInFallbackRange = mode._testRange(source, modeConfig, target, test);
                assert.isTrue(visibleInFallbackRange, `${modeId} should use sight range fallback`);
            }
        });

        it('prefers configured detection range over sight fallback', () => {
            configureVisionModes();

            const mode = CONFIG.Canvas.detectionModes.thermographic;
            const source = createMockVisionSource('basic', 20);
            const target = createMockTokenTarget(createVisibilityChecks({
                meat: {
                    hasHeat: true,
                },
            }));
            const test = createRangeTest(10, 0);

            const tooShortRange = createModeConfig('thermographic', 5);
            const longEnoughRange = createModeConfig('thermographic', 15);

            assert.isFalse(mode._testRange(source, tooShortRange, target, test));
            assert.isTrue(mode._testRange(source, longEnoughRange, target, test));
        });

        it('supports actor and token range override flags when mode range is not set', () => {
            configureVisionModes();

            const mode = CONFIG.Canvas.detectionModes.lowlight;
            const modeConfig = createModeConfig('lowlight', 0);
            const target = createMockTokenTarget(createVisibilityChecks());

            const actorOverrideSource = createMockVisionSource('basic', 10, [], {
                actorFlags: {
                    [FLAGS.ActorDetectionRangeOverrides]: {
                        lowlight: 20,
                    },
                },
            });
            assert.isTrue(mode._testRange(actorOverrideSource, modeConfig, target, createRangeTest(18, 0)));

            const tokenOverrideSource = createMockVisionSource('basic', 10, [], {
                actorFlags: {
                    [FLAGS.ActorDetectionRangeOverrides]: {
                        lowlight: 12,
                    },
                },
                tokenFlags: {
                    [FLAGS.TokenDetectionRangeOverrides]: {
                        lowlight: 22,
                    },
                },
            });
            assert.isTrue(mode._testRange(tokenOverrideSource, modeConfig, target, createRangeTest(21, 0)));
        });

        it('supports token and actor vision mode overrides for source state', () => {
            configureVisionModes();

            const astralMode = CONFIG.Canvas.detectionModes.astralPerception;
            const astralTarget = createMockTokenTarget(createVisibilityChecks({
                astral: {
                    hasAura: true,
                    astralActive: false,
                    affectedBySpell: false,
                },
            }));

            const tokenOverrideSource = createMockVisionSource('basic', 25, [], {
                tokenFlags: {
                    [FLAGS.TokenActiveVisionMode]: 'astralPerception',
                },
            });
            assert.isTrue(astralMode._canDetect(tokenOverrideSource, astralTarget));

            const actorDefaultSource = createMockVisionSource('basic', 25, [], {
                actorFlags: {
                    [FLAGS.ActorDefaultVisionMode]: 'astralPerception',
                },
            });
            assert.isTrue(astralMode._canDetect(actorDefaultSource, astralTarget));
        });

        it('cycles token HUD vision mode selection and falls back to actor default', async () => {
            configureVisionModes();

            const tokenDocument = createMockTokenVisionDocument({}, {
                [FLAGS.ActorDefaultVisionMode]: 'thermographic',
            });

            assert.equal(TokenVisionFlow.getTokenVisionModeSelection(tokenDocument), null);
            assert.equal(TokenVisionFlow.getTokenVisionMode(tokenDocument), 'thermographic');
            assert.equal(TokenVisionFlow.getTokenVisionModeSelectionLabelKey(tokenDocument), 'SR5.Vision.ActorDefault');

            const firstCycle = await TokenVisionFlow.cycleTokenVisionMode(tokenDocument);
            assert.equal(firstCycle, 'basic');
            assert.equal(TokenVisionFlow.getTokenVisionMode(tokenDocument), 'basic');

            const secondCycle = await TokenVisionFlow.cycleTokenVisionMode(tokenDocument);
            assert.equal(secondCycle, 'astralPerception');
            assert.equal(TokenVisionFlow.getTokenVisionModeSelectionLabelKey(tokenDocument), 'SR5.Vision.AstralPerception');
        });

        it('wraps vision mode cycle from final mode back to actor default', async () => {
            configureVisionModes();

            const tokenDocument = createMockTokenVisionDocument({
                [FLAGS.TokenActiveVisionMode]: 'ultrasound',
            }, {
                [FLAGS.ActorDefaultVisionMode]: 'lowlight',
            });

            const cycleResult = await TokenVisionFlow.cycleTokenVisionMode(tokenDocument);
            assert.equal(cycleResult, null);
            assert.equal(TokenVisionFlow.getTokenVisionMode(tokenDocument), 'lowlight');
            assert.equal(TokenVisionFlow.getTokenVisionModeSelectionLabelKey(tokenDocument), 'SR5.Vision.ActorDefault');
        });

        it('evaluates SR5-specific detection constraints', () => {
            configureVisionModes();

            const astralMode = CONFIG.Canvas.detectionModes.astralPerception;
            const thermographicMode = CONFIG.Canvas.detectionModes.thermographic;
            const lowlightMode = CONFIG.Canvas.detectionModes.lowlight;
            const arMode = CONFIG.Canvas.detectionModes.augmentedReality;
            const ultrasoundMode = CONFIG.Canvas.detectionModes.ultrasound;

            const astralSource = createMockVisionSource('astralPerception');
            const mundaneSource = createMockVisionSource('basic');

            const astralTarget = createMockTokenTarget(createVisibilityChecks({
                astral: {
                    hasAura: true,
                    astralActive: false,
                    affectedBySpell: false,
                },
            }));
            assert.isTrue(astralMode._canDetect(astralSource, astralTarget));
            assert.isFalse(astralMode._canDetect(mundaneSource, astralTarget));

            const thermographicTarget = createMockTokenTarget(createVisibilityChecks({
                meat: {
                    hasHeat: true,
                },
            }));
            assert.isTrue(thermographicMode._canDetect(mundaneSource, thermographicTarget));
            assert.isFalse(thermographicMode._canDetect(astralSource, thermographicTarget));

            const invisibleTarget = createMockTokenTarget(
                createVisibilityChecks(),
                [CONFIG.specialStatusEffects.INVISIBLE],
            );
            assert.isFalse(lowlightMode._canDetect(mundaneSource, invisibleTarget));

            const arRunningSilentTarget = createMockTokenTarget(createVisibilityChecks({
                matrix: {
                    hasIcon: true,
                    runningSilent: true,
                },
            }));
            assert.isFalse(arMode._canDetect(mundaneSource, arRunningSilentTarget));

            const arVisibleTarget = createMockTokenTarget(createVisibilityChecks({
                matrix: {
                    hasIcon: true,
                    runningSilent: false,
                },
            }));
            assert.isTrue(arMode._canDetect(mundaneSource, arVisibleTarget));

            assert.isTrue(ultrasoundMode._canDetect(mundaneSource, thermographicTarget));
            assert.isFalse(ultrasoundMode._canDetect(astralSource, thermographicTarget));
        });
    });
};