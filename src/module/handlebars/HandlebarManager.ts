import { preloadHandlebarsTemplates } from './HandlebarTemplates';
import { registerBasicHelpers } from './BasicHelpers';
import { registerRollAndLabelHelpers } from './RollAndLabelHelpers';
import { registerItemLineHelpers } from './ItemLineHelpers';
import { registerSkillLineHelpers } from './SkillLineHelpers';

export class HandlebarManager {
    static async loadTemplates() {
        await preloadHandlebarsTemplates();
    }
    static registerHelpers(): void {
        registerBasicHelpers();
        registerRollAndLabelHelpers();
        registerItemLineHelpers();
        registerSkillLineHelpers();
    }
}