import { SkillNamingFlow } from './SkillNamingFlow';
import { SR5Actor } from '../actor/SR5Actor';
import { SR5Item } from '../item/SR5Item';

/**
 * Handle everything around creating effects from different sources.
 */
export const EffectCreationFlow = {
    /**
     * Create A skill effect on an actor based on a skill item.
     * @param actor Actor to create effect on
     * @param skillId Skill item ID to create effect from
     */
    skill: async (actor: SR5Actor, skillId: string) => {
        const skillField = actor.getSkillById(skillId);
        const skill = actor.items.get(skillId)! as SR5Item<'skill'>;
        if (!skillField || !skill) return;

        const key = SkillNamingFlow.nameToKey(skillField.name);
        const category = skill.system.skill.category;
        const subCategory = skill.system.skill.knowledgeType;

        let path: string;
        if (category === 'knowledge') {
            path = `system.skills.knowledge.${subCategory}.${key}`;
        } else if (category === 'language') {
            path = `system.skills.language.${key}`;
        } else {
            path = `system.skills.active.${key}`;
        }

        const effectData = {
            name: `${skillField.label} ${game.i18n.localize('SR5.Effect')}`,
            system: {
                applyTo: 'actor' as const,
            },
            changes: [
                {
                    key: path,
                    type: 'add',
                    priority: 0,
                    value: '',
                }
            ]
        };

        await actor.createEmbeddedDocuments("ActiveEffect", [effectData], { renderSheet: true });
    }
}
