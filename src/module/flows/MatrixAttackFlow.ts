import { MatrixRules } from "../rules/MatrixRules";
import { OpposedTest } from "../tests/OpposedTest";
import { SuccessTest } from "../tests/SuccessTest";

/**
 * This flow handles everything involving matrix attacks, including initiating attacks,
 * resolving attack outcomes, and managing the effects of attacks on matrix devices.
 */
export const MatrixAttackFlow = {

    /**
     * Determine the outcome of a failed matrix attack.
     * @param test The test being evaluated.
     * @returns 
     */
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
        const content = await foundry.applications.handlebars.renderTemplate(
            'systems/shadowrun5e/dist/templates/chat/matrix-failed-attack-action.hbs',
            templateData,
        );
        const messageData = { content, speaker: templateData.speaker };
        await ChatMessage.create(messageData);

    },
}