import { MarkFlow, SetMarksOptions } from "../../flows/MarksFlow";
import { NetworkDevice } from "../../item/flows/MatrixNetworkFlow";
import { SR5Item } from "../../item/SR5Item";
import { MatrixRules } from "../../rules/MatrixRules";
import { SR5Actor } from "../SR5Actor";

/**
 * This flow handles everything around matrix mark management.
 * 
 * NOTE: this flow often uses decker to refer to deckers and technomancers interchangeably.
 * NOTE: This flow has a companion flow for items ItemMarksFlow.
 */
export const ActorMarksFlow = {
    /**
     * Place a number of marks by decker onto any kind of target.
     * 
     * @param persona The persona placing the marks
     * @param target The icon being marked
     * @param marks The amount of marks placed
     * @param options 
     */
    async setMarks(persona: SR5Actor, target: NetworkDevice|undefined, marks: number, options: SetMarksOptions = {}) {

        // Don't allow self marking.
        if (persona.id === target?.id) {
            return;
        }
        // Assert that the target is valid document.
        if (target && !(target instanceof SR5Item) && !(target instanceof SR5Actor)) {
            console.error('Shadowrun 5e | Setting marks is not supported on this target', target)
            return;
        }

        // CASES - DECKER IS SPECIAL.

        // TODO: Is it correct that ic place host marks?
        if (persona.isIC() && persona.hasHost()) {
            const host = await persona.getICHost();
            await host?.setMarks(target, marks, options);
            return;
        }

        if (!persona.isMatrixActor) {
            ui.notifications?.error(game.i18n.localize('SR5.Errors.MarksCantBePlacedBy'));
            console.error(`The actor type ${persona.type} can't receive matrix marks!`);
            return;
        }

        if (persona.hasLivingPersona) {
            ui.notifications?.error(game.i18n.localize('SR5.Errors.MarksCantBePlacedBy'));
            console.error(`Shadowrun 5e| Technomancers can't place marks without using a matrix device.`);
            return;
        }

        // CASES - TARGET IS AN ACTOR.

        // Abort for non-matrix actors
        if (target instanceof SR5Actor && !target.isMatrixActor) {
            ui.notifications?.error(game.i18n.localize('SR5.Errors.MarksCantBePlacedOn'));
            console.error(`The actor type ${target.type} can't receive matrix marks!`);
            return;
        }

        // For IC targets: place marks on both ic and host.
        if (target instanceof SR5Actor && target.isIC() && target.hasHost()) {
            const host = await target.getICHost();
            await persona.setMarks(host, marks, options);
        }

        // If the actor doesn't have living persona, target the persona matrix device instead.
        if (target instanceof SR5Actor && !target.hasActorPersona) {
            const matrixDevice = target.getMatrixDevice();
            if (!matrixDevice) {
                ui.notifications?.error(game.i18n.localize('SR5.Errors.MarksCantBePlacedWithoutPersona'));
                return;
            };

            target = matrixDevice;
        }

        // CASES - TARGET IS AN ITEM

        // If the targeted devices is within a WAN, place mark on the host as well.
        if (target instanceof SR5Item && target.isSlave) {
            const host = target.master();
            await persona.setMarks(host, marks, options);
        }


        // DEFAULT CASE - PLACE MARKS ON TARGET
        const matrixData = persona.matrixData;

        if (!matrixData) return;
        // TODO: Support not target, use options.name
        if (!target) return;

        const marksData = MarkFlow.setMarks(matrixData.marks, target, persona.getMarksPlaced(target.uuid), marks, options);
        await persona.update({'system.matrix.marks': marksData});
    },

    /**
     * Remove ALL marks placed by this actor
     */
    async clearMarks(persona: SR5Actor) {
        const matrixData = persona.matrixData;
        if (!matrixData) return;

        // Delete all markId properties from ActorData
        await persona.update({'system.matrix.marks': []});
    },

    /**
     * Remove ONE mark. If you want to delete all marks, use clearMarks instead.
     */
    async clearMark(persona: SR5Actor, uuid: string) {
        if (!persona.isMatrixActor) return;

        const marks = persona.matrixData?.marks.filter(mark => mark.uuid !== uuid) ?? [];
        await persona.update({'system.matrix.marks': marks});
    },

    /**
     * Get amount of Matrix marks placed by this actor on this target.
     *
     * @param persona The persona having placed marks
     * @param uuid Icon uuid the persona has placed marks on.
     * 
     * @returns Amount of marks placed
     */
    getMarksPlaced(persona: SR5Actor, uuid: string): number {
        return MarkFlow.getMark(persona.matrixData?.marks ?? [], uuid);
    },

    /**
     * See buildMarkUuid for a companion method for this method as well as documentation.
     * 
     * This method is a thin wrapper around FoundryVTT fromUuid to convert a mark uuid to a document.
     *
     * @param uuid The icon uuid for a marked document to be retrieved
     * 
     * @returns The document matching the given uuid.
     */
    async getMarkedDocument(uuid: string) {
        const target = await fromUuid(uuid) as SR5Actor | SR5Item | null;

        if (target instanceof SR5Item && ActorMarksFlow.targetIsPersonaDevice(target)) return target.parent;

        return target;
    },

    /**
     * Retrieve all documents marked by this decker.
     * 
     * @param matrixData Any documents matrix mark data.
     * @returns The documents that have been marked.
     */
    async getMarkedDocuments(matrixData: Shadowrun.MatrixMarks) {
        const documents: Shadowrun.MarkedDocument[] = [];

        for (const {uuid, name, marks} of matrixData) {
            const target = uuid ? await ActorMarksFlow.getMarkedDocument(uuid) : null;
            documents.push({target, marks, markId: uuid, name});
        }

        return documents;
    },

    /**
     * Actor owned items can be persona devices or just devices.
     * 
     * @param target Any matrix device
     * @return true, if the given matrix device is used as a persona device by an actor.
     */
    targetIsPersonaDevice(target: SR5Item): boolean {
        return target === target.parent?.getMatrixDevice();
    }
}