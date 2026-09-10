import { FLAGS, SYSTEM_NAME } from '@/module/constants';
import { SR5Actor } from '@/module/actor/SR5Actor';
import { SR5Item } from '@/module/item/SR5Item';
import { PerceptionResolver } from './PerceptionResolver';

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
    ) {
        const next = foundry.utils.deepClone(detectionModes);
        const managed = {
            lowlight: capabilities.physical.lowLight,
            thermographic: capabilities.physical.thermographic,
        };

        for (const [id, enabled] of Object.entries(managed)) {
            if (enabled) next[id] = { enabled: true, range };
            else delete next[id];
        }
        return next;
    }

    private static worldSettingEnabled() {
        return game.settings.get(SYSTEM_NAME, FLAGS.AutomaticTokenSenses);
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
            if (!this.isRefreshEnabled(token) || !token.actor) continue;
            const state = PerceptionResolver.resolve(token.actor);
            const source = token.toObject();
            const range = Math.max(token.sight.range ?? 0, 10000);
            const detectionModes = this.reconcileDetectionModes(source.detectionModes, state.capabilities, range);
            token.updateSource({ detectionModes });

            if (token.parent === canvas.scene) {
                token.object?.initializeSources();
                refreshCanvas = true;
            }
        }
        this.pendingTokens.clear();
        if (refreshCanvas) canvas.perception.update({ refreshVision: true, refreshLighting: true });
    }
}
