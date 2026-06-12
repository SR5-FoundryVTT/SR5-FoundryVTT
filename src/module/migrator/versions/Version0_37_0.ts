import { VersionMigration } from '../VersionMigration';
import { liftLegacyEmbeddedChildren } from './legacyLift';

const { getProperty, hasProperty, setProperty } = foundry.utils;

export class Version0_37_0 extends VersionMigration {
    readonly TargetVersion = '0.37.0';

    override migrateItem(item: any): void {
        this.consolidateParentId(item);
    }

    override migrateActor(actor: any): void {
        const items = Array.isArray(actor.items) ? [...actor.items] : [];
        for (const item of items) {
            this.consolidateParentId(item);
        }

        const lifted: any[] = [];
        for (const item of items) {
            lifted.push(...liftLegacyEmbeddedChildren(item));
        }

        for (const child of lifted) {
            this.consolidateParentId(child);
        }

        if (lifted.length > 0) {
            actor.items.push(...lifted);
        }
    }

    /**
     * Fold the legacy system.container field into system.parentId (a child is either stored in a
     * container or attached to a parent, never both, so they share one field), and ensure
     * parentId is always present.
     */
    private consolidateParentId(item: any) {
        if (!item?.system || typeof item.system !== 'object') return;

        const parentId = getProperty(item.system, 'parentId');
        const container = getProperty(item.system, 'container');
        if ((parentId === null || parentId === undefined || parentId === '') && typeof container === 'string' && container) {
            setProperty(item.system, 'parentId', container);
        }
        if (!hasProperty(item.system, 'parentId')) setProperty(item.system, 'parentId', null);
    }
}
