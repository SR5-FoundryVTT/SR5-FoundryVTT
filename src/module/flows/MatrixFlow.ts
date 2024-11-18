import { SR5Actor } from '../actor/SR5Actor';
import { DataDefaults } from '../data/DataDefaults';
import { SR5Item } from '../item/SR5Item';
import { MatrixRules } from '../rules/MatrixRules';
import { OpposedTest } from '../tests/OpposedTest';
import { SuccessTest } from '../tests/SuccessTest';
import { MarksStorageFlow } from './MarksStorageFlow';

/**
 * General handling around handling everything matrix related.
 */
export const MatrixFlow = {
    /**
     * Switch out one matrix attribute with a new one.
     *
     * NOTE: attributes given are changed in place.
     *
     * @param matrixAttributes The attribute data.
     * @param changedSlot The attribute slot changed
     * @param attribute The attribute selected to change into the changed slot.
     *
     * @returns Changed matrix attributes data.
     */
    changeMatrixAttribute(
        matrixAttributes: Shadowrun.MatrixAttributes,
        changedSlot: string,
        attribute: Shadowrun.MatrixAttribute,
    ): Record<string, any> {
        // The attribute that used to be in the slot that's changing.
        const previousAttribute = matrixAttributes[changedSlot].att;
        // The slot of the selected attribute that will get the previous attribute.
        let previousSlot = '';
        Object.entries(matrixAttributes).forEach(([slot, { att }]) => {
            if (att === attribute) {
                previousSlot = slot;
            }
        });

        if (!previousSlot) {
            console.error(
                `Shadowrun 5e | Couldn't change attribute ${attribute} as it wasn't found in matrix attribute slots`,
                matrixAttributes,
            );
            return {};
        }

        const updateData = {
            [`system.atts.${changedSlot}.att`]: attribute,
            [`system.atts.${previousSlot}.att`]: previousAttribute,
        };

        return updateData;
    },

    /**
     * Determine if this test should add overwatch score. SR5#231-232 'Overwatch Score and Convergence'
     *
     * @param test Any test, though only tests opposing matrix tests will be considered.
     */
    async addOverwatchScoreFromIllegalMatrixAction(test: SuccessTest | OpposedTest) {
        if (!test.opposing) return;
        // @ts-expect-error - Only OpposedTest has this property
        const against = test.against as SuccessTest;
        if (!against) return;
        if (!against.hasTestCategory('matrix')) return;
        if (!MatrixRules.isIllegalAction(
            against.data.action.attribute,
            against.data.action.attribute2,
            against.data.action.limit.attribute)) {
            return;
        }

        const actor = against.actor;
        if (!actor) return;

        // Raise overwatch score.
        let overwatchScore = actor.getOverwatchScore();
        await actor.setOverwatchScore(overwatchScore + test.hits.value);

        // Inform GM about convergenace.
        overwatchScore = against.actor?.getOverwatchScore();
        if (MatrixRules.isOverwatchScoreConvergence(overwatchScore)) {
            await MatrixFlow.sendOverwatchConvergenaceMessage(actor);
        }
    },

    /**
     * Send out a chat message to inform the GM about convergenace and provide actions for it.
     *
     * @param actor The actor targeted by Convergence.
     */
    async sendOverwatchConvergenaceMessage(actor: SR5Actor) {
        // Prepare speaker data.
        const alias = game.user?.name;
        const linkedTokens = actor.getActiveTokens(true) || [];
        const token = linkedTokens.length === 1 ? linkedTokens[0].id : undefined;

        // Prepare convergence damage
        const damage = MatrixRules.convergenceDamage();
        const resultActions = [
            {
                label: 'SR5.Labels.Action.ForceReboot',
                action: 'forceReboot',
                value: 'Test',
            },
        ];

        const templateData = {
            overwatchThreshold: MatrixRules.overwatchConvergenceScore(),
            damage,
            resultActions,
            speaker: {
                actor,
                alias,
                token,
            },
        };
        const content = await renderTemplate(
            'systems/shadowrun5e/dist/templates/chat/overwatch-convergence-message.hbs',
            templateData,
        );
        const messageData = { content };
        await ChatMessage.create(messageData);
    },

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
        await MarksStorageFlow.clearRelations(actor.uuid);
        const damage = MatrixFlow.getDumpshockDamage(actor);

        await MatrixFlow.sendRebootDeviceMessage(actor, device, delay, damage);
    },

    /**
     * Inform GM and users about the result of a reboot action.
     */
    async sendRebootDeviceMessage(actor: SR5Actor, device: SR5Item|undefined, delay: number, damage: Shadowrun.DamageData) {
        const speaker = {
            actor,
            alias: game.user?.name,
            token: actor.getActiveTokens(true)[0]?.id,
        };
        const content = await renderTemplate('systems/shadowrun5e/dist/templates/chat/reboot-device-message.hbs', {
            speaker,
            delay,
            device, 
            damage
        });
        const messageData = { content };
        await ChatMessage.create(messageData);
    },

    /**
     * Apply dumpshock to an actor and their persona (device).
     * 
     * Dumpshock can´t be applied to actors not using VR.
     *
     * @param actor The actor that is affected by dumpshock.
     */
    getDumpshockDamage(actor: SR5Actor) {
        if (!actor.isUsingVR) return DataDefaults.damageData({type: {base: 'stun', value: 'stun'}}); 

        return MatrixRules.dumpshockDamage(actor.isUsingHotSim);
    }
};
