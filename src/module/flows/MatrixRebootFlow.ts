import { SR5Actor } from "../actor/SR5Actor";
import { SR5Item } from "../item/SR5Item";
import { MarksStorage } from "../storage/MarksStorage";
import { DamageType } from "../types/item/Action";
import { MatrixFlow } from "./MatrixFlow";

/**
 * Handle matrix reboot actions.
 */
export const MatrixRebootFlow = {
    /**
     * Reboot this device and trigger all resulting effects of it based on
     * the reboot action.
     * See SR5#242 'Reboot Device'.
     *
     * @param device The device to reboot.
     * @param delay The delay duration of combat turns after which the devices has rebooted.
     */
    async rebootPersona(actor: SR5Actor, delay: number = 1) {
        console.debug('Shadowrun 5e | Rebooting Persona Device', actor);
        // TODO: Mark devices as rebooting to prohibit usage until end of next combat turn (effect with duration).
        // TODO: Allow for user input delay when rebooting device

        // Link Locked actors can´t be rebooted. (SR5#229 ´Dumpshock & Link-Locking´)
        if (actor.isLinkLocked) {
            ui.notifications?.error('SR5.Matrix.Error.LinkLockedReboot');
            return;
        }

        // Only reset overwatch score if the device rebooted is the persona device.
        const device = actor.getMatrixDevice();

        await actor.setOverwatchScore(0);
        await actor.clearMarks();
        await MarksStorage.clearRelations(actor.uuid);
        const damage = MatrixFlow.getDumpshockDamage(actor);

        await this.sendRebootDeviceMessage(actor, device, delay, damage);
    },

    /**
     * Inform GM and users about the result of a reboot action.
     */
    async sendRebootDeviceMessage(actor: SR5Actor, device: SR5Item | undefined, delay: number, damage: DamageType) {
        const speaker = {
            actor,
            alias: game.user?.name,
            token: actor.getActiveTokens(true)[0]?.id,
        };
        const content = await foundry.applications.handlebars.renderTemplate('systems/shadowrun5e/dist/templates/chat/reboot-device-message.hbs', {
            speaker,
            delay,
            device,
            damage
        });
        const messageData = { content };
        await ChatMessage.create(messageData);
    },
}