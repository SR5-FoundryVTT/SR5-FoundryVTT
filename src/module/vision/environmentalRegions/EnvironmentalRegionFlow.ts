import { SR } from '@/module/constants';
import { getProjectionBody, getProjectionForm } from '../astralProjection/AstralProjectionState';
import {
    ENVIRONMENT_REGION_BEHAVIOR,
    type EnvironmentalRegionType,
    type EnvironmentLevel,
} from '@/module/types/regionBehavior/Environmental';

export type RegionalPhysicalEnvironment = Record<'visibility' | 'light' | 'glare' | 'wind', number>;

export interface EnvironmentalRegionRatings {
    backgroundCount: number;
    matrixNoise: number;
    physical: RegionalPhysicalEnvironment;
}

const EMPTY_PHYSICAL: RegionalPhysicalEnvironment = { visibility: 0, light: 0, glare: 0, wind: 0 };

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

    /**
     * Resolve transient environmental values at the physical, astral, or Matrix location involved.
     *
     * While projecting, magic happens where the astral form is and the Matrix is reached from the body.
     */
    static ratingsAtToken(token: TokenDocument | null | undefined): EnvironmentalRegionRatings {
        token ??= null;
        const magicBehaviors = this.behaviorsAt(getProjectionForm(token) ?? token);
        const matrixBehaviors = this.behaviorsAt(getProjectionBody(token) ?? token);
        const physicalBehaviors = this.behaviorsAt(token);

        return {
            backgroundCount: Math.max(0, ...magicBehaviors.map(behavior => this.dataOf(behavior).backgroundCount)),
            matrixNoise: matrixBehaviors.reduce(
                (noise, behavior) => noise + this.dataOf(behavior).matrixNoise,
                0,
            ),
            physical: physicalBehaviors.reduce((strongest, behavior) => {
                const data = this.dataOf(behavior);
                strongest.visibility = Math.min(strongest.visibility, this.levelValue(data.visibility));
                strongest.wind = Math.min(strongest.wind, this.levelValue(data.wind));
                // Light and glare are one column: the worst region sets it, the later one on a tie.
                const [kind, level] = data.lightGlare.split('-');
                const value = this.levelValue((level ?? 'none') as EnvironmentLevel);
                if (value < 0 && value <= Math.min(strongest.light, strongest.glare)) {
                    strongest.light = kind === 'light' ? value : 0;
                    strongest.glare = kind === 'glare' ? value : 0;
                }
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
        return behavior.system as unknown as EnvironmentalRegionType;
    }

    private static levelValue(level: EnvironmentLevel): number {
        return level === 'none' ? SR.combat.environmental.levels.good : SR.combat.environmental.levels[level];
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
