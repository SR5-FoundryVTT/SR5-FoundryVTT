import { ActorMarksFlow } from '../actor/flows/ActorMarksFlow';
import { SR5Actor } from '../actor/SR5Actor';
import { DataDefaults } from '../data/DataDefaults';
import { Helpers } from '../helpers';
import { MatrixNetworkFlow } from '../item/flows/MatrixNetworkFlow';
import { SR5Item } from '../item/SR5Item';
import { MatrixRules } from '../rules/MatrixRules';
import { MarksStorage } from '../storage/MarksStorage';
import { OpposedTest } from '../tests/OpposedTest';
import { SuccessTest } from '../tests/SuccessTest';
import { DamageType } from '../types/item/Action';
import { MatrixAttributesType } from '../types/template/Matrix';
import { TestCreator } from '@/module/tests/TestCreator';
import { BiofeedbackResistTest } from '@/module/tests/BiofeedbackResistTest';
import { ResistTestData } from '@/module/tests/flows/ResistTestDataFlow';

/**
 * General handling around everything matrix related.
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
        matrixAttributes: MatrixAttributesType,
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
            against.data.action.attribute as any,
            against.data.action.attribute2 as any,
            against.data.action.limit.attribute as any)) {
            return;
        }

        const actor = against.actor;
        if (!actor) return;

        // Raise overwatch score.
        let overwatchScore = actor.getOverwatchScore();
        await actor.setOverwatchScore(overwatchScore + test.hits.value);

        // Inform GM about convergenace.
        overwatchScore = actor.getOverwatchScore();
        if (MatrixRules.isOverwatchScoreConvergence(overwatchScore)) {
            await MatrixFlow.executeOverwatchConvergence(actor);
        }
    },

    /**
     * Execute a convergence with the given actor based on SR5#231-232 'Overwatch Score and Convergence'.
     *
     * @param actor The actor targeted by Convergence.
     */
    async executeOverwatchConvergence(actor: SR5Actor) {
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

        await MatrixFlow.sendOverwatchConvergenceMessage(templateData);
    },

    async determineMatrixFailedAttack(test: SuccessTest | OpposedTest) {
        if (!test.opposing) return;

        // @ts-expect-error - Only OpposedTest has this property
        const against = test.against as SuccessTest;
        if (!against) return;
        if (!against.hasTestCategory('matrix')) return;

        const actor = against.actor;
        if (!actor) return;

        // if we succeeded in defending against an ATTACK test, we need to send back "bad data" in the form of 1 matrix damage
        if (test.success && MatrixRules.isAttackAction(
            against.data.action.attribute as any,
            against.data.action.attribute2 as any,
            against.data.action.limit.attribute as any
        )) {
            const alias = game.user?.name;
            const linkedTokens = actor.getActiveTokens(true) || [];
            const token = linkedTokens.length === 1 ? linkedTokens[0].id : undefined;
            // if biofeedback was enabled by the attacker, it should deal damage in a failed attack action back
            const biofeedback = against.data.damage.biofeedback;

            const templateData = {
                damage: MatrixRules.failedAttackDamage(biofeedback),
                speaker: {
                    actor,
                    alias,
                    token,
                },
            };
            await this.sendFailedAttackActionMessage(templateData);
        }

    },

    /**
     * Send out a chat message to apply damage to the attacker for failing an attack action
     */
    async sendFailedAttackActionMessage(templateData) {
        const content = await renderTemplate(
            'systems/shadowrun5e/dist/templates/chat/matrix-failed-attack-action.hbs',
            templateData,
        );
        const messageData = { content, speaker: templateData.speaker };
        await ChatMessage.create(messageData);

    },

    /**
     * Determine if the actor should take bifoeedback damage from the damage taken
     * @param actor
     * @param damage
     */
    async determineBiofeedbackDamage(actor: SR5Actor, damage: DamageType) {
        if (actor.takesBiofeedbackDamageFrom(damage)) {
            const biofeedbackDamage = this.getBiofeedbackResistDamage(actor, damage);
            const action = DataDefaults.createData('action_roll', {
                    ...BiofeedbackResistTest._getDefaultTestAction(),
                    test: 'BiofeedbackResistTest',
                });
            const data = TestCreator._prepareTestDataWithAction(action, actor, {
                ...TestCreator._minimalTestData(),
                action,
                type: 'BiofeedbackResistTest',
            }) as ResistTestData;
            data.incomingDamage = biofeedbackDamage;
            data.modifiedDamage = data.incomingDamage;

            const test = TestCreator.fromTestData(data, {source: actor});
            await test.execute();
        }
    },

    /**
     * Send out a chat message to inform the GM about convergenace and provide actions for it.
     */
    async sendOverwatchConvergenceMessage(templateData) {
        const content = await renderTemplate(
            'systems/shadowrun5e/dist/templates/chat/overwatch-convergence-message.hbs',
            templateData,
        );
        const messageData = { content, speaker: templateData.speaker };
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
        await MarksStorage.clearRelations(actor.uuid);
        const damage = MatrixFlow.getDumpshockDamage(actor);

        await MatrixFlow.sendRebootDeviceMessage(actor, device, delay, damage);
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
     * Get the amount of damage an actor needs to resist as Biofeedback Damage
     * - biofeedback comes from 2 sources: Matrix Damage and Physical (meatspace) damage
     * - matrix damage becomes biofeedback when someone in VR takes matrix damage laced with Biofeedback
     * - physical damage becomes biofeedback when a Drone takes damage and someone is Jumped Into it
     * @param actor
     * @param damage
     */
    getBiofeedbackResistDamage(actor: SR5Actor, damage: DamageType) {
        const isMatrix = damage.type.value === 'matrix';
        // if the biofeedback isn't matrix damage, halve the damage to as per SR5 266
        const damageValue = isMatrix ? damage.value : Math.ceil(damage.value / 2);
        // if the biofeedback isn't matrix damage, provide an empty string so it is based on the state of hotsim
        const biofeedback = isMatrix ? damage.biofeedback : '';
        return MatrixRules.createBiofeedbackDamage(damageValue, actor.isUsingHotSim, biofeedback);
    },

    /**
     * Apply dumpshock to an actor and their persona (device).
     *
     * Dumpshock can´t be applied to actors not using VR.
     *
     * @param actor The actor that is affected by dumpshock.
     */
    getDumpshockDamage(actor: SR5Actor) {
        if (!actor.isUsingVR) return DataDefaults.createData('damage', { type: { base: 'stun', value: 'stun' } });

        return MatrixRules.dumpshockDamage(actor.isUsingHotSim);
    },

    /**
     * Collect all matrix actions of an actor.
     * @param actor The actor to collect matrix actions from.
     */
    getMatrixActions(actor: SR5Actor): SR5Item[] {
        const actions = actor.itemsForType.get('action');
        // Normaly all item types should exist, though during actor creation this might not be the case.
        if (!actions) {
            return [];
        }
        return actions.filter((action: SR5Item) => action.hasActionCategory('matrix'));
    },

    /**
     * Return a list of matrix targets, of all types, for the given actor.
     * 
     * @param actor A matrix persona actor.
     * @returns Any possible matrix traget visible to the actor.
     */
    getMatrixTargets(actor: SR5Actor) {
        if (!actor.hasPersona) {
            return { targets: [] } 
        }

        // Prepare all targets based on network connection.
        const network = actor.network;
        const targets = network?.isType('host') ?
            MatrixFlow.prepareHostTargets(actor) :
            MatrixFlow.prepareGridTargets(actor);

        // Filter types of target for clear separation.
        // targets = targets.filter(target => !target.document);

        // const actors = targets.filter(target => target.document instanceof SR5Actor);
        // const items = targets.filter(target => target.document instanceof SR5Item);

        // const personas = actors.filter(target => target.document.hasPersona);
        // const ics = actors.filter(target => target.document.isIC());
        // const devices = items.filter(target => !target.document);

        return { targets };
    },

    /**
     * Prepare a list of possible matrix targets in a host network for the given persona matrix icon.
     * 
     * @param actor The actor to use as matrix icon.
     */
    prepareHostTargets(actor: SR5Actor) {
        const host = actor.network;
        if (!host?.isType('host')) {
            console.error('Shadowrun 5e | Actor is not connected to a host network');
            return [];
        }

        const targets: Shadowrun.MatrixTargetDocument[] = []

        for (const slave of host.slaves) {
            const type = ActorMarksFlow.getDocumentType(slave);
            // For persona slaves get their possible token.
            // taM check this
            const token = 'getToken' in slave ? slave.getToken() : null;

            // Remove the actor itself from the list of targets.
            if (slave.uuid === actor.uuid) continue;

            targets.push({
                name: slave.name,
                type,
                document: slave,
                token,
                runningSilent: slave.isRunningSilent(),
                network: host.name || '',
                icons: []
            });
        }

        return targets;
    },

    /**
     * Prepare a list of possible matrix targets in a grid network for the given persona matrix icon.
     * @param actor The actor to use as matrix icon.
     */
    prepareGridTargets(actor: SR5Actor) {
        const targets: Shadowrun.MatrixTargetDocument[] = [];

        // Collect all grid connected documents without scene tokens.
        // Scene Tokens will be collected separately.
        for (const grid of MatrixNetworkFlow.getGrids({ players: true })) {
            for (const slave of grid.slaves) {
                // Skip actor tokens as they're collected separately.
                if (slave instanceof SR5Actor && slave.getToken()) continue;

                const type = ActorMarksFlow.getDocumentType(slave);

                targets.push({
                    name: slave.name,
                    document: slave,
                    token: null,
                    runningSilent: slave.isRunningSilent(),
                    network: grid.name || '',
                    type,
                    icons: []
                });
            }
        }

        // Collect all scene tokens, which might also include personas outside any grid.
        if (canvas.scene?.tokens) {
            // Collect all scene tokens.
            for (const token of canvas.scene?.tokens) {
                // Throw away unneeded tokens.
                if (!token.actor) continue;
                const target = token.actor;

                /// Remove the actor itself from the list of targets.
                if (target.uuid === actor.uuid) continue;

                // Validate Foundry VTT visibility.
                if (!game.user?.isGM && token.hidden) continue;

                // TODO: taMiF/marks this will filter out targets without persona but active icons.
                if (!target.hasPersona) continue;
                // Filter out IC as they can't be targeted outside their host.
                if (target.isType('ic')) continue;
                // Filter out persona based on matrix rules.
                if (!actor.matrixPersonaIsVisible(target)) continue;

                // taM Check this
                const type = ActorMarksFlow.getDocumentType(document as any);
                targets.push({
                    name: token.name,
                    document: token.actor,
                    token,
                    runningSilent: token.actor.isRunningSilent(),
                    network: token.actor.network?.name ?? '',
                    type,
                    icons: []
                })
            }
        }


        // Sort all targets by grid name first and target name second.
        targets.sort((a, b) => {
            const gridNameA = a.network.toLowerCase();
            const gridNameB = b.network.toLowerCase();
            const nameA = a.document.name.toLowerCase();
            const nameB = b.document.name.toLowerCase();

            if (gridNameA < gridNameB) return -1;
            if (gridNameA > gridNameB) return 1;
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        });

        return targets;
    },

    /**
     * Collect matrix icons connected to the document given by uuid.
     * 
     * TODO: Look into MarkPlacementFlow_prepareActorDevices and merge functionality.
     * @param document 
     * @returns List of matrix icons connected to the document.
     */
    getConnectedMatrixIconTargets(document: SR5Actor) {
        const connectedIcons: Shadowrun.MarkedDocument[] = [];

        // Only persona icons should show connected icons.
        // TODO: Don´t show this for IC, Spirits, Sprite
        if (!(document instanceof SR5Actor)) return connectedIcons;

        const personaDevice = document.getMatrixDevice();
        for (const device of document.wirelessDevices) {
            // Persona devices don't have their own device icon.
            if (personaDevice && device.uuid === personaDevice.uuid) continue;

            connectedIcons.push({
                name: Helpers.getChatSpeakerName(device),
                document: device,
                token: null,
                runningSilent: device.isRunningSilent(),
                network: document.network?.name ?? '',
                type: ActorMarksFlow.getDocumentType(device),
                icons: [],
                marks: 0,
                markId: null,
            });
        }

        return connectedIcons;
    },

    /**
     * Collect visible hosts for selection.
     */
    visibelHosts() {
        return (game.items as unknown as SR5Item[])?.filter(item => item.isType('host') && item.matrixIconVisibleToPlayer()) ?? [];
    },

    /**
     * Collect all hosts for selection.
     */
    allHosts() {
        return (game.items as unknown as SR5Item[])?.filter(item => item.isType('host')) ?? [];
    },

    /**
     * Collect visible grids for selection.
     */
    visibleGrids() {
        return (game.items as unknown as SR5Item[])?.filter(item => item.isType('grid') && item.matrixIconVisibleToPlayer()) ?? [];
    },

    /**
     * Collect all grids for selection.
     */
    allGrids() {
        return (game.items as unknown as SR5Item[])?.filter(item => item.isType('grid')) ?? [];
    }
};
