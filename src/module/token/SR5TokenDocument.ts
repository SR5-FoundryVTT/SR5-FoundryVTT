import { DeepReadonly } from 'fvtt-types/utils';
import { SYSTEM_NAME, FLAGS } from '../constants';
import { StorageFlow } from '@/module/flows/StorageFlow';

export class SR5TokenDocument extends TokenDocument {
    /**
     * Used by measureMovementPath to track if a movement is being planned or executed.
     * @private
     */
    #movementInProgress = false;

    override async _preUpdate(
        changed: TokenDocument.UpdateData,
        options: TokenDocument.Database.PreUpdateOptions,
        user: User.Implementation
    ) {
        this.#movementInProgress = true;
        let result: boolean | void;
        try {
            result = await super._preUpdate(changed, options, user);
        } finally {
            this.#movementInProgress = false;
        }
        return result;
    }

    /**
     * Handle system specific things when this token document is being deleted
     * @param args
     */
    override async _preDelete(...args: Parameters<TokenDocument["_preDelete"]>) {
        // ensure we disconnect from any networks before being a token actor is deleted
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
        options?: TokenDocument.MeasureMovementPathOptions
    ) {
        const measurement = super.measureMovementPath(waypoints, options);

        const characterMovementData = this.actor?.system.movement;
        if (!characterMovementData || this.movementAction !== 'walk' || this.#movementInProgress) {
            return measurement;
        }

        const walkRate = characterMovementData.walk.value;
        const runRate = characterMovementData.run.value;

        for (let i = 0; i < waypoints.length; i++) {
            const waypoint = waypoints[i];
            const cost = measurement.waypoints[i].cost;

            if (!Number.isFinite(cost)) continue;

            if (cost > runRate) {
                waypoint.action = 'sprint';
            } else if (cost > walkRate) {
                waypoint.action = 'run';
            } else {
                waypoint.action = 'walk';
            }
        }

        return measurement;
    }

    static async moveToken(
        token: TokenDocument.Implementation,
        movement: DeepReadonly<TokenDocument.MovementOperation>,
        operation: Partial<foundry.abstract.types.DatabaseUpdateOperation>,
        user: User.Implementation
    ) {
        if (game.user.id !== user.id) return;
        if (!token.actor?.system.movement) return;
        if (movement.constrainOptions.ignoreCost) return;
        if (!game.settings.get(SYSTEM_NAME, FLAGS.TokenAutoRunning)) return;

        const path = token.measureMovementPath(token.movementHistory);

        if (path.cost > token.actor.system.movement.run.value) {
            await token.actor.toggleStatusEffect("sr5running", { active: false });
            await token.actor.toggleStatusEffect("sr5sprinting", { active: true });
        } else if (path.cost > token.actor.system.movement.walk.value) {
            await token.actor.toggleStatusEffect("sr5sprinting", { active: false });
            await token.actor.toggleStatusEffect("sr5running", { active: true });
        } else {
            await token.actor.toggleStatusEffect("sr5running", { active: false });
            await token.actor.toggleStatusEffect("sr5sprinting", { active: false });
        }
    }

    override async clearMovementHistory() {
        await super.clearMovementHistory();

        if (!game.settings.get(SYSTEM_NAME, FLAGS.TokenAutoRunning)) return;

        // Clear running/sprinting status effects when movement history is cleared.
        await this.actor?.toggleStatusEffect("sr5running", { active: false });
        await this.actor?.toggleStatusEffect("sr5sprinting", { active: false });
    }
}
