import { FLAGS, SYSTEM_NAME } from '@/module/constants';
import { VersionMigration } from '../VersionMigration';

const { deepClone, getProperty, hasProperty, randomID, setProperty } = foundry.utils;

export class Version0_38_0 extends VersionMigration {
    readonly TargetVersion = '0.38.0';

    override migrateItem(item: any): void {
        this.normalizeLinkFields(item);
    }

    override migrateActor(actor: any): void {
        const items = Array.isArray(actor.items) ? actor.items : [];
        for (const item of items) {
            this.normalizeLinkFields(item);
        }

        const lifted: any[] = [];
        for (const item of items) {
            lifted.push(...this.liftAttachmentItems(item));
        }

        if (lifted.length > 0) {
            actor.items.push(...lifted);
        }
    }

    private normalizeLinkFields(item: any) {
        if (!item?.system || typeof item.system !== 'object') return;
        if (!hasProperty(item.system, 'parentId')) setProperty(item.system, 'parentId', null);
        if (!hasProperty(item.system, 'parentRole')) setProperty(item.system, 'parentRole', null);
    }

    private liftAttachmentItems(item: any): any[] {
        if (!item?._id) return [];

        const embeddedItems = this.normalizeArray(getProperty(item, `flags.${SYSTEM_NAME}.${FLAGS.EmbeddedItems}`));
        if (embeddedItems.length === 0) return [];

        const lifted: any[] = [];
        const remaining: any[] = [];
        for (const embeddedItem of embeddedItems) {
            const role = this.determineRole(item, embeddedItem);
            if (!role) {
                remaining.push(embeddedItem);
                continue;
            }

            const child = deepClone(embeddedItem);
            child._id = randomID();
            this.normalizeLinkFields(child);
            setProperty(child, 'system.parentId', item._id);
            setProperty(child, 'system.parentRole', role);

            if (child.type === 'modification') {
                if (role === 'weapon_mod') setProperty(child, 'system.type', 'weapon');
                if (role === 'armor_mod') setProperty(child, 'system.type', 'armor');
                if (role === 'vehicle_mod') setProperty(child, 'system.type', 'vehicle');
                if (role === 'drone_mod') setProperty(child, 'system.type', 'drone');
            }

            lifted.push(child);
        }

        if (remaining.length > 0) {
            setProperty(item, `flags.${SYSTEM_NAME}.${FLAGS.EmbeddedItems}`, remaining);
        } else if (lifted.length > 0) {
            delete item.flags?.[SYSTEM_NAME]?.[FLAGS.EmbeddedItems];
        }

        return lifted;
    }

    private determineRole(parent: any, child: any): string | null {
        if (parent?.type === 'weapon' && child?.type === 'ammo') return 'weapon_ammo';
        if (child?.type !== 'modification') return null;
        if (parent?.type === 'weapon') return 'weapon_mod';
        if (parent?.type === 'armor') return 'armor_mod';
        if (parent?.type === 'vehicle') return 'vehicle_mod';
        if (parent?.type === 'drone') return 'drone_mod';
        return null;
    }

    private normalizeArray(data: any): any[] {
        if (data == null) return [];
        return Array.isArray(data) ? data : Object.values(data);
    }
}
