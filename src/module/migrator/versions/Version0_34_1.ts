import { VersionMigration } from '../VersionMigration';

const SYSTEM_SKILL_ICON_DIRECTORIES = [
    'systems/shadowrun5e/dist/icons/skills/',
    'systems/shadowrun5e/dist/icons/groups/',
] as const;

type MigratingSkillItem = {
    type?: unknown;
    img?: unknown;
    system?: {
        type?: unknown;
        source?: {
            uuid?: unknown;
        };
    };
};

export class Version0_34_1 extends VersionMigration {
    readonly TargetVersion = '0.34.1';

    override handlesItem(item: Readonly<MigratingSkillItem>): boolean {
        // Migration A) svg => webp
        return this.shouldMigrateOwnedSkillIcon(item);
    }

    override migrateItem(item: MigratingSkillItem): void {
        // Migration A) svg => webp
        if (!this.shouldMigrateOwnedSkillIcon(item)) return;
        item.img = this.migrateLegacyIconPath(item.img);
    }

    /**
     * Migration A) svg => webp
     * 
     * Migrate actor-owned skill and skill-group icons sourced from system skill sets
     * from legacy svg paths to webp.
     */
    private shouldMigrateOwnedSkillIcon(item: unknown): item is MigratingSkillItem & { img: string } {
        if (!item || typeof item !== 'object') return false;

        const candidate = item as MigratingSkillItem;
        if (candidate.type !== 'skill') return false;

        const skillType = candidate.system?.type;
        if (skillType !== 'skill' && skillType !== 'group') return false;

        const img = candidate.img;
        if (typeof img !== 'string' || !img.endsWith('.svg')) return false;

        return SYSTEM_SKILL_ICON_DIRECTORIES.some(directory => img.startsWith(directory));
    }

    private migrateLegacyIconPath(img: string): string {
        return img.replace(/\.svg$/, '.webp');
    }
}