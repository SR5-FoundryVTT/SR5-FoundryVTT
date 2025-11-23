import { SR5Actor } from "../actor/SR5Actor";
import { MatrixRules } from "../rules/MatrixRules";
import { OpposedTest } from "../tests/OpposedTest";
import { SuccessTest } from "../tests/SuccessTest";

/**
 * Include functionality around the matrix overwatch handling
 */
export const OverwatchFlow = {
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
            await this.executeOverwatchConvergence(actor);
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

        await this.sendOverwatchConvergenceMessage(templateData);
    },

    /**
     * Send out a chat message to inform the GM about convergenace and provide actions for it.
     */
    async sendOverwatchConvergenceMessage(templateData) {
        const content = await foundry.applications.handlebars.renderTemplate(
            'systems/shadowrun5e/dist/templates/chat/overwatch-convergence-message.hbs',
            templateData,
        );
        const messageData = { content, speaker: templateData.speaker };
        await ChatMessage.create(messageData);

    },
}