type CoverageReport = {
    file: string;
    converted: Record<string, number>;
    skipped: Record<string, { count: number; example: string }>;
};

/** Summary of Chummer data that was converted or could not be represented. */
export class ChummerImportCoverage {
    private static converted = new Map<string, number>();
    private static skipped = new Map<string, { count: number; example: string }>();
    private static reports: CoverageReport[] = [];

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

    /** Keep the coverage of the file just imported, to be logged by {@link flush}. */
    static report(file: string) {
        this.reports.push({
            file,
            converted: Object.fromEntries(this.converted),
            skipped: Object.fromEntries(this.skipped),
        });
    }

    /** Log every report kept since the last flush, so they aren't buried in the import's own logs. */
    static flush() {
        const reports = this.reports;
        this.reports = [];
        if (!reports.length) return;

        console.group('Chummer import coverage');
        for (const { file, converted, skipped } of reports)
            console.info(file, { converted, skipped });
        console.groupEnd();
    }
}
