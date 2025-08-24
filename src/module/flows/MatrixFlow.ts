import { SR5Actor } from '../actor/SR5Actor';
import { Helpers } from '../helpers';
import { MatrixNetworkFlow } from '../item/flows/MatrixNetworkFlow';
import { SR5Item } from '../item/SR5Item';
import { MatrixRules } from '../rules/MatrixRules';
import { OpposedTest } from '../tests/OpposedTest';
import { SuccessTest } from '../tests/SuccessTest';
import { MatrixAttributesType } from '../types/template/Matrix';
import { Translation } from '../utils/strings';

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
     * Trasnform the given document to a string type for sheet display.
     *
     * NOTE: This function is part of sheet rendering, so we fail silently, to not break sheet rendering.
     * 
     * @param document Any markable document
     * @returns A translation key to be translated.
     */
    getDocumentType(document: SR5Actor | SR5Item): Translation {
        if (document instanceof SR5Item && document.type === 'host') return 'SR5.ItemTypes.Host';
        if (document instanceof SR5Item && document.type === 'grid') return 'SR5.ItemTypes.Grid';
        if (document instanceof SR5Item) return 'SR5.Device';

        if (document instanceof SR5Actor && document.type === 'ic') return 'SR5.ActorTypes.IC';

        return 'SR5.Labels.ActorSheet.Persona';
    }
}