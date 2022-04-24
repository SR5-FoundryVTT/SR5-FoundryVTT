import {SuccessTest, SuccessTestData, TestDocuments, TestOptions} from "./SuccessTest";
import {OpposedTest, OpposedTestData} from "./OpposedTest";
import {SR5Actor} from "../actor/SR5Actor";

export interface PhysicalResistTestData extends SuccessTestData {
    resisting: OpposedTestData
}

export class PhysicalResistTest extends SuccessTest {
    public resisting: OpposedTest

    constructor(data, documents?: TestDocuments, options?: TestOptions) {
        super(data, documents, options);
    }

    static async getResistActionTestData(testData, actor: SR5Actor, previousMessageId: string) {
        const data = await this._getDefaultActionTestData(actor);
        data.previousMessageId = previousMessageId;
        data.resisting = testData;
        return data;
    }

    async populateTests() {
        // this.resisting =
    }
}