/**
 * Measure the distance between two pixel coordinates
 * See BaseGrid.measureDistance for more details
 *
 * @param {Object} p0           The origin coordinate {x, y}
 * @param {Object} p1           The destination coordinate {x, y}
 * @param {boolean} gridSpaces  Enforce grid distance (if true) vs. direct point-to-point (if false)
 * @return {number}             The distance between p1 and p0
 */
import { SYSTEM_NAME } from './constants';

export const measureDistance = function (p0, p1, { gridSpaces = true } = {}) {
    if (!gridSpaces)
        {  // BaseGrid exists... fix in foundry types
            // @ts-ignore
            return BaseGrid.prototype.measureDistance.bind(this)(p0, p1, {
                        gridSpaces,
                    });
        }
    const gs = canvas.dimensions.size;
    const ray = new Ray(p0, p1);
    const nx = Math.abs(Math.ceil(ray.dx / gs));
    const ny = Math.abs(Math.ceil(ray.dy / gs));

    // Get the number of straight and diagonal moves
    const nDiagonal = Math.min(nx, ny);
    const nStraight = Math.abs(ny - nx);

    const diagonalRule = game.settings.get(SYSTEM_NAME, 'diagonalMovement');

    if (diagonalRule === '1-2-1') {
        const nd10 = Math.floor(nDiagonal / 2);
        const spaces = nd10 * 2 + (nDiagonal - nd10) + nStraight;
        return spaces * canvas.dimensions.distance;
    }
    return (nStraight + nDiagonal) * canvas.scene.data.gridDistance;
};
