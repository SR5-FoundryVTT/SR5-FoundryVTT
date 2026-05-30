/**
 * Isolated Quench invocation.
 *
 * @param {import('playwright').Page} page  a page already at `game.ready`
 * @param {{ pattern?: string, runTimeoutMs?: number }} [opts]
 */
export async function runQuenchInPage(page, opts = {}) {
    const pattern = opts.pattern ?? 'shadowrun5e.**';
    const runTimeoutMs = opts.runTimeoutMs ?? 10 * 60 * 1000;

    return page.evaluate(
        async ({ pattern, runTimeoutMs }) => {
            const quench = globalThis.quench;
            if (!quench) throw new Error('global `quench` is unavailable - is the Quench module active?');

            // Render the results app first, or Quench's run-begin handler throws on
            // an undefined element and the run never completes.
            await quench.app.render({ force: true });

            const runner = await quench.runBatches(pattern);
            const failedEvents = [];
            runner.on('fail', (test, err) => {
                failedEvents.push({
                    title: test?.fullTitle?.() ?? test?.title ?? 'Unknown failed test',
                    error: err?.message ?? String(err ?? 'unknown error'),
                });
            });

            // runBatches resolves before Mocha finishes.
            await new Promise((resolve, reject) => {
                if (runner.stats?.end) return resolve();
                const timer = setTimeout(
                    () => reject(new Error(`Quench run did not finish within ${runTimeoutMs}ms`)),
                    runTimeoutMs,
                );
                runner.once('end', () => {
                    clearTimeout(timer);
                    resolve();
                });
            });

            const failures = [];
            const seenFailures = new Set();
            const addFailure = (failure) => {
                const title = failure.title ?? 'Unknown failed test';
                const error = failure.error ?? 'unknown error';
                const key = `${title}\n${error}`;
                if (seenFailures.has(key)) return;
                seenFailures.add(key);
                failures.push({ title, error });
            };
            const walk = (suite) => {
                for (const test of suite.tests ?? []) {
                    if (test.state === 'failed') {
                        addFailure({
                            title: test.fullTitle?.() ?? test.title,
                            error: test.err?.message ?? String(test.err ?? 'unknown error'),
                        });
                    }
                }
                for (const child of suite.suites ?? []) walk(child);
            };
            if (runner.suite) walk(runner.suite);
            for (const failure of failedEvents) addFailure(failure);

            const s = runner.stats ?? {};
            const failureCount = s.failures ?? failures.length;
            while (failures.length < failureCount) {
                addFailure({
                    title: `Uncaptured Mocha failure ${failures.length + 1}`,
                    error: 'Mocha reported this failure in runner.stats, but no failed test object was available.',
                });
            }
            return {
                pattern,
                stats: {
                    tests: s.tests ?? 0,
                    passes: s.passes ?? 0,
                    failures: failureCount,
                    pending: s.pending ?? 0,
                    duration: s.duration ?? 0,
                },
                failures,
            };
        },
        { pattern, runTimeoutMs },
    );
}
