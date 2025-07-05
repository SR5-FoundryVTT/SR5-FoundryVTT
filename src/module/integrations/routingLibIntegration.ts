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

    static routinglibPathfinding(
        waypoints: Token.FindMovementPathWaypoint[],
        token: SR5Token,
        movement: SR5Actor['system']['movement']
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
            const maxDistance = Math.max((movement?.run.value || 0) * 5, 20);
            for (let i = 1; i < waypoints.length; i++) {
                const fromWaypoint = waypoints[i - 1];

                if (fromWaypoint.x === undefined || fromWaypoint.y === undefined || waypoints[i].x === undefined || waypoints[i].y === undefined)
                    throw new Error('Waypoints must have defined x and y coordinates.');

                const { i: fromY, j: fromX } = grid.getOffset(fromWaypoint as TokenDocument.MovementWaypoint & { x: number, y: number });
                const { i: toY, j: toX } = grid.getOffset(waypoints[i] as TokenDocument.MovementWaypoint & { x: number, y: number });

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
