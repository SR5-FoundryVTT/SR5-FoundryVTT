import { PartsList } from "@/module/parts/PartsList";
import { SR5 } from "../../../config";
import { SkillFieldType } from 'src/module/types/template/Skills';

export class SkillsPrep {

    private static prepareSkill(skill: SkillFieldType) {
        for (const bonus of skill.bonus) {
            skill.changes.push({
                priority: 0,
                unused: false,
                name: bonus.key,
                value: Number(bonus.value),
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            });
        }

        PartsList.calcTotal(skill, { min: 0 });
    }

    private static prepareActiveSkills(active: Actor['system']['skills']['active']) {
        for (const [skillKey, skillValue] of Object.entries(active)) {
            this.prepareSkill(skillValue);
            skillValue.label = SR5.activeSkills[skillKey];
        }
    }

    private static prepareLanguageSkills(language: Actor['system']['skills']['language']) {
        language.attribute = 'intuition';
        language.value = Object.fromEntries(
            Object.entries(language.value)
                .filter(([, skill]) => !skill._delete)
                .map(([id, skill]) => {
                    this.prepareSkill(skill);
                    skill.attribute = 'intuition';
                    return [id, skill];
                })
        );
    }

    private static prepareKnowledgeSkills(knowledge: Actor['system']['skills']['knowledge']) {
        for (const group of Object.values(knowledge)) {
            group.value = Object.fromEntries(
                Object.entries(group.value)
                    .filter(([, skill]) => !skill._delete)
                    .map(([id, skill]) => {
                        this.prepareSkill(skill);
                        skill.attribute = group.attribute;
                        return [id, skill];
                    })
            );
        }
    }

    /**
     * Prepare actor data for skills
     */
    static prepareSkills(system: Actor.SystemOfType<'character' | 'critter' | 'ic' | 'spirit' | 'sprite' | 'vehicle'>) {
        const { language, active, knowledge } = system.skills;

        this.prepareActiveSkills(active);
        this.prepareLanguageSkills(language);
        this.prepareKnowledgeSkills(knowledge);
    }
}
