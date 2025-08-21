import {DamageApplicationDialog} from "../../apps/dialogs/DamageApplicationDialog";
import {SR5Actor} from "../SR5Actor";
import { Helpers } from '../../helpers';
import { TestCreator } from '../../tests/TestCreator';
import { BiofeedbackDamageType, DamageType } from 'src/module/types/item/Action';
import { SR5Item } from "@/module/item/SR5Item";
import { OverflowTrackType, TrackType } from "@/module/types/template/ConditionMonitors";
import { ConditionType } from "@/module/types/template/Condition";
import { CombatRules } from "@/module/rules/CombatRules";
import { DataDefaults } from "@/module/data/DataDefaults";
import { ResonsanceRules } from "@/module/rules/ResonanceRules";
type DamageElement = Item.SystemOfType<'weapon'>['action']['damage']['element']['base'];

export class DamageApplicationFlow {

    /**
     * Runs the flow to apply damage to multiple actors with user interaction
     * This will also take care of changing the damage type if necessary
     * @param targets The actors that are affected
     * @param damage The damage the actors will receive
     */
    async runApplyDamage(targets: (SR5Actor | SR5Item)[], damage: DamageType) {
        // Show user the affected actors and the damage values
        const damageApplicationDialog = new DamageApplicationDialog(targets, damage);
        await damageApplicationDialog.select();

        if (damageApplicationDialog.canceled)
            return;

        for (const target of targets)
            void this.applyDamageToActor(target, damage);
    }

    /** Apply all types of damage to the actor.
     *
     * @param damage The damage to apply. Stun damage will be turned to physical for grunts.
     */
    async applyDamageToActor(target: SR5Actor | SR5Item, damage: DamageType) {
        if (damage.value <= 0) {
            return;
        }

        if (target instanceof SR5Actor) {
            // We change the damage type from stun to physical for grunts (they do not have a stun track)
            // We are not doing this earlier in the soak flow to avoid confusing the user
            damage = this.changeStunToPhysicalForGrunts(target, damage);
        }

        await target.addDamage(damage);
    }

    private changeStunToPhysicalForGrunts(actor: SR5Actor, damage: DamageType): DamageType {
        const updatedDamage = foundry.utils.duplicate(damage) as DamageType;
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
        $(html).on('click', '.apply-damage', async event => await DamageApplicationFlow.chatMessageActionApplyDamage(html, event));
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
        const type = String(applyDamage.data('damageType')) as DamageType['type']['value'];
        const ap = Number(applyDamage.data('damageAp'));
        const element = String(applyDamage.data('damageElement')) as DamageElement;
        const biofeedback = String(applyDamage.data('damageBiofeedback')) as BiofeedbackDamageType;
        const damage = Helpers.createDamageData(value, type, ap, element, biofeedback);

        const targets = Helpers.getSelectedActorsOrCharacter();

        // Should no selection be available try guessing.
        if (targets.length === 0) {
            const messageId = html.data('messageId');

            const test = await TestCreator.fromMessage(messageId);
            if (!test) return
            await test.populateDocuments();

            // If targeting is available, use that.
            // taM check this
            if (test.hasTargets) (test.targets as TokenDocument[]).forEach(target => targets.push(target.actor as SR5Actor));
            else targets.push(test.actor as SR5Actor);
        }

        // Abort if no targets could be collected.
        if (targets.length === 0) {
            ui.notifications?.warn(game.i18n.localize("SR5.Warnings.TokenSelectionNeeded"));
            return;
        }

        await new DamageApplicationFlow().runApplyDamage(targets, damage);
    }

    /**
     * Apply damage of any type to this actor. This should be the main entry method to applying damage.
     * 
     * @param actor The actor to apply the damage to.
     * @param damage Damage to be applied
     */
    static async addDamage(actor: SR5Actor, damage: DamageType) {
        switch(damage.type.value) {
            case 'matrix':
                await DamageApplicationFlow.addMatrixDamage(actor, damage);
                break;
            case 'stun':
                await DamageApplicationFlow.addStunDamage(actor, damage);
                break;
            case 'physical':
                await DamageApplicationFlow.addPhysicalDamage(actor, damage);
                break;
        }
        Hooks.call("sr5_afterDamageAppliedToActor", actor, damage);
    }

