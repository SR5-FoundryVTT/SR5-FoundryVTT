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
}