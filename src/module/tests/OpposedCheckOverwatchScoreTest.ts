import { SR5Actor } from "../actor/SR5Actor";
import { SR5Item } from "../item/SR5Item";
import { MatrixTestDataFlow } from "./flows/MatrixTestDataFlow";
import { MatrixTestData, OpposedMatrixTestData } from './MatrixTest';
import { OpposedTest } from "./OpposedTest";
import { TestOptions } from "./SuccessTest";
import { MatrixRules } from '@/module/rules/MatrixRules';
import { CheckOverwatchScoreTest } from '@/module/tests/CheckOverwatchScoreTest';
import { Translation } from '@/module/utils/strings';

/**
 * Implement the opposing test for Check Overwatch Score, pg
 */
export class OpposedCheckOverwatchScoreTest extends OpposedTest<OpposedMatrixTestData> {
    declare against: CheckOverwatchScoreTest;
    declare icon: SR5Actor | SR5Item;
    declare device: SR5Item;
    declare persona: SR5Actor;

    overwatchScore: number | undefined;

    override _prepareData(data: any, options?: TestOptions) {
        data = super._prepareData(data, options);
        return MatrixTestDataFlow._prepareOpposedData(data);
    }

    override async populateDocuments() {
        await MatrixTestDataFlow.populateOpposedDocuments(this);
    }

    override prepareBaseValues() {
        super.prepareBaseValues();
        this.data.pool = MatrixRules.checkOverwatchScoreOpposingDicePool();
        // get the overwatch score at the start so it isn't affected by the roll
        this.overwatchScore = this.against?.actor?.getOverwatchScore();
    }

    override get _chatMessageTemplate() {
        return 'systems/shadowrun5e/dist/templates/rolls/opposing-check-overwatch-score-message.hbs';
    }

    override get successLabel(): Translation {
        return "SR5.TestResults.CheckOverwatchScoreFailure";
    }

    override get failureLabel(): Translation {
        return "SR5.TestResults.CheckOverwatchScoreSuccess";
    }

    override async _prepareMessageTemplateData() {
        const data = await super._prepareMessageTemplateData();
        return {
            ...data,
            overwatchScore: this.overwatchScore
        }
    }

    static override async executeMessageAction(againstData: MatrixTestData, messageId: string, options: TestOptions): Promise<void> {
        await MatrixTestDataFlow.executeMessageAction(this, againstData, messageId, options);
    }
}
