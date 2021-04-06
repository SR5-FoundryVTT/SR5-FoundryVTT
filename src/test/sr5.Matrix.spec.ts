import {MatrixRules} from "../module/sr5/Matrix";

export const shadowrunMatrix = context => {
    const {describe, it, assert, before, after} = context;

    describe('Matrix Rules', () => {
        it('Should calculate IC device rating', () => {
            let hostRating = 5;
            assert.strictEqual(MatrixRules.getICDeviceRating(hostRating), hostRating);
            // Negative values shouldn't break the system.
            hostRating = -1;
            assert.strictEqual(MatrixRules.getICDeviceRating(hostRating), 0);
        });

        it('Should calculate IC condition monitor', () => {
            // 8 is the minimum value possible
            assert.strictEqual(MatrixRules.getConditionMonitor(0), 8);
            // Check round up
            assert.strictEqual(MatrixRules.getConditionMonitor(1), 9);
            // Check no rounding
            assert.strictEqual(MatrixRules.getConditionMonitor(4), 10);
            // Negative values shouldn't break the system.
            assert.strictEqual(MatrixRules.getConditionMonitor(-1), 8);
        })
    })
};