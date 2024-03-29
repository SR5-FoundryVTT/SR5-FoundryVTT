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
     * @param decker 
     * @param target 
     * @param marks 
     * @param options 
     */
    async setMarks(decker: SR5Actor, target: SR5Actor|SR5Item|undefined, marks: number, options: { overwrite?: boolean } = {}) {
        // Avoid dirty input by breaking early.
        if (!target) {
            return;
        }

        // Don't allow self marking.
        if (decker.id === target.id) {
            return;
        }
        // Assert that the target is valid document.
        if (!(target instanceof SR5Item) && !(target instanceof SR5Actor)) {
            console.error('Shadowrun 5e | Setting marks is not supported on this target', target)
            return;
        }

        // CASES - DECKER IS SPECIAL.

        // TODO: Is it correct that ic place host marks?
        if (decker.isIC() && decker.hasHost()) {
            const host = await decker.getICHost();
            await host?.setMarks(target, marks, options);
            return;
        }

        if (!decker.isMatrixActor) {
            ui.notifications?.error(game.i18n.localize('SR5.Errors.MarksCantBePlacedBy'));
            console.error(`The actor type ${decker.type} can't receive matrix marks!`);
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
            await decker.setMarks(host, marks, options);
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
        if (target instanceof SR5Item && target.isNetworkDevice) {
            const host = await target.networkController();
            await decker.setMarks(host, marks, options);
        }


        // DEFAULT CASE

        const targetUuid = ActorMarksFlow.buildMarkUuid(target.uuid);
        const matrixData = decker.matrixData;

        if (!matrixData) return;

        const currentMarks = options?.overwrite ? 0 : decker.getMarksById(targetUuid);
        matrixData.marks[targetUuid] = MatrixRules.getValidMarksCount(currentMarks + marks);

        await decker.update({'system.matrix.marks': matrixData.marks});
    },

    /**
     * Remove ALL marks placed by this actor
     */
    async clearMarks(decker: SR5Actor) {
        const matrixData = decker.matrixData;
        if (!matrixData) return;

        // Delete all markId properties from ActorData
        const updateData = {}
        for (const markId of Object.keys(matrixData.marks)) {
            updateData[`-=${markId}`] = null;
        }

        await decker.update({'system.matrix.marks': updateData});
    },

    /**
     * Remove ONE mark. If you want to delete all marks, use clearMarks instead.
     */
    async clearMark(decker: SR5Actor, markId: string) {
        if (!decker.isMatrixActor) return;

        const updateData = {}
        updateData[`-=${markId}`] = null;

        await decker.update({'system.matrix.marks': updateData});
    },

    /**
     * Get all mark data for this actor.
     * @param decker 
     */
    getAllMarks(decker: SR5Actor): Shadowrun.MatrixMarks | undefined {
        const matrixData = decker.matrixData;
        if (!matrixData) return;
        return matrixData.marks;
    },

    /**
     * Return the amount of marks this actor has on another actor or one of their items.
     *
     * TODO: It's unclear what this method will be used for
     *       What does the caller want?
     *
     * TODO: Check with technomancers....
     * TODO: check options necessary?
     *
     * @param target
     * @param item
     * @param options
     */
    getMarks(decker: SR5Actor, target: Token, item?: SR5Item, options?: { scene?: Scene }): number {
        if (!canvas.ready) return 0;
        if (target instanceof SR5Item) {
            console.error('Not yet supported');
            return 0;
        }
        if (!target.actor || !target.actor.isMatrixActor) return 0;


        // If an actor has been targeted, they might have a device. If an item / host has been targeted they don't.
        item = item || target instanceof SR5Actor ? target.actor.getMatrixDevice() : undefined;
        if (!item) return 0;

        return decker.getMarksById(item.uuid);
    },

    /**
     * Get amount of Matrix marks placed by this actor on this target.
     * @param targetUuid A FoundryVTT document uuid
     * @returns Amount of marks placed
     */
    getMarksById(decker: SR5Actor, targetUuid: string): number {
        const markId = ActorMarksFlow.buildMarkUuid(targetUuid);
        return decker.matrixData?.marks[markId] || 0;
    },

    /**
     * FoundryVTT auto splits dot separated key values during it's update flow.
     * 
     * This method will build a mark uuid from a target uuid.
     * @param uuid A document uuid
     * @returns A mark uuid, using | instead of .
     */
    buildMarkUuid(uuid: string): string {
        return uuid.replace(/\./g, '|');
    },

    /**
     * See buildMarkUuid for the companion method for this method as well as documentation.
     * @param markUuid A mark uuid
     * @returns A document uuid
     */
    buildDocumentUuid(markUuid: string): string {
        return markUuid.replace(/\|/g, '.');
    },

    /**
     * See buildMarkUuid for a companion method for this method as well as documentation.
     * 
     * This method is a thin wrapper around FoundryVTT fromUuid to convert a mark uuid to a document.
     * @param markId A mark uuid
     */
    async getMarkedDocument(markId: string) {
        const uuid = ActorMarksFlow.buildDocumentUuid(markId);
        const target = await fromUuid(uuid) as SR5Actor | SR5Item | null;

        if (target instanceof SR5Item && ActorMarksFlow.targetIsPersonaDevice(target)) return target.parent;

        return target;
    },

    /**
     * Retrieve all documents marked by this decker.
     * 
     * @param marks A record of markIds to marks
     */
    async getMarkedDocuments(marks: Shadowrun.MatrixMarks) {
        const documents: Shadowrun.MarkedDocument[] = [];

        for (const [markId, amount] of Object.entries(marks)) {
            const target = await ActorMarksFlow.getMarkedDocument(markId);
            if (!target) continue;

            documents.push({target, marks: amount, markId});
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