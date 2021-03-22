import {DamageAndSoakPerActor, DamageApplicationDialog} from "../apps/dialogs/DamageApplicationDialog";
import { SR5 } from "../config";
import {SR5Actor} from "./SR5Actor";
import DamageData = Shadowrun.DamageData;
import CharacterActorData = Shadowrun.CharacterActorData;

export class DamageApplicationFlow {

    /**
     * Runs the flow to apply damage to multiple actors with user interaction
     * This will also take care of changing the damage type if necessary
     * @param actors The actors that are affected
     * @param damage The damage the actors will receive
     */
    async runApplyDamage(actors: SR5Actor[], damage : DamageData) {
 
        console.log("Run apply damage");
        const actorDamage : DamageAndSoakPerActor[] = 
            actors.map(actor => this.getDamageAndSoakForActor(actor, damage));

        // Show user the affected actors and the damage values
        const damageApplicationDialog = await new DamageApplicationDialog(actorDamage, damage);
        await damageApplicationDialog.select();

        if (damageApplicationDialog.canceled) {
            return;
        }

        if (damageApplicationDialog.selectedButton === 'damage') {
            actorDamage.forEach(({actor, modified }) => {
                this.applyDamageToActor(actor, modified);
            });
        }
        else if (damageApplicationDialog.selectedButton === 'unmodifiedDamage') {
            actorDamage.forEach(({actor}) => {
                this.applyDamageToActor(actor, damage);
            });
        }

        else {
            console.error('Expected a dialog selection, but none known selection was made');
        }
    }

    /** Apply all types of damage to the actor.
     *
     * @param damage The damage to apply. Stun damage will be turned to physical for grunts.
     */
    async applyDamageToActor(actor : SR5Actor, damage: DamageData) {
        if (damage.value <= 0) {
            return;
        }

        // We change the damage type for grunts at the (they do not have stun) to avoid confusing the user in the dialog
        damage = this.applyDamageTypeChangeForGrunt(actor, damage);

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



    private getDamageAndSoakForActor(actor : SR5Actor, damage : DamageData) : DamageAndSoakPerActor {
        const actorData = actor.data.data as CharacterActorData;
        const perception = actorData.initiative.perception;
        const initCategory  = SR5.initiativeCategories[perception];
        let hotsim = false;

        // Not all characters have an equipped comlink / deck / rcc
        if (actorData.matrix) {
            hotsim = actorData.matrix.hot_sim;
        }

        return {
            actor,
            modified: damage,
            armor: actor.getModifiedArmor(damage),
            perception: initCategory,
            hotsim: hotsim,
        }
    }

    private applyDamageTypeChangeForGrunt(actor : SR5Actor, damage: DamageData): DamageData {
        const updatedDamage = duplicate(damage);
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