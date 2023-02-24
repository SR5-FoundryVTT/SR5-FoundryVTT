import { PhysicalDefenseTest } from './../../tests/PhysicalDefenseTest';
import { SR5Actor } from './../../actor/SR5Actor';
import { SituationalModifierApplyOptions, SituationModifier } from './SituationModifier';

/**
 * Defense modifier differs based on situational selection while defending.
 * 
 * Actor can provide different values based for general defense, 'parry' and others.
 */
export class DefenseModifier extends SituationModifier {
    /**
     * Defense modifier is a legacy modifier but can differ based set actor modifiers
     */
    static get hasSourceData() {
        return false;
    }

    /**
     * Depending on the test context additional defense modifiers might apply
     * 
     */
    _calcActiveTotal(options:SituationalModifierApplyOptions): number {
        if (!this.modifiers || !this.modifiers.documentIsActor) return 0;
        
        const actor = this.modifiers.document as SR5Actor;
        if (!options.test || options.test.type !== 'PhysicalDefenseTest') return Number(actor.system.modifiers.defense);

        const test = options.test as PhysicalDefenseTest;

        switch (test.data.activeDefense) {
            case 'dodge': return Number(actor.system.modifiers.defense) + actor.modifiers.totalFor('defense_dodge');
            case 'block': return Number(actor.system.modifiers.defense) + actor.modifiers.totalFor('defense_block');
            case 'parry': return Number(actor.system.modifiers.defense) + actor.modifiers.totalFor('defense_parry');
            default: return Number(actor.system.modifiers.defense);
        }
    }
}