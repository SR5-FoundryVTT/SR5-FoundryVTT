import { AstralProjectionFlow } from '../astralProjection/AstralProjectionFlow';
import {
    ASTRAL_BARRIER_REGION_BEHAVIOR,
    ASTRAL_WARD_REGION_BEHAVIOR,
    AstralBoundaryBehaviorData,
} from './AstralRegionBehavior';
import { ModifiableValue } from '@/module/mods/ModifiableValue';
import type { SuccessTest } from '@/module/tests/SuccessTest';

type ElevatedPoint = { x: number; y: number; elevation: number };
type AstralBoundaryField = 'blockSight' | 'blockMovement';
type AstralBoundary = { region: RegionDocument; behavior: RegionBehavior };
type MovementWaypoint = TokenDocument.SegmentizeMovementWaypoint;
type MovementCrossing = { index: number; from: ElevatedPoint };

type DetectionArgs = Parameters<foundry.canvas.perception.DetectionMode['_testPoint']>;

/** Distance in pixels a constrained path stops short of the boundary it would cross. */
const BOUNDARY_STOP_DISTANCE = 2;

export class AstralRegionFlow {
    /** Active astral boundaries per scene id, dropped whenever a Region or one of its behaviors changes. */
    private static boundaryCache = new Map<string, AstralBoundary[]>();

    private static refreshPending = foundry.utils.debounce(() => {
        if (!canvas.ready) return;
        canvas.perception.update({ refreshVision: true });
        canvas.tokens?.recalculatePlannedMovementPaths();
    }, 50);

    static registerHooks() {
        for (const documentName of ['Region', 'RegionBehavior'] as const) {
            for (const action of ['create', 'update', 'delete'] as const) {
                Hooks.on(`${action}${documentName}`, () => {
                    this.boundaryCache.clear();
                    this.refreshPending();
                });
            }
        }
        // Replacing a scene's embedded Regions wholesale doesn't run the embedded document hooks.
        Hooks.on('updateScene', (_scene, changes) => {
            this.boundaryCache.clear();
            if ('regions' in changes) this.refreshPending();
        });
        Hooks.on('deleteScene', (scene) => this.boundaryCache.delete(scene.id!));
        Hooks.on('sr5_testPrepareBaseValues', (test: SuccessTest) => this.applyAstralSightPenalty(test));
    }

    /**
     * Test if astral sight between two points crosses a boundary that blocks it.
     *
     * @param scene The scene both points are in.
     * @param origin The point sight originates from.
     * @param destination The point sight is tested against.
     * @param viewer The token looking, if any. Boundaries that let its actor through don't block its sight.
     */
    static blocksSight(
        scene: Scene | null | undefined,
        origin: ElevatedPoint,
        destination: ElevatedPoint,
        viewer?: TokenDocument | null,
    ) {
        if (!(scene instanceof Scene)) return false;
        for (const { region } of this.boundariesFor(scene, 'blockSight', viewer)) {
            const segments = region.segmentizeMovementPath([origin, destination], [{ x: 0, y: 0 }], 0.75);
            if (segments.some(segment => segment.type !== CONST.REGION_MOVEMENT_SEGMENTS.MOVE)) return true;
        }
        return false;
    }

    /** Sum the visual penalties of every astral boundary crossed by a line of sight. */
    static sightPenalty(
        scene: Scene | null | undefined,
        origin: ElevatedPoint,
        destination: ElevatedPoint,
        viewer?: TokenDocument | null,
    ) {
        if (!(scene instanceof Scene)) return 0;
        let penalty = 0;
        for (const { region, behavior } of this.boundariesFor(scene, undefined, viewer)) {
            if (!this.crosses(region, origin, destination)) continue;
            penalty += (behavior.system as unknown as AstralBoundaryBehaviorData).force;
        }
        return penalty;
    }

