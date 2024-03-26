import { SR5Actor } from "../../actor/SR5Actor";
import { MatrixRules } from "../../rules/MatrixRules";
import { SR5Item } from "../SR5Item";

/**
 * This flow handles everything around matrix mark management.
 * 
 * NOTE: this flow has companion flow for actors ActorMarksFlow.
 */
export const ItemMarksFlow = {
    /**
     * Remove ALL marks placed by this item.
     *
     * TODO: Allow partial deletion based on target / item
     * @param device The matrix device that could've placed marks.
     */
    async clearMarks(device: SR5Item) {
        if (!device.isHost) return;

        const host = device.asHost;

        if (!host) return;

        // Delete all markId properties from ActorData
        const updateData = {}
        for (const markId of Object.keys(host.system.marks)) {
            updateData[`-=${markId}`] = null;
        }

        await device.update({ 'system.marks': updateData });
    },

    /**
     * Remove ONE mark. If you want to delete all marks, use clearMarks instead.
     * 
     * @param device The matrix device that could've placed marks.
     * @param markId The markId to remove.
     */
    async clearMark(device: SR5Item, markId: string) {
        if (!device.isHost) return;

        const updateData = {}
        updateData[`-=${markId}`] = null;

        await device.update({ 'system.marks': updateData });
    },

    /**
     * Place a Matrix Mark for this Item.
     *
     * @param device The matrix device that places the marks.
     * @param target The Document the marks are placed on. This can be an actor (character, technomancer, IC) OR an item (Host)
     * @param marks Amount of marks to be placed.
     * @param options Additional options that may be needed.
     * @param options.scene The scene the targeted actor lives on.
     * @param options.item
     *
     */
    async setMarks(device: SR5Item, target: SR5Actor | SR5Item, marks: number, options?: { scene?: Scene, item?: Item, overwrite?: boolean }) {
        if (!canvas.ready) return;

        if (!device.isHost) {
            console.error('Only Host item types can place matrix marks!');
            return;
        }

        const host = device.asHost;
        if (!host) return;

        const targetUuid = target.uuid;
        const currentMarks = options?.overwrite ? 0 : device.getMarksById(targetUuid);
        host.system.marks[targetUuid] = MatrixRules.getValidMarksCount(currentMarks + marks);

        await device.update({ 'system.marks': host.system.marks });
    },

    /**
     * Get all mark data for this item.
     * @param device The device to get marks for
     * @param markId The markId to get the marks for.
     * @returns The amount of marks placed on the target.
     */
    getMarksById(device: SR5Item, markId: string): number {
        const host = device.asHost;
        return host ? host.system.marks[markId] : 0;
    },

    /**
     * Get all marks data for this item.
     * @param device The device to get marks for    
     * @returns The marks data for this item.
     */
    getAllMarks(device: SR5Item): Shadowrun.MatrixMarks|undefined {
        const host = device.asHost;
        if (!host) return;
        return host.system.marks;
    }
}