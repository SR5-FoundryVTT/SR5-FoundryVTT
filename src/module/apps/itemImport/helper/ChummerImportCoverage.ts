/** Summary of Chummer data that was converted or could not be represented. */
export class ChummerImportCoverage {
    private static converted = new Map<string, number>();
    private static skipped = new Map<string, { count: number; example: string }>();

    static reset() {
        this.converted.clear();
        this.skipped.clear();
    }

    static add(kind: string) {
        this.converted.set(kind, (this.converted.get(kind) ?? 0) + 1);
    }

    static skip(kind: string, example: string) {
        const entry = this.skipped.get(kind) ?? { count: 0, example };
        entry.count++;
        this.skipped.set(kind, entry);
    }

    static report(file: string) {
        console.info(`Chummer import coverage: ${file}`, {
            converted: Object.fromEntries(this.converted),
            skipped: Object.fromEntries(this.skipped),
        });
    }
}
