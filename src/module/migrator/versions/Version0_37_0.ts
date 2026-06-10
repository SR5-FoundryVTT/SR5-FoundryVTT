import { FLAGS, SYSTEM_NAME } from '@/module/constants';
import { VersionMigration } from '../VersionMigration';

const { deepClone, getProperty, hasProperty, randomID, setProperty } = foundry.utils;

export class Version0_37_0 extends VersionMigration {
    readonly TargetVersion = '0.37.0';

    override migrateItem(item: any): void {
        this.normalizeContainerField(item);
    }

    override migrateActor(actor: any): void {
        const items = Array.isArray(actor.items) ? actor.items : [];
        for (const item of items) {
            this.normalizeContainerField(item);
            this.liftContainerNestedItems(actor, item);
        }
    }

    private normalizeContainerField(item: any) {
        if (!item?.system || typeof item.system !== 'object') return;
        if (!hasProperty(item.system, 'container')) setProperty(item.system, 'container', null);
    }

    private liftContainerNestedItems(actor: any, item: any) {
        if (item?.type !== 'container') return;
        if (!item._id) return;

        const embeddedItems = this.normalizeArray(getProperty(item, `flags.${SYSTEM_NAME}.${FLAGS.EmbeddedItems}`));
        if (embeddedItems.length === 0) return;

        for (const embeddedItem of embeddedItems) {
            const lifted = deepClone(embeddedItem);
            lifted._id = randomID();
            setProperty(lifted, 'system.container', item._id);
            actor.items.push(lifted);
        }

        delete item.flags?.[SYSTEM_NAME]?.[FLAGS.EmbeddedItems];
    }

    private normalizeArray(data: any): any[] {
        if (data == null) return [];
        return Array.isArray(data) ? data : Object.values(data);
    }
}