    /**
     * Add stun damage to an actor.
     * @param actor The actor to add the damage to.
     * @param damage The damage to add.
     * @returns The remaining damage that could not be applied fully and should overflow.
    */
    static async addStunDamage(actor: SR5Actor, damage: DamageType) {
        if (damage.type.value !== 'stun') return damage;

        const track = actor.getStunTrack();
        if (!track)
            return damage;

        const { overflow, rest } = DamageApplicationFlow._calcDamageOverflow(damage, track);

        // Only change damage type when needed, in order to avoid confusion of callers.
        if (overflow.value > 0) {
            // Apply Stun overflow damage to physical track according to: SR5E#170
            overflow.value = Math.floor(overflow.value / 2);
            overflow.type.value = 'physical';
        }

        await DamageApplicationFlow._addDamageToTrack(actor, rest, track);
        await DamageApplicationFlow.addPhysicalDamage(actor, overflow);
        return undefined;
    }

    /**
     * Add physical damage to an actor.
     * @param actor The actor to add the damage to.
     * @param damage The damage to add.
     */
    static async addPhysicalDamage(actor: SR5Actor, damage: DamageType) {
        if (damage.type.value !== 'physical') {
            return damage;
        }


        const track = actor.getPhysicalTrack();
        if (!track) {
            return damage;
        }

        const { overflow, rest } = DamageApplicationFlow._calcDamageOverflow(damage, track);

        await DamageApplicationFlow._addDamageToTrack(actor, rest, track);
        await DamageApplicationFlow._addDamageToOverflow(actor, overflow, track);
        return undefined;
    }

    /**
     * Add Matrix damage to an actor.
     * @param actor The actor to add the damage to.
     * @param damage The damage to add.
     */
    static async addMatrixDamage(actor: SR5Actor, damage: DamageType) {
        if (damage.type.value !== 'matrix') return;

        // CASE - Technomancer with Living Persona.
        if (actor.hasLivingPersona) {
            damage = ResonsanceRules.convertMatrixDamage(damage);
            await DamageApplicationFlow.addStunDamage(actor, damage);
            return;
        }

        // CASE - Any other Persona, including Matrix actors.
        const device = actor.getMatrixDevice();
        const track = actor.getMatrixTrack();
        if (!track) return damage;

        const { rest } = DamageApplicationFlow._calcDamageOverflow(damage, track);

        if (device)
            await DamageApplicationFlow._addDamageToDeviceTrack(rest, device);
        if (actor.isType('ic', 'sprite'))
            await DamageApplicationFlow._addDamageToTrack(actor, rest, track);
        return undefined;
    }

    /**
     * Directly set the matrix damage track of this actor to a set amount.
     *
     * This is mainly used for manual user input on an actor sheet.
     *
     * This is done by resetting all tracked damage and applying one manual damage set.
     *
     * @param actor The actor to set damage on.
     * @param value The matrix damage to be applied.
     */
    static async setMatrixDamage(actor: SR5Actor, value: number) {
        // Disallow negative values.
        value = Math.max(value, 0);

        // Use artificial damage to be consistent across other damage application Actor methods.
        const damage = DataDefaults.createData('damage', {
            type: { base: 'matrix', value: 'matrix' },
            base: value,
            value
        });

        let track = actor.getMatrixTrack();
        if (!track) return;

        // Reduce track to minimal value and simply add new damage.
        track.value = 0;
        // As track has been reduced to zero already, setting it to zero is already done.
        if (value > 0)
            track = DamageApplicationFlow._addDamageToTrackValue(damage, track);

        // If a matrix device is used, damage that instead of the actor.
        const device = actor.getMatrixDevice();
        if (device)
            return device.update({ system: { technology: { condition_monitor: track } } });

        // IC actors use a matrix track.
        if (actor.isType('ic'))
            return actor.update({ system: { track: { matrix: track } } });

        // Emerged actors use a personal device like condition monitor.
        if (actor.isMatrixActor)
            return (actor as SR5Actor).update({ system: { matrix: { condition_monitor: track } } });

        return undefined;
    }

