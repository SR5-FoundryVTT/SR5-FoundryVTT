import {DamageApplicationDialog} from "../../apps/dialogs/DamageApplicationDialog";
import {SR5Actor} from "../SR5Actor";
import DamageData = Shadowrun.DamageData;

export class DamageApplicationFlow {

    /**
     * Runs the flow to apply damage to multiple actors with user interaction
     * This will also take care of changing the damage type if necessary
     * @param actors The actors that are affected
     * @param damage The damage the actors will receive
     */
    async runApplyDamage(actors: SR5Actor[], damage : DamageData) {
        // Show user the affected actors and the damage values
        const damageApplicationDialog = await new DamageApplicationDialog(actors, damage);
        await damageApplicationDialog.select();

        if (damageApplicationDialog.canceled) {
            return;
        }

        actors.forEach((actor) => {
            this.applyDamageToActor(actor, damage);
        });
    }

    /** Apply all types of damage to the actor.
     *
     * @param damage The damage to apply. Stun damage will be turned to physical for grunts.
     */
    async applyDamageToActor(actor : SR5Actor, damage: DamageData) {
        if (damage.value <= 0) {
            return;
        }

        // We change the damage type from stun to physical for grunts (they do not have a stun track)
        // We are not doing this earlier in the soak flow to avoid confusing the user
        damage = this.changeStunToPhysicalForGrunts(actor, damage);

        // Apply damage and resulting overflow to the according track.
        // The amount and type damage can value in the process.
        if (damage.type.value === 'matrix') {
            damage = await actor.addMatrixDamage(damage);
        }

        if (damage.type.value === 'stun') {
            damage = await actor.addStunDamage(damage);
        }

        if (damage.type.value === 'physical') {
            await actor.addPhysicalDamage(damage);
        }

        // NOTE: For stuff like healing the last wound by magic, it might also be interesting to store and give
        //       an overview of each damage/wound applied to select from.
        // await this.update({'data.track': this.data.data.track});
        // TODO: Handle changes in actor status (death and such)
    }

    private changeStunToPhysicalForGrunts(actor : SR5Actor, damage: DamageData): DamageData {
        const updatedDamage = duplicate(damage) as DamageData;
        if (!actor.isGrunt()) {
            return updatedDamage;
        }

        // Grunts do not have a stun track and will always receive physical damage.
        if (damage.type.value === 'stun') {
            updatedDamage.type.value = 'physical';
        }

        return updatedDamage;
    }
}