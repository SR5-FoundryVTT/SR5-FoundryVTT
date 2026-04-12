import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import VisionConfigurator from '@/module/vision/visionConfigurator';

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
): VisionSourceType => {
    const statuses = new Set(statusEffects);

    const sourceDocument = {
        sight: {
            range: sightRange,
        },
        hasStatusEffect: (statusId: string) => statuses.has(statusId),
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

            assert.equal(CONFIG.Canvas.visionModes.astralPerception.id, 'astralPerception');
            assert.equal(CONFIG.Canvas.visionModes.thermographic.id, 'thermographic');
            assert.equal(CONFIG.Canvas.visionModes.lowlight.id, 'lowlight');
            assert.equal(CONFIG.Canvas.visionModes.augmentedReality.id, 'augmentedReality');
        });

        it('falls back to sight range for SR5 detection mode range checks', () => {
            configureVisionModes();

            const source = createMockVisionSource('basic', 20);
            const target = createMockTokenTarget(createVisibilityChecks());
            const test = createRangeTest(10, 0);

            const modeIds = ['astralPerception', 'thermographic', 'lowlight', 'augmentedReality'] as const;
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

        it('evaluates SR5-specific detection constraints', () => {
            configureVisionModes();

            const astralMode = CONFIG.Canvas.detectionModes.astralPerception;
            const thermographicMode = CONFIG.Canvas.detectionModes.thermographic;
            const lowlightMode = CONFIG.Canvas.detectionModes.lowlight;
            const arMode = CONFIG.Canvas.detectionModes.augmentedReality;

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
        });
    });
};