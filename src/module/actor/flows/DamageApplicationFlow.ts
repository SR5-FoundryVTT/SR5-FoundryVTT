import {DamageApplicationDialog} from "../../apps/dialogs/DamageApplicationDialog";
import {SR5Actor} from "../SR5Actor";
import DamageData = Shadowrun.DamageData;
import DamageType = Shadowrun.DamageType;
import DamageElement = Shadowrun.DamageElement;
import { Helpers } from '../../helpers';
import { TestCreator } from '../../tests/TestCreator';

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

        //TODO convert overflow
        const overflow = actor.addDamage(damage);
        

        // NOTE: For stuff like healing the last wound by magic, it might also be interesting to store and give
        //       an overview of each damage/wound applied to select from.
        // await this.update({'data.track': this.data.data.track});
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

    static handleRenderChatMessage(app: ChatMessage, html, data) {
        html.on('click', '.apply-damage', event => DamageApplicationFlow.chatMessageActionApplyDamage(html, event));
    }

    /**
     * When triggered from a chat message 
     * @param html 
     * @param event 
     * @returns 
     */
    static async chatMessageActionApplyDamage(html, event) {
        event.stopPropagation();
        event.preventDefault();
        const applyDamage = $(event.currentTarget);

        const value = Number(applyDamage.data('damageValue'));
        const type = String(applyDamage.data('damageType')) as DamageType;
        const ap = Number(applyDamage.data('damageAp'));
        const element = String(applyDamage.data('damageElement')) as DamageElement;
        let damage = Helpers.createDamageData(value, type, ap, element);

        let actors = Helpers.getSelectedActorsOrCharacter();

        // Should no selection be available try guessing.
        if (actors.length === 0) {
            const messageId = html.data('messageId');

            const test = await TestCreator.fromMessage(messageId);
            if (!test) return
            await test.populateDocuments();

            // If targeting is available, use that.
            if (test.hasTargets) test.targets.forEach(target => actors.push(target.actor as SR5Actor));
            // Otherwise apply to the actor casting the damage.
            else actors.push(test.actor as SR5Actor);
        }

        // Abort if no actors could be collected.
        if (actors.length === 0) {
            ui.notifications?.warn(game.i18n.localize("SR5.Warnings.TokenSelectionNeeded"));
            return;
        }

        await new DamageApplicationFlow().runApplyDamage(actors, damage);
    }
}