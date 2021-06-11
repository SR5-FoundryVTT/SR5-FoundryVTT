import {MatrixRules} from "../module/rules/Matrix";

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
        });

        it('Should calculate IC matrix initiative base', () => {
            // 0 is the minimum value possible
            assert.strictEqual(MatrixRules.getICInitiativeBase(0), 0);
            assert.strictEqual(MatrixRules.getICInitiativeBase(-3), 0);
            // Check expected value scaling
            assert.strictEqual(MatrixRules.getICInitiativeBase(1), 2);
            assert.strictEqual(MatrixRules.getICInitiativeBase(2), 4);
            assert.strictEqual(MatrixRules.getICInitiativeBase(3), 6);
            assert.strictEqual(MatrixRules.getICInitiativeBase(12), 24);
        });

        it('Should calculate IC matrix initiative dice', () => {
            // 4 is the only value possible
            assert.strictEqual(MatrixRules.getICInitiativeDice(), 4);
        });

        it('Should calculate meat attribute base with the host rating', () => {
            // 0 is the minimum value possible
            assert.strictEqual(MatrixRules.getICMeatAttributeBase(0), 0);
            assert.strictEqual(MatrixRules.getICMeatAttributeBase(-3), 0);

            // All other values should equal
            assert.strictEqual(MatrixRules.getICMeatAttributeBase(3), 3);
            assert.strictEqual(MatrixRules.getICMeatAttributeBase(27), 27);
        });
    })
};