    /**
     * Test if a detection mode test point is hidden behind an astral boundary from its vision source.
     */
    static blocksDetection(visionSource: DetectionArgs[0], target: DetectionArgs[2], test: DetectionArgs[3]) {
        const viewer = (visionSource.object as { document?: unknown } | null)?.document;
        if (!(viewer instanceof TokenDocument)) return false;
        const targetDocument = (target as { document?: unknown } | null)?.document;
        const targetToken = targetDocument instanceof TokenDocument ? targetDocument : null;
        const sourceOrigin = visionSource.origin as typeof visionSource.origin & { elevation?: number };
        const targetPoint = test.point as typeof test.point & { elevation?: number };
        const origin = {
            x: sourceOrigin.x,
            y: sourceOrigin.y,
            elevation: sourceOrigin.elevation ?? viewer.elevation,
        };
        const destination = {
            x: targetPoint.x,
            y: targetPoint.y,
            elevation: targetPoint.elevation ?? targetToken?.elevation ?? origin.elevation,
        };
        return this.blocksSight(viewer.parent, origin, destination, viewer);
    }

    /**
     * Test if an astral form's movement crosses a boundary that blocks it.
     *
     * Unconstrained movement (a GM with unconstrained movement, the token config) and pasted or undone
     * movement pass, the same as they pass walls.
     */
    static blocksMovement(token: TokenDocument, movement: TokenDocument.PreUpdateMovement) {
        if (movement.constrainOptions?.ignoreWalls) return false;
        if (movement.method === 'paste' || movement.method === 'undo') return false;
        // Foundry freezes pre-movement data, while segmentizeRegionMovementPath declares mutable
        // waypoint input even though it does not mutate the caller's waypoints.
        const waypoints = [movement.origin, ...movement.passed.waypoints] as unknown as MovementWaypoint[];
        return this.findMovementCrossing(token, waypoints) !== null;
    }

    /**
     * Cut a movement path short before the first astral boundary it would cross, like walls do.
     *
     * @returns The constrained path, starting with the same origin, or null if the path crosses nothing.
     */
    static constrainMovementPath<T extends MovementWaypoint>(token: TokenDocument, path: T[]): T[] | null {
        const crossing = this.findMovementCrossing(token, path);
        if (!crossing) return null;

        const constrained = path.slice(0, crossing.index);
        const previous = path[crossing.index - 1];
        const next = path[crossing.index];
        const stop = this.stopShortOf(previous, crossing.from);
        if (stop) {
            const waypoint = { ...next, x: stop.x, y: stop.y, elevation: stop.elevation };
            // Only keep the stop when reaching it crosses nothing, e.g. not for vertical entries.
            if (!this.findMovementCrossing(token, [previous, waypoint])) constrained.push(waypoint);
        }
        return constrained;
    }

    static notifyBlockedMovement() {
        ui.notifications?.warn(game.i18n.localize('SR5.Vision.AstralRegions.MovementBlocked'));
    }

    /** Apply the Force penalty for an Assensing test across astral boundaries. */
    static applyAstralSightPenalty(test: SuccessTest) {
        if (test.data.action.skill !== 'assensing') return;
        const viewer = test.actor?.getToken();
        if (!viewer || !(viewer.parent instanceof Scene)) return;

        const origin = this.tokenCenter(viewer);
        let penalty = 0;
        for (const target of test.targets) {
            if (!(target instanceof TokenDocument) || target.parent !== viewer.parent) continue;
            penalty = Math.max(penalty, this.sightPenalty(viewer.parent, origin, this.tokenCenter(target), viewer));
        }
        ModifiableValue.setUnique(test.data.pool, 'SR5.Vision.AstralRegions.ForcePenalty', -penalty, {
            source: 'SR5 315',
        });
    }

