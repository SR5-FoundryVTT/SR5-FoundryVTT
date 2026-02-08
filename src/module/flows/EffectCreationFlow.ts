import { SkillFlow } from '../actor/flows/SkillFlow';
import { SR5Actor } from '../actor/SR5Actor';

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
        const skill = actor.items.get(skillId)!;
        if (!skill || !skill.isType('skill') || skill.system.type !== 'skill') return;

        const key = SkillFlow.nameToKey(skill.name);
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
            name: `${SkillFlow.localizeSkillName(skill.name)} ${game.i18n.localize('SR5.Effect')}`,
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