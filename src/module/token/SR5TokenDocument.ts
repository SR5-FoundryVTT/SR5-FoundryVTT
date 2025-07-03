import MovementActorData = Shadowrun.MovementActorData;

interface Waypoint {
    x: number;
    y: number;
    cost?: number;
    action: string;
}

interface MeasureMovementOptions {}

interface MeasurementWaypoint {
    cost: number;
}

interface MovementMeasurement {
    waypoints: MeasurementWaypoint[];
}

declare global {
    interface TokenDocument {
        movementAction: string;
        movementHistory: Waypoint[];
        measureMovementPath(waypoints: Waypoint[], options: MeasureMovementOptions): MovementMeasurement;
    }
}

export class SR5TokenDocument extends TokenDocument {

    /**
     * Used by measureMovementPath to track if a movement is being planned or executed.
     * @private
     */
    #movementInProgress = false;

    override async _preUpdate(changed, options, user) {
        this.#movementInProgress = true;
        try {
            await super._preUpdate(changed, options, user);
        } finally {
            this.#movementInProgress = false;
        }
    }

    /**
     * This method measures the distance a Token moves through the provided waypoints.
     * If the token actor implements MovementActorData and the selected movement action is 'walk', it will change the movement
     * action for each waypoint according to the rules for walking/running/sprinting.
     *
     * This method gets called many times, both when the user is measuring and while the token is actually moving.
     * The bulk of the token movement logic happens in TokenDocument#_preUpdate and specifically in
     * TokenDocument##preUpdateMovement.
     * The private property SR5TokenDocument##movementInProgress is used to track if a user is currently measuring and planning
     * a move or if the move is actually in progress.
     * While a move is in progress we skip assigning movement actions, because this method gets called with multiple
     * different sections of the route depending on the progress of the movement.
     * This makes it impossible to accurately assign the correct movement action, causing the measured route on
     * screen to rapidly change colors as sections get closer to the token.
     *
     * @param waypoints
     * @param options
     */
    override measureMovementPath(waypoints: Waypoint[], options = {}) {
        const measurement = super.measureMovementPath(waypoints, options);

        const characterMovementData = (this.actor?.system as MovementActorData)?.movement;
        if (characterMovementData && this.movementAction === 'walk' && !this.#movementInProgress) {
            const movementHistory = this.movementHistory;
            let usedMovementCost = 0;
            if (movementHistory?.length) {
                const lastDestination = movementHistory.at(-1);
                const currentOrigin = waypoints.at(0);

                if (lastDestination!.x === currentOrigin!.x && lastDestination!.y === currentOrigin!.y) {
                    usedMovementCost = movementHistory.reduce((prev, curr) => prev + (curr.cost ?? 0), 0);
                }
            }

            const walkingRate = characterMovementData.walk.value;
            const runningRate = characterMovementData.run.value;

            for (let i = 0; i < waypoints.length; i++) {
                const waypoint = waypoints[i];
                const measuredWaypoint = measurement.waypoints[i];
                const movementCost = measuredWaypoint.cost + usedMovementCost;

                if (movementCost <= walkingRate) {
                    waypoint.action = 'walk';
                }
                if (movementCost > walkingRate) {
                    waypoint.action = 'run';
                }
                if (movementCost > runningRate) {
                    waypoint.action = 'sprint';
                }
            }
        }
        return measurement;
    }
}
