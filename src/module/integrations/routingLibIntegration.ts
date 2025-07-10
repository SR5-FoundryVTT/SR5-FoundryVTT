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

        getCenterPoint(coordinate: GridCoordinate): Waypoint;
        getTopLeftPoint(coordinate: GridCoordinate): Waypoint;

        size: number;
        sizeX: number;
        sizeY: number;
        isHex: boolean;
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

    /**
     * Converts waypoint coordinates between Foundry (top-left) and RoutingLib (center-based).
     * 
     * Use 'toRoutingLib' to shift to center-based coordinates (used for pathfinding).
     * Use 'adjustGridless' to correct output when using a gridless grid that was treated as gridded.
     */
    private static convertWaypoint(grid: BaseGrid, waypoint: FoundryWaypoint, mode: 'toRoutingLib' | 'adjustGridless') {
        return {
            ...waypoint,
            x: waypoint.x + (grid.sizeX / 2) * (mode === 'toRoutingLib' ? 1 : -1),
            y: waypoint.y + (grid.sizeY / 2) * (mode === 'toRoutingLib' ? 1 : -1),
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
            const maxDistance = Math.max(movement.run.value * 5, 20 * (grid.isGridless ? grid.size : 1));

            for (let i = 1; i < waypoints.length; i++) {
                const fromWaypoint = this.convertWaypoint(grid, waypoints[i - 1], 'toRoutingLib');
                const toWaypoint = this.convertWaypoint(grid, waypoints[i], 'toRoutingLib');

                const { i: fromY, j: fromX } = grid.getOffset(fromWaypoint);
                const { i: toY, j: toX } = grid.getOffset(toWaypoint);

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
                                x: Math.round(topLeftPoint.x),
                                y: Math.round(topLeftPoint.y),
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

                    // routingLib returns waypoints with coordinates relative to the top-left of the token.
                    for (let i = 0; i < routedWaypoints.length && grid.isGridless; i++)
                        routedWaypoints[i] = this.convertWaypoint(grid, routedWaypoints[i], 'adjustGridless');

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
