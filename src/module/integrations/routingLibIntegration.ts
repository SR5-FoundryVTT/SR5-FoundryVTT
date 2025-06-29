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
    calculatePath: (from: Waypoint, to: Waypoint, options: RoutingOptions) => Promise<RoutingResult>;
    cancelPathfinding: (pathfindingPromise: Promise<RoutingResult>) => void;
}

type RoutingResult = { path: Waypoint[]; cost: number } | null;

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
    }
}

declare module foundry.documents {
    class BaseScene {
        static defaultGrid: BaseGrid;
    }
}

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

    static routinglibPathfinding = (
        waypoints: FoundryWaypoint[],
        token: SR5Token,
        movement: Shadowrun.Movement,
    ) => {
        const grid = token.scene?.grid ?? foundry.documents.BaseScene.defaultGrid;

        const pathfindingResult: {
            result?: FoundryWaypoint[] | null;
            promise?: Promise<FoundryWaypoint[] | null>;
            cancel?: () => void;
        } = {
            result: undefined,
            promise: undefined,
            cancel: undefined,
        };

        const pathfindingPromises: Promise<RoutingResult>[] = [];

        pathfindingResult.promise = new Promise((resolve) => {
            const maxDistance = movement.run.value * 5;
            for (let i = 1; i < waypoints.length; i++) {
                const fromWaypoint = waypoints[i - 1];
                const { i: fromY, j: fromX } = grid.getOffset(fromWaypoint);
                const { i: toY, j: toX } = grid.getOffset(waypoints[i]);

                const from = { x: fromX, y: fromY };
                const to = { x: toX, y: toY };

                const routePromise = this.#routinglib!.calculatePath(from, to, { maxDistance, token });

                pathfindingPromises.push(routePromise);
            }

            void Promise.all(pathfindingPromises).then((partialRoutes) => {
                const routedWaypoints = [waypoints[0]];
                for (let i = 0; i < partialRoutes.length; i++) {
                    const route = partialRoutes[i];
                    if (route) {
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
                                explicit: true
                            });
                        }
                    } else {
                        pathfindingResult.result = null;
                        resolve(null);
                    }
                }
                pathfindingResult.result = routedWaypoints;
                resolve(routedWaypoints);
            });
        });
        pathfindingResult.cancel = () => {
            for (const pathfindingPromise of pathfindingPromises) {
                this.#routinglib!.cancelPathfinding(pathfindingPromise);
            }
        };

        return pathfindingResult;
    };
}
