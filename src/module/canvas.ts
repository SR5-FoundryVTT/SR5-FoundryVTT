import { BaseGrid, SquareHex } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/grid/_module.mjs';
import {FLAGS, SYSTEM_NAME} from './constants';

interface DistanceOptions {
    gridSpaces?: boolean
}

/**
 * Pulled from the FoundryVTT DND5e system: grid.mjs#measureDistance
 * 
 * @param segments 
 * @param options 
 * @returns 
 */
const measureDistances = function (segments, options: DistanceOptions = {}) {
    if (!options.gridSpaces) return BaseGrid.prototype.measureDistances.call(this, segments, options);

    // Track the total number of diagonals
    let nDiagonal = 0;
    const rule = game.settings.get(SYSTEM_NAME, FLAGS.DiagonalMovement);;
    const d = canvas.dimensions as Canvas.Dimensions;

    // Iterate over measured segments
    return segments.map((s) => {
        let r = s.ray;

        // Determine the total distance traveled
        let nx = Math.abs(Math.ceil(r.dx / d.size));
        let ny = Math.abs(Math.ceil(r.dy / d.size));

        // Determine the number of straight and diagonal moves
        let nd = Math.min(nx, ny);
        let ns = Math.abs(ny - nx);
        nDiagonal += nd;

        // Estimate diagonal like other battle grid systems do. (DnD5e)
        if (rule === '1-2-1') {
            let nd10 = Math.floor(nDiagonal / 2) - Math.floor((nDiagonal - nd) / 2);
            let spaces = nd10 * 2 + (nd - nd10) + ns;
            return spaces * canvas.dimensions!.distance;
        }

        // Treat diagonal as straight line
        else if (rule === 'EUCL') {
            // return Math.round(Math.hypot(nx, ny) * canvas.scene.data.gridDistance);
            return Math.round(Math.hypot(nx, ny) * canvas.scene!.grid!.distance);
        }

        // Treat diagonal as straight movement
        else return (ns + nd) * canvas.scene!.grid!.distance;
    });
};


export function canvasInit() {
    // Add a custom measureDistances function, overwriting default to add more movement styles.
    SquareHex.prototype.measureDistances = measureDistances;
}