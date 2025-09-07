import { SR5Actor } from "@/module/actor/SR5Actor";
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
        if (!device.isType('host')) return;

        const host = device.asType('host');
        if (!host) return;

        await device.update({ system: { marks: [] } });
    },

    /**
     * Remove ONE mark. If you want to delete all marks, use clearMarks instead.
     *
     * @param device The host to remove active mark from.
     * @param uuid The icon to remove mark for.
     */
    async clearMark(device: SR5Item, uuid: string) {
        if (!device.isType('host')) return;

        const marks = device.system.marks?.filter(mark => mark.uuid !== uuid) ?? [];
        await device.update({ system: { marks } });
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
    async setMarks(host: SR5Item, target: SR5Actor | SR5Item | undefined, marks: number, options: SetMarksOptions = {}) {
        if (!host.isType('host')) {
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
        await host.update({ system: { marks: marksData } });
    },

    /**
     * Get all mark data for this item.
     * @param device The device to get marks for
     * @param markId The markId to get the marks for.
     * @returns The amount of marks placed on the target.
     */
    getMarksPlaced(device: SR5Item, markId: string): number {
        const host = device.asType('host');
        if (!host) return 0;
        return MarksStorage.getMarksPlaced(host.system.marks, markId);
    },

    /**
     * Get all marks data for this item.
     * @param device The device to get marks for
     * @returns The marks data for this item.
     */
    getMarksData(device: SR5Item) {
        const host = device.asType('host');
        if (!host) return;
        return host.system.marks;
    },

    /**
     * Note: This handler will be called for all active users, even if they lack permission to alter item data.
     *       This can result in lingering network devices or masters, when no GM or device owner is active.
     *
     * @param item This can be a network master or device or neither.
     */
    async handleOnDeleteItem(item: SR5Item) {
        console.debug(`Shadowrun 5e | Checking for marks for a deleted item ${item.name}`, item);

        await MarksStorage.clearRelations(item.uuid);
    }
}
