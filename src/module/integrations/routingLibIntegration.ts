import { SR5Token } from '../token/SR5Token';

interface Waypoint {
    x: number;
    y: number;
}

interface FoundryWaypoint extends Waypoint {
    shape: number;
    height: number;
    width: number;
    elevation: number;
    action: string;
    snapped: boolean;
    explicit: boolean;
    checkpoint: boolean;
}

interface RoutingOptions {
    maxDistance: number;
    token: Token;
}

interface RoutingLib {
    calculatePath: (from: Waypoint, to: Waypoint, options: RoutingOptions) => Promise<RoutingLibRoutingResult | null>;
    cancelPathfinding: (pathfindingPromise: Promise<RoutingLibRoutingResult>) => void;
}

interface RoutingLibRoutingResult {
    path: Waypoint[];
    cost: number;
}

interface GridCoordinate {
    /**
     * Row index
     */
    i: number;
    /**
     * Column index
     */
    j: number;
}

declare global {
    interface Scene {
        grid: BaseGrid;
    }

    interface BaseGrid {
        getOffset(position: Waypoint): GridCoordinate;

        getTopLeftPoint(coordinate: GridCoordinate): Waypoint;
        getSnappedPoint(p: Point, behavior: {mode: number}): Point;

        sizeX: number;
        sizeY: number;
        isGridless: boolean;
    }
}

declare module foundry.documents {
    class BaseScene {
        static defaultGrid: BaseGrid;
    }
}

type PathfindingResult = {
    result: FoundryWaypoint[] | null | undefined;
    promise: Promise<FoundryWaypoint[] | null>;
    cancel: () => void;
};

/**
 * Integration for the routingLib FoundryVTT module:
 * https://foundryvtt.com/packages/routinglib
 *
 * Integration is inteded to be optional.
 *
 * For documentation of the module see:
 * - https://github.com/manuelVo/foundryvtt-routinglib/tree/master#using-routinglib-in-a-module or
 * - follow module README for an updated link.
 *
 */
export class RoutingLibIntegration {
    static #routingLibReady = false;

    static #routinglib: RoutingLib | null = null;

    static get routingLibReady() {
        return this.#routingLibReady;
    }

    static init() {
        Hooks.once('routinglib.ready', () => {
            this.#routingLibReady = true;
            // @ts-expect-error global variable
            this.#routinglib = routinglib;
        });
    }

    private static centerOffset(grid: BaseGrid, waypoint: FoundryWaypoint) {
        return {
            x: waypoint.x + (grid.isGridless ? 0 : grid.sizeX / 2),
            y: waypoint.y + (grid.isGridless ? 0 : grid.sizeY / 2),
        };
    }

    static routinglibPathfinding(waypoints: FoundryWaypoint[], token: SR5Token, movement: Shadowrun.Movement): PathfindingResult  {
        const grid = token.scene?.grid ?? foundry.documents.BaseScene.defaultGrid;

        const pathfindingResult: Partial<PathfindingResult> = {
            result: undefined,
            promise: undefined,
            cancel: undefined,
        };

        const pathfindingPromises: Promise<RoutingLibRoutingResult>[] = [];

        pathfindingResult.cancel = () => {
            for (const pathfindingPromise of pathfindingPromises) {
                this.#routinglib!.cancelPathfinding(pathfindingPromise);
            }
        }

        pathfindingResult.promise = new Promise<FoundryWaypoint[] | null>((resolve) => {
            const maxDistance = Math.max(movement.run.value * 5, 20);

            // Snap waypoints to their grid cells to avoid issues from minor floating-point differences.
            for (let i = 0; i < waypoints.length; i++) {
                const offset = grid.getOffset(this.centerOffset(grid, waypoints[i]));
                waypoints[i] = {...waypoints[i], ...grid.getTopLeftPoint(offset)};
            }

            for (let i = 1; i < waypoints.length; i++) {
                const fromWaypoint = waypoints[i - 1];
                const { i: fromY, j: fromX } = grid.getOffset(this.centerOffset(grid, fromWaypoint));
                const { i: toY, j: toX } = grid.getOffset(this.centerOffset(grid, waypoints[i]));

                const from = { x: fromX, y: fromY };
                const to = { x: toX, y: toY };

                const routePromise = this.#routinglib!.calculatePath(from, to, {
                    maxDistance,
                    token,
                }).then(result => {
                    if (result) {
                        return result;
                    } else {
                        throw new Error('Unable to find route.');
                    }
                });

                pathfindingPromises.push(routePromise);
            }

            void Promise.all(pathfindingPromises)
                .then((partialRoutes) => {
                    const routedWaypoints: FoundryWaypoint[] = [waypoints[0]];
                    for (let i = 0; i < partialRoutes.length; i++) {
                        const route = partialRoutes[i];
                        routedWaypoints.pop();
                        const fromWaypoint = waypoints[i];
                        for (const waypoint of route.path) {
                            const topLeftPoint = grid.getTopLeftPoint({ j: waypoint.x, i: waypoint.y });
                            routedWaypoints.push({
                                x: topLeftPoint.x,
                                y: topLeftPoint.y,
                                elevation: fromWaypoint.elevation,
                                width: fromWaypoint.width,
                                height: fromWaypoint.height,
                                shape: fromWaypoint.shape,
                                action: fromWaypoint.action,
                                snapped: true,
                                checkpoint: true,
                                explicit: true,
                            });
                        }
                    }
                    return routedWaypoints;
                })
                .catch(() => {
                    pathfindingResult.cancel!()
                    const findMovementPathResult: PathfindingResult = token.findMovementPath(waypoints, {skipRoutingLib: true});
                    return findMovementPathResult.promise
                })
                .then(value => {
                    pathfindingResult.result = value;
                    resolve(value);
                });
        });

        return pathfindingResult as PathfindingResult;
    };
}