    /**
     * Find the first boundary crossing along a movement path of an astral form.
     *
     * Every leg is tested as a straight line, regardless of the movement action. Teleporting actions
     * only test their endpoints, which would let a form hop over any boundary it doesn't land in.
     */
    private static findMovementCrossing(token: TokenDocument, waypoints: MovementWaypoint[]): MovementCrossing | null {
        if (!this.isAstralForm(token)) return null;
        const scene = token.parent;
        if (!(scene instanceof Scene) || waypoints.length < 2) return null;
        const boundaries = this.boundariesFor(scene, 'blockMovement', token);
        if (!boundaries.length) return null;

        const action = this.straightLineAction();
        for (let index = 1; index < waypoints.length; index++) {
            const leg = [
                { ...waypoints[index - 1], action },
                { ...waypoints[index], action },
            ] as MovementWaypoint[];
            let first: MovementCrossing | null = null;
            let firstDistance = Infinity;
            for (const { region } of boundaries) {
                const crossing = token.segmentizeRegionMovementPath(region, leg)
                    .find(segment => segment.type !== CONST.REGION_MOVEMENT_SEGMENTS.MOVE);
                if (!crossing) continue;
                const start = leg[0];
                const distance = Math.hypot(crossing.from.x - (start.x ?? token.x), crossing.from.y - (start.y ?? token.y));
                if (distance < firstDistance) {
                    firstDistance = distance;
                    first = { index, from: crossing.from };
                }
            }
            if (first) return first;
        }
        return null;
    }

    /** Pick a point just before the boundary on the line from the previous waypoint, if there is room. */
    private static stopShortOf(previous: MovementWaypoint, boundary: ElevatedPoint): ElevatedPoint | null {
        const dx = boundary.x - (previous.x ?? boundary.x);
        const dy = boundary.y - (previous.y ?? boundary.y);
        const length = Math.hypot(dx, dy);
        if (length <= BOUNDARY_STOP_DISTANCE) return null;
        const scale = (length - BOUNDARY_STOP_DISTANCE) / length;
        return {
            x: Math.round((previous.x ?? boundary.x) + dx * scale),
            y: Math.round((previous.y ?? boundary.y) + dy * scale),
            elevation: boundary.elevation,
        };
    }

    /** A configured movement action that doesn't teleport, so region segmentation follows the whole line. */
    private static straightLineAction() {
        const actions = CONFIG.Token.movement.actions;
        if (actions.walk && !actions.walk.teleport) return 'walk';
        return Object.keys(actions).find(id => !actions[id].teleport) ?? 'walk';
    }

    /** Active boundaries of a scene that enable the given switch and don't let the token's actor through. */
    private static boundariesFor(scene: Scene, field?: AstralBoundaryField, token?: TokenDocument | null) {
        const actorUuid = token?.baseActor?.uuid;
        return this.activeBoundaries(scene).filter(({ behavior }) => {
            const system = behavior.system as unknown as AstralBoundaryBehaviorData;
            return (!field || system[field]) && !(actorUuid && system.allowedActors.has(actorUuid));
        });
    }

    /** Projected forms and actors that exist only on the astral plane are constrained by barriers. */
    private static isAstralForm(token: TokenDocument) {
        if (AstralProjectionFlow.isForm(token)) return true;
        const targets = token.actor?.system.visibilityChecks.targets;
        return targets?.astral.astralActive === true && targets.physical.active === false;
    }

    private static crosses(region: RegionDocument, origin: ElevatedPoint, destination: ElevatedPoint) {
        const segments = region.segmentizeMovementPath([origin, destination], [{ x: 0, y: 0 }], 0.75);
        return segments.some(segment => segment.type !== CONST.REGION_MOVEMENT_SEGMENTS.MOVE);
    }

    private static tokenCenter(token: TokenDocument): ElevatedPoint {
        const size = token.parent?.dimensions.size ?? 1;
        return {
            x: token.x + token.width * size / 2,
            y: token.y + token.height * size / 2,
            elevation: token.elevation,
        };
    }

    private static activeBoundaries(scene: Scene) {
        const cached = this.boundaryCache.get(scene.id!);
        if (cached) return cached;
        const boundaries: AstralBoundary[] = [];
        for (const region of scene.regions) {
            for (const behavior of region.behaviors) {
                if (behavior.active && this.isAstralBoundary(behavior.type)) boundaries.push({ region, behavior });
            }
        }
        this.boundaryCache.set(scene.id!, boundaries);
        return boundaries;
    }

    private static isAstralBoundary(type: string) {
        return type === ASTRAL_BARRIER_REGION_BEHAVIOR || type === ASTRAL_WARD_REGION_BEHAVIOR;
    }
}
