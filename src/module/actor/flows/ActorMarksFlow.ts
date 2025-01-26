import { MarksStorage, SetMarksOptions } from "../../storage/MarksStorage";
import { SR5Item } from "../../item/SR5Item";
import { SR5Actor } from "../SR5Actor";
import { Translation } from "../../utils/strings";

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
     */
    async setMarks(persona: SR5Actor, target: Shadowrun.NetworkDevice|undefined, marks: number, options: SetMarksOptions = {}) {

        // Don't allow self marking.
        if (persona.id === target?.id) {
            return;
        }
        // Assert that the target is valid document.
        if (target && !(target instanceof SR5Item) && !(target instanceof SR5Actor)) {
            console.error('Shadowrun 5e | Setting marks is not supported on this target', target)
            return;
        }

        // CASE - IC and hosts
        if (persona.isIC() && persona.hasHost()) {
            const host = await persona.getICHost();
            await host?.setMarks(target, marks, options);
            return;
        }

        // CASE - Persona isn't a matrix actor.
        if (!persona.isMatrixActor) {
            ui.notifications?.error(game.i18n.localize('SR5.Errors.MarksCantBePlacedBy'));
            console.error(`The actor type ${persona.type} can't place matrix marks!`);
            return;
        }

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

        // Assure targeting of the persona device if necessary, if one is in use.
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
            const host = target.master;
            await persona.setMarks(host, marks, options);
        }


        // DEFAULT CASE - PLACE MARKS ON TARGET
        const matrixData = persona.matrixData;

        if (!matrixData) return;
        // TODO: Support marking a non-document target (using only a name)
        if (!target) return;

        const marksData = MarksStorage.setMarks(matrixData.marks, target, persona.getMarksPlaced(target.uuid), marks, options);

        await persona.update({'system.matrix.marks': marksData});
        await MarksStorage.storeRelations(persona.uuid, marksData);
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
     * Remove marks for one target uuid. If you want to delete all marks, use clearMarks instead.
     */
    async clearMark(persona: SR5Actor, uuid: string) {
        if (!persona.isMatrixActor) return;

        const marksData = persona.matrixData?.marks.filter(mark => mark.uuid !== uuid) ?? [];
        await persona.update({'system.matrix.marks': marksData});
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
        return MarksStorage.getMarksPlaced(persona.matrixData?.marks ?? [], uuid);
    },

    /**
     * Retrieve the document for the given FoundryVTT uuid.
     *
     * @param uuid The icon uuid for a marked document to be retrieved
     *
     * @returns FoundryVTT Document
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
            const network = ActorMarksFlow.getDocumentNetwork(target);
            const type = ActorMarksFlow.getDocumentType(target);
            documents.push({target, marks, markId: uuid, name, type, network});
        }

        return documents;
    },

    /**
     * Return a network name this document is using in the matrix.
     * 
     * NOTE: This function is part of sheet rendering, so we fail silently, to not break sheet rendering.
     * 
     * @param document Any markable document
     * @returns A document name
     */
    getDocumentNetwork(document: Shadowrun.NetworkDevice) {
        // A host/grid is it's own network.
        if (document instanceof SR5Item && document.type === 'host') return '';
        // if (document instanceof SR5Item && document.type === 'grid') return '';
        // A matrix persona might be connected to a netowrk.
        if (document instanceof SR5Actor && document.hasNetwork) return document.network?.name ?? '';
        // A matrix device might be part of a PAN/WAN
        if (document instanceof SR5Item && document.isSlave) return document.master?.name ?? '';

        return '';
    },

    /**
     * Trasnform the given document to a string type for sheet display.
     *
     * NOTE: This function is part of sheet rendering, so we fail silently, to not break sheet rendering.
     * 
     * @param document Any markable document
     * @returns A translation key to be translated.
     */
    getDocumentType(document: Shadowrun.NetworkDevice): Translation {
        // Determine special cases and default to persona.
        if (document instanceof SR5Item && document.isMatrixDevice) return 'SR5.Device';
        // if (document instanceof SR5Item && document.type === 'grid') return 'SR5.ItemTypes.Grid';
        if (document instanceof SR5Item && document.type === 'host') return 'SR5.ItemTypes.Host';

        if (document instanceof SR5Actor && document.type === 'ic') return 'SR5.ActorTypes.IC';
        if (document instanceof SR5Actor && document.type === 'sprite') return 'SR5.ActorTypes.Sprite';

        return 'SR5.Labels.ActorSheet.Persona'
    },

    /**
     * Check if the given device is the persona device of it's owning actor.
     *
     * @param device Any matrix device
     *
     * @return true, if the given matrix device is used as a persona device by an actor.
     */
    targetIsPersonaDevice(device: SR5Item): boolean {
        return device.isMatrixDevice && device === device.parent?.getMatrixDevice();
    }
}
