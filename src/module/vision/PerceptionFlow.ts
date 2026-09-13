import { FLAGS, LENGTH_UNIT_TO_METERS_MULTIPLIERS, SYSTEM_NAME } from '@/module/constants';
import { SR5Actor } from '@/module/actor/SR5Actor';
import { SR5Item } from '@/module/item/SR5Item';
import { PerceptionResolver } from './PerceptionResolver';
import { ULTRASOUND_RANGE_METERS } from './ultrasoundVision/ultrasoundDetectionMode';

type RefreshDocument = SR5Actor | SR5Item | ActiveEffect | TokenDocument;

export class PerceptionFlow {
    private static pendingTokens = new Set<TokenDocument>();
    private static refreshPending = foundry.utils.debounce(() => PerceptionFlow.flush(), 100);

    static registerHooks() {
        for (const documentName of ['Actor', 'Item', 'ActiveEffect', 'Token'] as const) {
            Hooks.on(`create${documentName}`, (document: RefreshDocument) => this.schedule(document));
            Hooks.on(`update${documentName}`, (document: RefreshDocument) => this.schedule(document));
            Hooks.on(`delete${documentName}`, (document: RefreshDocument) => this.schedule(document));
        }
        Hooks.on('canvasReady', (canvas) => this.refreshScene(canvas.scene));
    }

    /** Reconcile derived senses after loading or switching scenes. */
    static refreshScene(scene: Scene | null | undefined) {
        if (!scene) return;
        let refreshCanvas = false;
        for (const token of scene.tokens) {
            const tokenRefreshed = this.refreshTokenSource(token);
            refreshCanvas = tokenRefreshed || refreshCanvas;
        }
        if (refreshCanvas) canvas.perception.update({ refreshVision: true, refreshLighting: true });
    }

    static schedule(document: RefreshDocument) {
        for (const token of this.tokensFor(document)) this.pendingTokens.add(token);
        this.refreshPending();
    }

    static isRefreshEnabled(token: TokenDocument, worldEnabled = this.worldSettingEnabled()) {
        if (!worldEnabled) return false;
        return foundry.utils.getProperty(token, `flags.${SYSTEM_NAME}.${FLAGS.AutomaticTokenSenses}`) !== false;
    }

    static reconcileDetectionModes(
        detectionModes: Record<string, { enabled: boolean; range: number | null }>,
        capabilities: ReturnType<typeof PerceptionResolver.resolve>['capabilities'],
        range: number,
        sceneUnit = 'm',
    ) {
        const next = foundry.utils.deepClone(detectionModes);
        const managed = {
            lowlight: { enabled: capabilities.physical.lowLight, range },
            thermographic: { enabled: capabilities.physical.thermographic, range },
            ultrasound: {
                enabled: capabilities.physical.ultrasound,
                range: this.metersToSceneUnits(ULTRASOUND_RANGE_METERS, sceneUnit),
            },
        };

        for (const [id, sense] of Object.entries(managed)) {
            if (sense.enabled) next[id] = { enabled: true, range: sense.range };
            else delete next[id];
        }
        return next;
    }

    static reconcileAstralDetectionModes(
        detectionModes: Record<string, { enabled: boolean; range: number | null }>,
        range: number,
    ) {
        const next = foundry.utils.deepClone(detectionModes);
        for (const id of ['lowlight', 'thermographic', 'ultrasound', 'augmentedReality']) delete next[id];
        next.basicSight = { enabled: false, range: null };
        delete next.lightPerception;
        next.astralPerception = { enabled: true, range };
        return next;
    }

    static detectionModeUpdate(
        current: Record<string, { enabled: boolean; range: number | null }>,
        next: Record<string, { enabled: boolean; range: number | null }>,
    ) {
        const update = foundry.utils.deepClone(next) as Record<string, unknown>;
        for (const id of Object.keys(current)) {
            if (!(id in next)) update[`-=${id}`] = null;
        }
        return update;
    }

    static metersToSceneUnits(meters: number, sceneUnit: string) {
        const normalizedUnit = sceneUnit.trim().toLowerCase() as keyof typeof LENGTH_UNIT_TO_METERS_MULTIPLIERS;
        const multiplier = LENGTH_UNIT_TO_METERS_MULTIPLIERS[normalizedUnit];
        return multiplier ? meters / multiplier : meters;
    }

    private static worldSettingEnabled() {
        return game.settings.get(SYSTEM_NAME, FLAGS.AutomaticTokenSenses);
    }

    static refreshTokenSource(token: TokenDocument) {
        if (!this.isRefreshEnabled(token) || !token.actor) return false;
        const source = token.toObject();
        const range = Math.max(token.sight.range ?? 0, 10000);
        const projection = token.getFlag(SYSTEM_NAME, FLAGS.AstralProjection) as { role?: string } | undefined;
        const astralActive = !!token.getFlag(SYSTEM_NAME, FLAGS.AstralPerceptionVision)
            || projection?.role === 'form';
        const detectionModes = astralActive
            ? this.reconcileAstralDetectionModes(source.detectionModes, range)
            : this.reconcileDetectionModes(
                source.detectionModes,
                PerceptionResolver.resolve(token.actor).capabilities,
                range,
                token.parent?.grid.units,
            );
        token.updateSource({
            detectionModes: this.detectionModeUpdate(source.detectionModes, detectionModes) as any,
        });
        if (token.parent !== canvas.scene) return false;
        token.object?.initializeSources();
        return true;
    }

    private static tokensFor(document: RefreshDocument): TokenDocument[] {
        if (document instanceof TokenDocument) return [document];
        const actor = document instanceof SR5Actor
            ? document
            : document instanceof SR5Item
                ? document.actor
                : document.parent instanceof SR5Actor
                    ? document.parent
                    : document.parent instanceof SR5Item
                        ? document.parent.actor
                        : null;
        if (!actor) return [];

        return game.scenes.reduce<TokenDocument[]>((tokens, scene) => {
            tokens.push(...scene.tokens.filter(token => token.actor === actor));
            return tokens;
        }, []);
    }

    private static flush() {
        let refreshCanvas = false;
        for (const token of this.pendingTokens) {
            const tokenRefreshed = this.refreshTokenSource(token);
            refreshCanvas = tokenRefreshed || refreshCanvas;
        }
        this.pendingTokens.clear();
        if (refreshCanvas) canvas.perception.update({ refreshVision: true, refreshLighting: true });
    }
}
