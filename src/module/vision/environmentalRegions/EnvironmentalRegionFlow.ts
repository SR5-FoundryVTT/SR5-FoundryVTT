import { FLAGS, SR, SYSTEM_NAME } from '@/module/constants';
import {
    ENVIRONMENT_REGION_BEHAVIOR,
    type EnvironmentalRegionBehaviorData,
    type EnvironmentLevel,
} from './EnvironmentalRegionBehavior';

export type RegionalPhysicalEnvironment = Record<'visibility' | 'light' | 'wind', number>;

export interface EnvironmentalRegionRatings {
    backgroundCount: number;
    matrixNoise: number;
    physical: RegionalPhysicalEnvironment;
}

type ProjectionFlag = { role?: string; formTokenUuid?: string; bodyTokenUuid?: string } | undefined;

const EMPTY_PHYSICAL: RegionalPhysicalEnvironment = { visibility: 0, light: 0, wind: 0 };

export class EnvironmentalRegionFlow {
    private static refreshPending = foundry.utils.debounce(() => {
        canvas.tokens?.hud.render();
        const app = foundry.applications.instances.get('situational-modifiers-application');
        if (app) void app.render({ force: true });
    }, 50);

    static registerHooks() {
        for (const documentName of ['Region', 'RegionBehavior'] as const) {
            for (const action of ['create', 'update', 'delete'] as const) {
                Hooks.on(`${action}${documentName}`, () => this.refreshPending());
            }
        }
        Hooks.on('updateScene', (_scene, changes) => {
            if ('regions' in changes) this.refreshPending();
        });
        Hooks.on('updateToken', (token, changes) => {
            if (['x', 'y', 'elevation', 'width', 'height', 'depth', 'shape', 'level'].some(key => key in changes)) {
                this.refreshAfterTokenAnimation(token);
            }
        });
        Hooks.on('moveToken', token => this.refreshAfterTokenAnimation(token));
        Hooks.on('createToken', () => this.refreshPending());
        Hooks.on('deleteToken', () => this.refreshPending());
    }

    /** Resolve transient environmental values at the physical, astral, or Matrix location involved. */
    static ratingsAtToken(token: TokenDocument | null | undefined): EnvironmentalRegionRatings {
        const magicBehaviors = this.behaviorsAt(this.magicToken(token));
        const matrixBehaviors = this.behaviorsAt(this.matrixToken(token));
        const physicalBehaviors = this.behaviorsAt(token ?? null);

        return {
            backgroundCount: Math.max(0, ...magicBehaviors.map(behavior => this.dataOf(behavior).backgroundCount)),
            matrixNoise: matrixBehaviors.reduce(
                (noise, behavior) => noise + this.dataOf(behavior).matrixNoise,
                0,
            ),
            physical: physicalBehaviors.reduce((strongest, behavior) => {
                const data = this.dataOf(behavior);
                strongest.visibility = Math.min(strongest.visibility, this.levelValue(data.visibility));
                strongest.light = Math.min(strongest.light, this.levelValue(data.light));
                strongest.wind = Math.min(strongest.wind, this.levelValue(data.wind));
                return strongest;
            }, { ...EMPTY_PHYSICAL }),
        };
    }

    private static behaviorsAt(token: TokenDocument | null): RegionBehavior[] {
        const scene = token?.parent;
        if (!token || !(scene instanceof Scene)) return [];
        const behaviors: RegionBehavior[] = [];
        for (const region of scene.regions) {
            if (!token.testInsideRegion(region)) continue;
            for (const behavior of region.behaviors) {
                if (behavior.active && behavior.type === ENVIRONMENT_REGION_BEHAVIOR) behaviors.push(behavior);
            }
        }
        return behaviors;
    }

    private static dataOf(behavior: RegionBehavior) {
        return behavior.system as unknown as EnvironmentalRegionBehaviorData;
    }

    private static levelValue(level: EnvironmentLevel): number {
        return level === 'none' ? SR.combat.environmental.levels.good : SR.combat.environmental.levels[level];
    }

    private static magicToken(token: TokenDocument | null | undefined) {
        const state = token?.getFlag(SYSTEM_NAME, FLAGS.AstralProjection) as ProjectionFlag;
        if (state?.role === 'body' && state.formTokenUuid) return this.resolveToken(state.formTokenUuid) ?? token!;
        return token ?? null;
    }

    private static matrixToken(token: TokenDocument | null | undefined) {
        const state = token?.getFlag(SYSTEM_NAME, FLAGS.AstralProjection) as ProjectionFlag;
        if (state?.role === 'form' && state.bodyTokenUuid) return this.resolveToken(state.bodyTokenUuid) ?? token!;
        return token ?? null;
    }

    private static resolveToken(uuid: string) {
        const document = fromUuidSync(uuid as any);
        return document instanceof TokenDocument ? document : null;
    }

    private static refreshAfterTokenAnimation(token: TokenDocument) {
        this.refreshPending();
        const animation = token.object?.movementAnimationPromise;
        if (!animation) return;
        void animation.then(
            () => this.refreshPending(),
            () => this.refreshPending(),
        );
    }
}
