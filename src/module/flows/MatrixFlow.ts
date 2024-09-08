import { SR5Actor } from "../actor/SR5Actor";
import { MatrixRules } from "../rules/MatrixRules";
import { OpposedTest } from "../tests/OpposedTest";
import { SuccessTest } from "../tests/SuccessTest";

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
    changeMatrixAttribute(matrixAttributes: Shadowrun.MatrixAttributes, changedSlot: string, attribute: Shadowrun.MatrixAttribute): Record<string, any> {
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
            console.error(`Shadowrun 5e | Couldn't change attribute ${attribute} as it wasn't found in matrix attribute slots`, matrixAttributes);
            return {};
        }

        const updateData = {
            [`system.atts.${changedSlot}.att`]: attribute,
            [`system.atts.${previousSlot}.att`]: previousAttribute
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
        if (!MatrixRules.isIllegalAction(against.data.action.attribute, against.data.action.attribute2, against.data.action.limit.attribute)) return;

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
        const resultActions = [{
            label: 'SR5.Labels.Action.ForceReboot',
            action: 'forceReboot',
            value: 'Test'
        }]

        const templateData = {
            overwatchThreshold: MatrixRules.overwatchConvergenceScore(),
            damage,
            resultActions,
            speaker: {
                actor,
                alias,
                token
            }
        }
        const content = await renderTemplate('systems/shadowrun5e/dist/templates/chat/overwatch-convergence-message.hbs', templateData);
        const messageData = { content };
        await ChatMessage.create(messageData);
    }
}