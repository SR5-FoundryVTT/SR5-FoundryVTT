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
    #inPreUpdate = false;

    override async _preUpdate(changed, options, user) {
        this.#inPreUpdate = true;
        try {
            await super._preUpdate(changed, options, user);
        } finally {
            this.#inPreUpdate = false;
        }
    }

    override measureMovementPath(waypoints: Waypoint[], options = {}) {
        const measurement = super.measureMovementPath(waypoints, options);

        const characterMovementData = (this.actor?.system as MovementActorData)?.movement;
        if (characterMovementData && this.movementAction === 'walk' && !this.#inPreUpdate) {
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