    /**
     * Apply damage to an actors physical overflow damage monitor / track.
     * 
     * @param actor The actor to apply the damage to.
     * @param damage The damage to overflow.
     * @param track The track to overflow the damage into.
     * @returns 
     */
    static async _addDamageToOverflow(actor: SR5Actor, damage: DamageType, track: OverflowTrackType) {
        if (damage.value === 0) return;
        if (track.overflow.value === track.overflow.max) return;

        //  Avoid cross referencing.
        const overflow = foundry.utils.duplicate(track.overflow);

        // Don't over apply damage to the track overflow.
        overflow.value += damage.value;
        overflow.value = Math.min(overflow.value, overflow.max);

        const updateData = { [`system.track.${damage.type.value}.overflow`]: overflow };
        await actor.update(updateData);
    }

    /**
     * Apply damage to an actors main damage monitor / track.
     * 
     * This includes physical and stun for meaty actors and matrix for matrix actors.
     * 
     * Applying damage will also reduce the initiative score of an active combatant.
     * 
     * Handles rule 'Changing Initiative' on SR5#160.
     * 
     * @param actor The actor to apply the damage to.
     * @param damage The damage to be taken.
     * @param track The track to apply that damage to.
     */
    static async _addDamageToTrack(actor: SR5Actor, damage: DamageType, track: TrackType | OverflowTrackType | ConditionType) {
        if (damage.value === 0) return;
        if (track.value === track.max) return;

        // Allow a wound modifier difference to be calculated after damage has been dealt.
        const woundsBefore = actor.getWoundModifier();

        // Apply damage to track and trigger derived value calculation.
        track = DamageApplicationFlow._addDamageToTrackValue(damage, track);
        const updateData = { [`system.track.${damage.type.value}`]: track };
        await actor.update(updateData);

        // Apply any wounds modifier delta to an active combatant.
        const woundsAfter = actor.getWoundModifier();
        const iniAdjustment = CombatRules.initiativeScoreWoundAdjustment(woundsBefore, woundsAfter);

        // Only actors that can have a wound modifier, will have a delta.
        if (iniAdjustment < 0 && game.combat) game.combat.adjustActorInitiative(actor, iniAdjustment);
    }

    /**
     * Adds the specified damage to the given track of the actor.
     * This method ensures that the damage does not exceed the track's maximum value.
     * This method is intended as a helper and doesn´t update any data itself.
     * 
     * @param damage The damage to be added.
     * @param track The track to which the damage will be applied.
     * @returns The updated track with the applied damage.
     */
    static _addDamageToTrackValue(damage: DamageType, track: TrackType | OverflowTrackType | ConditionType): TrackType | OverflowTrackType | ConditionType {
        if (damage.value === 0) return track;
        if (track.value === track.max) return track;

        //  Avoid cross referencing.
        track = foundry.utils.duplicate(track) as TrackType | OverflowTrackType | ConditionType;

        track.value += damage.value;
        if (track.value > track.max) {
            // dev error, not really meant to be ever seen by users. Therefore no localization.
            console.error("Damage did overflow the track, which shouldn't happen at this stage. Damage has been set to max. Please use applyDamage.")
            track.value = track.max;
        }

        return track;
    }

    /**
     * Add damage to a device's condition monitor.
     * 
     * @param damage 
     * @param device 
     * @returns 
     */
    static async _addDamageToDeviceTrack(damage: DamageType, device: SR5Item) {
        if (!device) return;

        let condition = device.getCondition();
        if (!condition) return damage;

        if (damage.value === 0) return;
        if (condition.value === condition.max) return;

        condition = DamageApplicationFlow._addDamageToTrackValue(damage, condition);

        await device.update({ system: { technology: { condition_monitor: condition } } });
        return undefined;
    }

    /** 
     * Calculate damage overflow only based on max and current track values.
     * 
     * This is a helper method that doesn´t update any data itself.
     * 
     * @param damage The damage applied that might overflow.
     * @param track The track to apply the damage to.
     * @returns Any overflowing damage and the rest that can be applied.
     */
    static _calcDamageOverflow(damage: DamageType, track: TrackType | ConditionType): { overflow: DamageType, rest: DamageType } {
        const freeTrackDamage = track.max - track.value;
        const overflowDamage = damage.value > freeTrackDamage ?
            damage.value - freeTrackDamage :
            0;
        const restDamage = damage.value - overflowDamage;

        //  Avoid cross referencing.
        const overflow = foundry.utils.duplicate(damage) as DamageType;
        const rest = foundry.utils.duplicate(damage) as DamageType;

        overflow.value = overflowDamage;
        rest.value = restDamage;

        return {overflow, rest};
    }
}
