import { SR5Actor } from "@/module/actor/SR5Actor";
import { SR5Item } from "@/module/item/SR5Item";
import { Helpers } from "@/module/helpers";
import type { SuccessTestData } from "@/module/tests/SuccessTest";
import { MatrixOpposedTargetFlow } from "@/module/tests/flows/MatrixOpposedTargetFlow";

export type FlowSubjectDocument = SR5Actor | SR5Item | TokenDocument;

/**
 * Determine who rolls a test cast from the message of the test it follows.
 *
 * @param againstData The data of the test the new test follows.
 * @returns The documents to roll with, one test each. Empty when nobody can.
 */
export type FlowSubjectResolver = (againstData: SuccessTestData) => Promise<(FlowSubjectDocument | null | undefined)[]>;

/**
 * Who rolls a test following another test's message, by resolver name.
 *
 * Test classes name their resolver with `static subjects`. Exposed on game.shadowrun5e.flow.subjects
 * for modules to add their own.
 */
export const FlowSubjects: Record<string, FlowSubjectResolver> = {
    /**
     * The targets of the test being opposed. For matrix tests, its targeted icons first.
     */
    async targets(againstData) {
        const documents: (FlowSubjectDocument | null | undefined)[] = await Helpers.getOpposedTestTargets(againstData);
        if (againstData.categories.includes('matrix')) {
            documents.unshift(...await Helpers.getMatrixTestTargetDocuments(againstData as never));
        }
        return documents;
    },

    /**
     * The matrix icons targeted by the test being followed.
     */
    async matrixTargets(againstData) {
        return Helpers.getMatrixTestTargetDocuments(againstData as never);
    },

    /**
     * The targets of the test being followed.
     */
    async testTargets(againstData) {
        return Helpers.getTestTargetDocuments(againstData);
    },

    /**
     * Resisting what a matrix resist test resisted happens for its icons, otherwise for the targets.
     */
    async resistTargets(againstData) {
        return againstData.action.test === 'MatrixResistTest'
            ? FlowSubjects.matrixTargets(againstData)
            : FlowSubjects.testTargets(againstData);
    },

    /**
     * Tokens the current user selected, or their character.
     */
    // oxlint-disable-next-line typescript/require-await -- A resolver returns a Promise, other resolvers await.
    async selected() {
        return Helpers.getSelectedActorsOrCharacter();
    },

    /**
     * The matrix icon targeted by the test being opposed. Without one, a temporary icon is created for
     * the opposing side, falling back to the selected actor or the users character.
     *
     * The resolved icon is stored on the given test data, as the opposing test reads it from there.
     */
    async matrixIcon(againstData) {
        const data = againstData as SuccessTestData & { iconUuid?: string };
        let document: FlowSubjectDocument | null = null;
        const caster = data.sourceActorUuid ? await fromUuid<SR5Actor>(data.sourceActorUuid) : null;

        if (data.iconUuid) document = await fromUuid(data.iconUuid) as FlowSubjectDocument | null;

        if (!document && !data.iconUuid) {
            document = await MatrixOpposedTargetFlow.createTemporaryDocument(caster ?? undefined) ?? null;
            if (document) data.iconUuid = document.uuid ?? undefined;
        }

        if (!document) {
            document = Helpers.getSelectedActorsOrCharacter()[0] ?? game.user.character ?? null;
            data.iconUuid = document?.uuid ?? undefined;
        }

        return document ? [document] : [];
    },

    /**
     * The caster rolls for an opposition without an actor of its own, like a spirit's or sprite's
     * Force or Level, or a preparation's Force.
     */
    async caster(againstData) {
        const sourceUuid = againstData.sourceActorUuid || againstData.sourceUuid || '';

        let document: unknown = sourceUuid ? await fromUuid(sourceUuid) : null;
        if (document instanceof TokenDocument) document = document.actor ?? null;

        if (document instanceof SR5Actor || document instanceof SR5Item) return [document];
        return [];
    },
};
