import { SR5Actor } from "../../actor/SR5Actor";
import { SR5Item } from "../../item/SR5Item";
import { NetworkStorage } from "../../storage/NetworkStorage";
import { UpdateData, VersionMigration } from "../VersionMigration";

/**
 * Migration for new matrix system:
 * - Migrate actor.system.matrix.marks by removing it for an empty array. Legacy marks from 2 years ago shouldn't matter today.
 */
export class Version_0_30_0 extends VersionMigration {
    get SourceVersion(): string {
        return '0.22.0';
    }

    get TargetVersion(): string {
        return Version_0_30_0.TargetVersion;
    }

    static get TargetVersion(): string {
        return "0.30.0";
    }

    // We need to migrate all token actors as well.
    protected override async ShouldMigrateSceneData(scene: Scene) {
        return true;
    }

    protected override async ShouldMigrateItemData(item: SR5Item) {
        return item.isHost || item.isDevice || item.isMatrixDevice;
    }

    protected override async ShouldMigrateActorData(actor: SR5Actor) {
        return actor.isMatrixActor || actor.isIC();
    }

    protected override async MigrateItemData(item: SR5Item) {
        let updateData: UpdateData = {data: {}};

        if (item.isHost) {
            updateData = await this.MigrateHostData(item, updateData);
        }
        if (item.isDevice) {
            updateData = await this.MigrateDeviceData(item, updateData);
        }
        if (item.isMatrixDevice) {
            updateData = await this.MigrateMatrixDeviceData(item, updateData);
        }

        return updateData;
    }

    /**
     * Marks data has been migrated from a document id to uuid approach.
     * 
     * Since the original approach was disabled for very long, we just throw away all marks...
     * 
     * @param item 
     * @returns 
     */
    protected async MigrateHostData(item: SR5Item, updateData: UpdateData): Promise<UpdateData> {
        const marksData = item.system['marks'];
        if (!marksData) return updateData;
        if (Array.isArray(marksData)) return updateData;

        updateData.data['marks'] = [];

        return updateData;
    }

    /**
     * PAN slave data has been migrated from document storage to global storage.
     * 
     * The given item is a master device.
     * 
     * @param item A device item containing PAN slaves.
     */
    protected async MigrateDeviceData(item: SR5Item, updateData: UpdateData): Promise<UpdateData> {
        updateData.data['-=networkDevices'] = null;
        // TODO: Check if necessary and removed from template.json and types.
        updateData.data['-=slaves'] = null;

        // @ts-expect-error networkDevices is not part of the types anymore.
        const deviceUuids = item?.system?.networkDevices ?? [];

        for (const uuids of deviceUuids) {
            const device = await fromUuid(uuids);
            if (!device) continue;

            await NetworkStorage.addSlave(item, device);
        }

        return updateData;
    }

    /**
     * PAN master data has been migrated from document storage to global storage.
     * 
     * The given item is a slave device.
     * 
     * @param item A matrix device item containing PAN master.
     */
    protected async MigrateMatrixDeviceData(item: SR5Item, updateData: UpdateData): Promise<UpdateData> {
        // update wireless to new value based on the current -- for this, assume true is online and false is offline
        if (updateData.data.technology) {
            updateData.data.technology.wireless = item.system.technology?.wireless ? 'online' : 'offline'
        }

        updateData.data['technology.-=networkController'] = null;

        const uuid = item.system?.technology?.networkController ?? '';
        const controller = await fromUuid(uuid) as SR5Item;
        if (!controller) return updateData;

        await NetworkStorage.addSlave(controller, item);

        return updateData;
    }

    /**
     * PAN master data has been migrated from document storage to global storage.
     * @param actor A actor containg old matrix data
     */

    protected override async MigrateActorData(actor: SR5Actor) {
        let updateData: UpdateData = {data: {}};
        if (actor.isIC()) { 
            updateData = await this.MigrateICHostRelationShip(actor);
        }

        if (actor.isMatrixActor) {
            const matrixData = actor.system['matrix'];
            if (!matrixData) return updateData;
            if (Array.isArray(matrixData.marks)) return updateData;

            updateData.data['matrix.marks'] = [];
        }

        return updateData;
    }

    /**
     * Migrate document local to global storage relation ship storage.
     * 
     * Migration will get all IC actors, even if no host is set.
     * Migration will check if relationship is still valid and remove none existant hosts.
     * 
     * @param actor An IC actor
     */
    protected async MigrateICHostRelationShip(actor: SR5Actor): Promise<UpdateData> {
        const updateData = {data: {}};
        // Remove host id in any case.
        updateData.data['host.-=id'] = null;

        if (actor.type !== 'ic') return updateData;

        // @ts-expect-error id is not part of types anymore.
        const id = actor.system.host.id ?? '';
        const host = game.items?.get(id);

        // No host exists, or the ic contains invalid host id.
        if (!host) {
            return updateData;
        }

        // Directly set global storage.
        await NetworkStorage.addSlave(host, actor);

        return updateData;
    }
}
