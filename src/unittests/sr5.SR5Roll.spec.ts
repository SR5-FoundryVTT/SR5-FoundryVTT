import { rootCertificates } from 'tls';
import { SR5Roll } from './../module/rolls/SR5Roll';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';


/**
 * Testing of the SR5Roll helper for Shadowrun style pool rolling.
 * 
 * TODO: Inject a mock dice engine to test the dice rolling.
 * 
 * @param quench 
 */
export const shadowrunRolling = (quench: QuenchBatchContext) => {
    const {describe, it, assert, before, after, expect} = quench;

    describe('SR5Roll', () => {
        it('Amount of dice to bethrown in shadowrun style pool, excluding explosions', async () => {
            const roll = new SR5Roll('100d6');
            await roll.evaluate();
            
            assert.equal(roll.pool, 100);
            assert.equal(roll.poolThrown, 100);
        });

        it('Amount of dice thrown in shadowrun style pool, including explosions', async () => {
            const roll = new SR5Roll('100d6x6');
            await roll.evaluate();

            assert.equal(roll.pool, 100);
            // More often than not, this should result in at least one dice explosion... :-)
            expect(roll.poolThrown).to.be.greaterThan(100);
        });
    });
};