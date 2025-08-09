import { SR5Actor } from '../actor/SR5Actor';
import { SR5Token } from '../token/SR5Token';

interface Waypoint {
    x: number;
    y: number;
}

interface RoutingOptions {
    maxDistance: number;
    token: SR5Token;
}

interface RoutingLibRoutingResult {
    path: Waypoint[];
    cost: number;
}

export interface RoutingLib {
    calculatePath: (from: Waypoint, to: Waypoint, options: RoutingOptions) => Promise<RoutingLibRoutingResult | null>;
    cancelPathfinding: (pathfindingPromise: Promise<RoutingLibRoutingResult>) => void;
}

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
            this.#routinglib = routinglib;
        });
    }

    /**
     * Converts waypoint coordinates between Foundry (top-left) and RoutingLib (center-based).
     *
     * Use 'toRoutingLib' to shift to center-based coordinates for pathfinding.
     * Use 'fromRoutingLib' to shift back to top-left coordinates.
     */
    private static convertWaypoint<T extends { x?: number, y?: number }>(
        grid: foundry.grid.BaseGrid,
        waypoint: T,
        mode: 'toRoutingLib' | 'fromRoutingLib'
    ): T & { x: number, y: number } {
        return {
            ...waypoint,
            x: Math.round(waypoint.x! + (grid.sizeX / 2) * (mode === 'toRoutingLib' ? 1 : -1)),
            y: Math.round(waypoint.y! + (grid.sizeY / 2) * (mode === 'toRoutingLib' ? 1 : -1)),
        };
    }

    /**
     * Calculates a path using RoutingLib's pathfinding.
     *
     * @param waypoints - The waypoints to route through.
     * @param token - The token for which the path is calculated.
     * @param movement - The movement data of the token's actor.
     */
    static routinglibPathfinding(
        waypoints: Token.FindMovementPathWaypoint[],
        token: SR5Token,
        movement: NonNullable<SR5Actor['system']['movement']>
    ): Token.FindMovementPathJob {
        const grid = token.scene?.grid ?? foundry.documents.BaseScene.defaultGrid;

        const pathfindingResult: Partial<Token.FindMovementPathJob> = {
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

        pathfindingResult.promise = new Promise<TokenDocument.MovementWaypoint[] | null>((resolve) => {
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
                    const routedWaypoints = [waypoints[0]];
                    for (let i = 0; i < partialRoutes.length; i++) {
                        const route = partialRoutes[i];
                        routedWaypoints.pop();
                        const fromWaypoint = waypoints[i];
                        for (const waypoint of route.path) {
                            const centerPoint = grid.getCenterPoint({ j: waypoint.x, i: waypoint.y });
                            const foundryWaypoint = this.convertWaypoint(grid, centerPoint, 'fromRoutingLib');
                            routedWaypoints.push({
                                x: foundryWaypoint.x,
                                y: foundryWaypoint.y,
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
                    }
                    return routedWaypoints;
                })
                .catch(async () => {
                    pathfindingResult.cancel!()
                    const findMovementPathResult = token.findMovementPath(waypoints, {skipRoutingLib: true});
                    return findMovementPathResult.promise
                })
                .then(value => {
                    pathfindingResult.result = value as TokenDocument.MovementWaypoint[] | null;
                    resolve(value as TokenDocument.MovementWaypoint[] | null);
                });
        });

        return pathfindingResult as Token.FindMovementPathJob;
    };
}
