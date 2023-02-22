import { RangedAttackTest } from './../../tests/RangedAttackTest';
import { FireModeRules } from './../FireModeRules';
import { SR5Actor } from './../../actor/SR5Actor';
import { SituationalModifierApplyOptions, SituationModifier } from './SituationModifier';

/**
 * Calculate the situational recoil modifier, see SR5#175 'Recoil' and 'Progressive Recoil'
 * 
 * NOTE: This is actor local modifier type that doesn't have a scene wide equivalent for all scene tokens.
 */
export class RecoilModifier extends SituationModifier  {
    /**
     * Recoil modifiers don't allow for any selection.
     */
    static get hasSourceData() {
        return false;
    }

    _calcActiveTotal(options: SituationalModifierApplyOptions): number {
        if (!this.modifiers || !this.modifiers.documentIsActor) return 0;

        if (!options.test || options.test.type !== 'RangedAttackTest') return (this.modifiers.document as SR5Actor)?.recoil ?? 0;

        // A recoil modifier in test context.
        const rangedAttack = options.test as RangedAttackTest;
        const testActor = options.test.actor;
        const testItem = options.test.item;
        const fireMode = rangedAttack.data.fireMode;
        if (!testActor || !testItem) {
            console.error(`Shadowrun 5e | ${this.constructor.name} calculated the recoil modifier within context of a ${options.test.constructor.name} which lacked either an actor or item document`, this, options.test);
            return 0;
        }

        return FireModeRules.recoilModifierAfterAttack(fireMode, testItem.totalRecoilCompensation, testActor.recoil, testItem.ammoLeft);
    }
}