import { Version0_8_0 } from "./versions/Version0_8_0";
import { Version0_18_0 } from './versions/Version0_18_0';
import { Version0_16_0 } from './versions/Version0_16_0';
import { Version0_27_0 } from './versions/Version0_27_0';

export class Migrator {
    // List of all version migrations and their target version numbers.
    // ⚠️ Keep this list sorted in ascending order by version number (oldest → newest).
    private static readonly s_Versions = [
        new Version0_8_0(),
        new Version0_18_0(),
        new Version0_16_0(),
        new Version0_27_0(),
    ] as const;

    public static migrate(type: "Actor" | "Item" | "ActiveEffect", data: any) {
         // Skip tombstone items
        if (data._tombstone || data._stats == null) return data;

        const version = data._stats.systemVersion || "0.0.0";
        const migrators = this.s_Versions.filter(v => this.compareVersion(v.TargetVersion, version) > 0);

        for (const migrator of migrators) {
            if (type === "Actor")
                migrator.migrateActor(data);
            else if (type === "Item")
                migrator.migrateItem(data);
            else if (type === "ActiveEffect")
                migrator.migrateActiveEffect(data);
        }

        return data;
    }

    /**
     * compare two version numbers
     * @param v1
     * @param v2
     * @return 1 if v1 > v2, -1 if v1 < v2, 0 if equal
     */
    public static compareVersion(v1: string, v2: string): number {
        const s1 = v1.split('.').map(Number);
        const s2 = v2.split('.').map(Number);
        const length = Math.max(s1.length, s2.length);

        for (let i = 0; i < length; i++) {
            const n1 = s1[i] ?? 0;
            const n2 = s2[i] ?? 0;
            if (n1 > n2) return 1;
            if (n1 < n2) return -1;
        }

        return 0;
    }
}
