import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { MatrixOpposedTargetFlow } from 'src/module/tests/flows/MatrixOpposedTargetFlow';

export const shadowrunMatrixOpposedDeviceDialog = (context: QuenchBatchContext) => {
    const { describe, it } = context;
    const assert: Chai.AssertStatic = context.assert;

    describe('Matrix Opposed Device Dialog', () => {
        it('preserves compendium device data while applying dialog overrides', () => {
            const selection = {
                img: 'custom-device.png',
                name: 'Custom Device',
                category: 'device' as const,
                rating: 3,
                wireless: 'online' as const,
                description: 'Edited description',
                networkUuid: '',
                sourceData: {
                    name: 'Source Device',
                    img: 'source-device.png',
                    type: 'device',
                    system: {
                        category: 'cyberdeck',
                        technology: {
                            rating: 6,
                            availability: '3',
                            wireless: 'online',
                            quantity: 2,
                        },
                        description: {
                            value: 'Source description',
                            source: 'Compendium Source',
                        },
                        importFlags: {
                            sourceid: 'compendium-device',
                        },
                    },
                },
            };

            const data = MatrixOpposedTargetFlow.createTemporaryDeviceData(selection);
            const system = data.system!;

            assert.strictEqual(data.name, 'Custom Device');
            assert.strictEqual(data.img, 'custom-device.png');
            assert.strictEqual(data.type, 'device');
            assert.strictEqual(system.category, 'device');
            assert.strictEqual(system.technology?.rating, 3);
            assert.strictEqual(system.technology?.wireless, 'online');
            assert.strictEqual(system.technology?.availability, '3');
            assert.strictEqual(system.description?.value, 'Edited description');
            assert.strictEqual(system.description?.source, 'Compendium Source');
            assert.strictEqual(system.importFlags?.sourceid, 'compendium-device');
        });
    });
};
