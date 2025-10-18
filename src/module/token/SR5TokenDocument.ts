import { DeepReadonly } from "fvtt-types/utils";
import { SYSTEM_NAME, FLAGS } from "../constants";
import { StorageFlow } from "@/module/flows/StorageFlow";

/**
 * A custom TokenDocument class for the SR5 system.
 * It extends the base functionality to handle system-specific movement rules and data cleanup.
 */
export class SR5TokenDocument extends TokenDocument {
    /**
     * Tracks if a movement operation is in progress to prevent visual flicker in `measureMovementPath`.
     * @private
     */
    #movementInProgress = false;

    protected override async _preUpdate(
        changed: TokenDocument.UpdateData,
        options: TokenDocument.Database.PreUpdateOptions,
        user: User.Implementation,
    ) {
        this.#movementInProgress = true;
        let result: Awaited<ReturnType<TokenDocument["_preUpdate"]>>;

        try {
            result = await super._preUpdate(changed, options, user);
        } finally {
            this.#movementInProgress = false;
        }

        return result;
    }

    /**
     * Handles system-specific cleanup before the token document is deleted.
     */
    protected override async _preDelete(...args: Parameters<TokenDocument["_preDelete"]>) {
        // Disconnect from any networks before a token actor is deleted.
        if (this.actor?.isToken) {
            await StorageFlow.deleteStorageReferences(this.actor);
        }

        return super._preDelete(...args);
    }

    /**
     * Measure movement path and assign a movement action ('walk' | 'run' | 'sprint') to each provided waypoint.
     *
     * Behavior:
     * - Delegates mathematical measurement to TokenDocument.measureMovementPath and then annotates the original
     *   waypoints with an action based on the actor's movement thresholds.
     * - Only adjusts waypoint.action when:
     *     - The token's actor exposes movement data,
     *     - The current movementAction is 'walk' (the user is measuring a walking move),
     *     - No movement is currently in progress (to avoid flicker while the token is actually moving).
     * - Uses measured waypoint cost from the computed measurement. If a measured cost is unavailable the waypoint
     *   is left unchanged.
     */
    override measureMovementPath(
        waypoints: TokenDocument.MeasuredMovementWaypoint[],
        options?: TokenDocument.MeasureMovementPathOptions,
    ): foundry.grid.BaseGrid.MeasurePathResult {
        const measurement = super.measureMovementPath(waypoints, options);
        const movementData = this.actor?.system.movement;

        // Abort if actor has no movement data, it's not a standard walk, or movement is in progress.
        if (!movementData || this.movementAction !== "walk" || this.#movementInProgress) {
            return measurement;
        }

        const { walk, run } = movementData;

        for (let i = 0; i < waypoints.length; i++) {
            const waypoint = waypoints[i];
            const cost = measurement.waypoints[i].cost;

            if (!Number.isFinite(cost)) continue;

            if (cost > run.value) {
                waypoint.action = "sprint";
            } else if (cost > walk.value) {
                waypoint.action = "run";
            } else {
                waypoint.action = "walk";
            }
        }

        return measurement;
    }

    /**
     * Clears running and sprinting status effects when movement history is reset.
     */
    override async clearMovementHistory() {
        await super.clearMovementHistory();

        if (this.actor && game.settings.get(SYSTEM_NAME, FLAGS.TokenAutoRunning)) {
            // Concurrently remove running/sprinting status effects.
            await Promise.all([
                this.actor.toggleStatusEffect("sr5running", { active: false }),
                this.actor.toggleStatusEffect("sr5sprinting", { active: false }),
            ]);
        }
    }

    /**
     * A hook handler that automatically applies 'running' or 'sprinting' status effects based on movement distance.
     */
    static async moveToken(
        token: TokenDocument.Implementation,
        movement: DeepReadonly<TokenDocument.MovementOperation>,
        operation: Partial<foundry.abstract.types.DatabaseUpdateOperation>,
        user: User.Implementation,
    ): Promise<void> {
        // Perform checks to ensure this logic should run.
        if (game.user.id !== user.id) return;
        if (!token.actor?.system.movement) return;
        if (movement.constrainOptions.ignoreCost) return;
        if (!game.settings.get(SYSTEM_NAME, FLAGS.TokenAutoRunning)) return;

        const { walk, run } = token.actor.system.movement;
        const cost = token.measureMovementPath(token.movementHistory).cost;

        // Determine the required movement state.
        const shouldSprint = cost > run.value;
        const shouldRun = !shouldSprint && cost > walk.value;

        // Concurrently apply the correct status effects.
        await Promise.all([
            token.actor.toggleStatusEffect("sr5running", { active: shouldRun }),
            token.actor.toggleStatusEffect("sr5sprinting", { active: shouldSprint }),
        ]);
    }
}
