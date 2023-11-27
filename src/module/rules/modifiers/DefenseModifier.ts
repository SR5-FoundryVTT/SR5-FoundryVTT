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
    static override get hasSourceData() {
        return false;
    }

    /**
     * Depending on the test context additional defense modifiers might apply
     * 
     */
    override _calcActiveTotal(options:SituationalModifierApplyOptions): number {
        if (!this.modifiers || !this.modifiers.documentIsActor) return 0;
        
        const actor = this.modifiers.document as SR5Actor;
        if (!options.test || options.test.type !== 'PhysicalDefenseTest') return Number(actor.system.modifiers.defense);

        const test = options.test as PhysicalDefenseTest;

        let defense = Number(actor.system.modifiers.defense);

        switch (test.data.activeDefense) {
            case 'dodge': defense += actor.modifiers.totalFor('defense_dodge'); break;
            case 'block': defense += actor.modifiers.totalFor('defense_block'); break;
            case 'parry': defense += actor.modifiers.totalFor('defense_parry'); break;
        }

        // Based on opposed weapon category, add appropriate defense modifier.
        if (test.against.item?.isRangedWeapon) defense += actor.modifiers.totalFor('defense_ranged');
        if (test.against.item?.isMeleeWeapon) defense += actor.modifiers.totalFor('defense_melee');

        return defense;
    }
}