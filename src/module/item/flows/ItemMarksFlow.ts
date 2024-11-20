import { MarksStorage, SetMarksOptions } from "../../storage/MarksStorage";
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
     * @param device The matrix device that could've placed marks.
     */
    async clearMarks(device: SR5Item) {
        if (!device.isHost) return;

        const host = device.asHost;

        if (!host) return;

        await device.update({ 'system.marks': [] });
    },

    /**
     * Remove ONE mark. If you want to delete all marks, use clearMarks instead.
     *
     * @param device The host to remove active mark from.
     * @param uuid The icon to remove mark for.
     */
    async clearMark(device: SR5Item, uuid: string) {
        if (!device.isHost) return;

        const marks = device.system.marks?.filter(mark => mark.uuid !== uuid) ?? [];
        await device.update({ 'system.marks': marks });
    },

    /**
     * Place a Matrix Mark for this Item.
     *
     * @param host The matrix device that places the marks.
     * @param target The Document the marks are placed on. This can be an actor (character, technomancer, IC) OR an item (Host)
     * @param marks Amount of marks to be placed.
     * @param options Additional options that may be needed.
     *
     */
    async setMarks(host: SR5Item, target: Shadowrun.NetworkDevice | undefined, marks: number, options: SetMarksOptions = {}) {
        if (!host.isHost) {
            console.error('Only Host item types can place matrix marks!');
            return;
        }

        if (!target) return;

        if (target.hasMaster) {
            const master = target.master;
            if (master) await host.setMarks(master, marks, options);
        }

        const currentMarks = host.getMarksPlaced(target.uuid);
        let marksData = host.marksData ?? [];
        marksData = MarksStorage.setMarks(marksData, target, currentMarks, marks, options);
        await host.update({ 'system.marks': marksData });
    },

    /**
     * Get all mark data for this item.
     * @param device The device to get marks for
     * @param markId The markId to get the marks for.
     * @returns The amount of marks placed on the target.
     */
    getMarksPlaced(device: SR5Item, markId: string): number {
        const host = device.asHost;
        if (!host) return 0;
        return MarksStorage.getMarksPlaced(host.system.marks, markId);
    },

    /**
     * Get all marks data for this item.
     * @param device The device to get marks for
     * @returns The marks data for this item.
     */
    getMarksData(device: SR5Item): Shadowrun.MatrixMarks | undefined {
        const host = device.asHost;
        if (!host) return;
        return host.system.marks;
    }
}
