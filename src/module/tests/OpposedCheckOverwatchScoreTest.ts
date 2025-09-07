import { MatrixRules } from '@/module/rules/MatrixRules';
import { CheckOverwatchScoreTest } from '@/module/tests/CheckOverwatchScoreTest';
import { Translation } from '@/module/utils/strings';
import { OpposedMatrixTest } from '@/module/tests/OpposedMatrixTest';

/**
 * Implement the opposing test for Check Overwatch Score, pg238
 */
export class OpposedCheckOverwatchScoreTest extends OpposedMatrixTest {
    declare against: CheckOverwatchScoreTest;

    overwatchScore: number | undefined;

    override prepareBaseValues() {
        super.prepareBaseValues();
        // pool for the opposing test is always a fixed value
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
}
