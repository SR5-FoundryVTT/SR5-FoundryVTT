import {SR} from "../constants";

export class CombatRules {
    static iniOrderCanDoAnotherPass(scores: number[]): boolean {
        for (const score of scores) {
            if (CombatRules.iniScoreCanDoAnotherPass(score)) return true;
        }
        return false;
    }
    /**
     * Check if there is another initiative pass possible with the given score.
     * @param score
     * @return true means another initiative pass is possible
     */
    static iniScoreCanDoAnotherPass(score: number): boolean {
        return CombatRules.reduceIniResultAfterPass(score) > 0;
    }
    /**
     * Reduce the given initiative score according to @PDF SR5#159
     * @param score This given score can't be reduced under zero.
     */
    static reduceIniResultAfterPass(score: number): number {
        return Math.max(score + SR.combat.INI_RESULT_MOD_AFTER_INI_PASS, 0);
    }

    /**
     * Reduce the initiative score according to the current initiative pass @PDF SR5#160.
     * @param score
     * @param pass The current initiative pass. Each combat round starts at the initiative pass of 1.
     */
    static reduceIniOnLateSpawn(score: number, pass: number): number {
        // Assure valid score ranges.
        // Shift initiative pass value range from min 1 to min 0 for multiplication.
        pass = Math.max(pass - 1, 0);
        score = Math.max(score, 0);

        // Reduce the new score according to. NOTE: Modifier is negative
        const reducedScore = score + pass * SR.combat.INI_RESULT_MOD_AFTER_INI_PASS;
        return Math.max(reducedScore, 0);
    }
}