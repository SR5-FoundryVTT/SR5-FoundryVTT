import { SR5TestFactory } from "./utils";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";

export const shadowrunMatrixFlow = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { factory.destroy(); });

    describe('MatrixFlow testing', () => {
        it('should reboot device and trigger all resulting effects', async () => {
            
        });
        it('should apply dumpshock damage only when using vr', async () => {});
        it('should apply dumpshock damage for cold sim', async () => {});
        it('should apply dumpshock damage for hot sim', async () => {});
    })
};
