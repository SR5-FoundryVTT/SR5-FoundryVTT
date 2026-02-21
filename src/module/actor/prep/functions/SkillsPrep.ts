import { Helpers } from '../../../helpers';
import { SkillFieldType } from 'src/module/types/template/Skills';

export class SkillsPrep {
    /**
     * Calculate skill ModifiableValue / SkillField totals.
     */
    static prepareSkills(system: Actor.SystemOfType<'character' | 'critter' | 'ic' | 'spirit' | 'sprite' | 'vehicle'>) {
        console.error("TODO: tam - prepareSkills has been reworked. Check if anything is missing.");
        const { language, active, knowledge } = system.skills;

        // function that will set the total of a skill correctly
        const prepareSkill = (skill: SkillFieldType) => {
            skill.value = Helpers.calcTotal(skill);
        };

        for (const skill of Object.values(active)) {
            prepareSkill(skill);
        }

        for (const skill of Object.values(language)) {
            prepareSkill(skill);
        }

        for (const skills of Object.values(knowledge)) {
            Object.values(skills).forEach(skill => prepareSkill(skill));
        }
    }
}
