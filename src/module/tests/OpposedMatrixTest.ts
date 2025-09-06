import { SR5Actor } from "../actor/SR5Actor";
import { SR5Item } from "../item/SR5Item";
import { MatrixTestDataFlow } from "./flows/MatrixTestDataFlow";
import { MatrixTest, MatrixTestData, OpposedMatrixTestData } from './MatrixTest';
import { OpposedTest } from "./OpposedTest";
import { TestOptions } from "./SuccessTest";

/**
 * Basic Test for opposing Matrix Actions
 * - provides support for targeting matrix icons
 */
export class OpposedMatrixTest<T extends OpposedMatrixTestData = OpposedMatrixTestData> extends OpposedTest<T> {
    declare against: MatrixTest;
    declare icon: SR5Actor | SR5Item;
    declare device: SR5Item;
    declare persona: SR5Actor;

    override _prepareData(data: any, options?: TestOptions) {
        data = super._prepareData(data, options);
        return MatrixTestDataFlow._prepareOpposedData(data);
    }

    override async populateDocuments() {
        await MatrixTestDataFlow.populateOpposedDocuments(this);
    }

    static override async executeMessageAction(againstData: MatrixTestData, messageId: string, options: TestOptions): Promise<void> {
        await MatrixTestDataFlow.executeMessageAction(this, againstData, messageId, options);
    }
}
