import {SuccessTest} from "./SuccessTest";
import {SR5Actor} from "../actor/SR5Actor";


export class PhysicalResistTest extends SuccessTest {
    static async fromTest(test: SuccessTest) {
        await test.populateDocuments();
        if (!test.actor) return console.error(`Shadowrun 5e | ${test.constructor.name} couldn't load it's documents.`);

        const data = this.getResistActionTestData(test, test.actor);
    }

    static async getResistActionTestData(test: SuccessTest, actor: SR5Actor)  {

    }
}