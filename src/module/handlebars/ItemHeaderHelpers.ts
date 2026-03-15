
import { SR5 } from '../config';

export const registerItemHeaderHelpers = () => {
    /**
     * Return a data object to be injected into the addItem action.
     */
    Handlebars.registerHelper('callInActionHeaderAddData', (actorType: keyof typeof SR5.callInActorTypes) => {
        return { 'actor-type': actorType };
    });

    /**
     * Return a data object to be injected into the addItem action for skills.
     */
    Handlebars.registerHelper('skillAddItemData', (skillCategory: string, skillKnowledgeType: string, skillTypeOrOptions: string | Handlebars.HelperOptions) => {
        const skillType = typeof skillTypeOrOptions === 'string' ? skillTypeOrOptions : 'skill';

        return {
            'skill-category': skillCategory,
            'skill-knowledge-type': skillKnowledgeType,
            'skill-type': skillType,
        };
    });
};