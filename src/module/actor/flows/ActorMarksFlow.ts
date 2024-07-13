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
    async setMarks(persona: SR5Actor, target: NetworkDevice|undefined, marks: number, options: { overwrite?: boolean } = {}) {
        // Avoid dirty input by breaking early.
        if (!target) {
            return;
        }

        // Don't allow self marking.
        if (persona.id === target.id) {
            return;
        }
        // Assert that the target is valid document.
        if (!(target instanceof SR5Item) && !(target instanceof SR5Actor)) {
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

        const currentMarks = options?.overwrite ? 0 : persona.getMarksById(target.uuid);
        let mark = matrixData.marks.find(mark => mark.uuid === target.uuid);

        // Either alter the existing mark or create a new one.
        if (mark) {
            mark.marks = MatrixRules.getValidMarksCount(currentMarks + marks);
        } else {
            mark = {
                uuid: target.uuid,
                name: target.name ?? '',
                marks: MatrixRules.getValidMarksCount(currentMarks + marks)
            }
            matrixData.marks.push(mark);
        }

        await persona.update({'system.matrix.marks': matrixData.marks});
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
     * Get all mark data for this actor.
     *
     * @param persona The persona actor to pull marks from
     */
    getAllMarks(persona: SR5Actor): Shadowrun.MatrixMarks | undefined {
        return persona.matrixData?.marks;
    },

    /**
     * Return the amount of marks this actor has on another actor or one of their items.
     *
     * TODO: It's unclear what this method will be used for
     *       What does the caller want?
     *
     * TODO: Check with technomancers....
     *
     * @param persona The persona having placed the marks
     * @param target The icon to retrieve the personas marks from
     * @param item
     * 
     * @returns 
     */
    getMarks(persona: SR5Actor, target: Token, item?: SR5Item): number {
        if (!canvas.ready) return 0;
        if (target instanceof SR5Item) {
            console.error('Not yet supported');
            return 0;
        }
        if (!target.actor || !target.actor.isMatrixActor) return 0;


        // If an actor has been targeted, they might have a device. If an item / host has been targeted they don't.
        item = item || target instanceof SR5Actor ? target.actor.getMatrixDevice() : undefined;
        if (!item) return 0;

        return ActorMarksFlow.getMarksById(persona, item.uuid);
    },

    /**
     * Get amount of Matrix marks placed by this actor on this target.
     *
     * @param persona The persona having placed marks
     * @param uuid Icon uuid the persona has placed marks on.
     * 
     * @returns Amount of marks placed
     */
    getMarksById(persona: SR5Actor, uuid: string): number {
        return persona.matrixData?.marks.find(mark => mark.uuid === uuid)?.marks ?? 0;
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
     * @param matrixMarks Any documents matrix mark data.
     * @returns The documents that have been marked.
     */
    async getMarkedDocuments(matrixMarks: Shadowrun.MatrixMarks) {
        const documents: Shadowrun.MarkedDocument[] = [];

        for (const {uuid, name, marks} of matrixMarks) {
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