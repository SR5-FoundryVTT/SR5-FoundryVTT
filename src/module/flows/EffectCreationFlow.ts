import { SkillNamingFlow } from './SkillNamingFlow';
import { SR5Actor } from '../actor/SR5Actor';
import { SR5Item } from '../item/SR5Item';

/**
 * Handle everything around creating effects from different sources.
 */
export const EffectCreationFlow = {
    /**
     * Create A skill effect on an actor based on a skill item.
     * @param actor 
     * @param category 
     * @param subCategory 
     * @param skillId 
     * @returns 
     */
    skill: async (actor: SR5Actor, skillId: string) => {
        const skillField = actor.getSkillById(skillId);
        const skill = actor.items.get(skillId)! as SR5Item<'skill'>;
        if (!skillField || !skill) return;

        const key = SkillNamingFlow.nameToKey(skillField.name);
        const category = skill.system.skill.category;
        const subCategory = skill.system.skill.knowledgeType;

        let path = '';
        switch (category) {
            case 'knowledge':
                path = `system.skills.knowledge.${subCategory}.${key}`;
                break;
            case 'language':
                path = `system.skills.language.${key}`;
                break;
            case 'active':
            default:
                path = `system.skills.active.${key}`;
                break;
        }

        const effectData = {
            name: `${skillField.label} ${game.i18n.localize('SR5.Effect')}`,
            system: {
                applyTo: 'actor' as const,
            },
            changes: [
                {
                    key: path,
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    priority: 0,
                    value: '',
                }
            ]
        };

        await actor.createEmbeddedDocuments("ActiveEffect", [effectData], { renderSheet: true });
    }
}