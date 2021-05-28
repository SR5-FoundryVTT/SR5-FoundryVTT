// directly pulled from DND5e, just changed the
export const measureDistance = function (segments, options = {}) {
    if (!game || !game.ready || !canvas || !canvas.ready) return 0;

    //@ts-ignore
    // basegrid isn't typed, options aren't really important
    if (!options.gridSpaces) return BaseGrid.prototype.measureDistances.call(this, segments, options);

    // Track the total number of diagonals
    let nDiagonal = 0;
    const rule = this.parent.diagonalRule;
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

        // Common houserule variant
        if (rule === '1-2-1') {
            let nd10 = Math.floor(nDiagonal / 2) - Math.floor((nDiagonal - nd) / 2);
            let spaces = nd10 * 2 + (nd - nd10) + ns;
            // @ts-ignore
            return spaces * canvas.dimensions.distance;
        }

        // Euclidean Measurement
        else if (rule === 'EUCL') {
            // @ts-ignore
            return Math.round(Math.hypot(nx, ny) * canvas.scene.data.gridDistance);
        }

        // diag and straight are same space count
        // @ts-ignore
        else return (ns + nd) * canvas.scene.data.gridDistance;
    });
};
