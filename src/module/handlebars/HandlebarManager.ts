import { preloadHandlebarsTemplates } from './HandlebarTemplates';
import { registerRollAndLabelHelpers } from './RollAndLabelHelpers';
import { registerItemLineHelpers } from './ItemLineHelpers';
import { registerSkillLineHelpers } from './SkillLineHelpers';
import { registerAppHelpers } from "./AppHelpers";
import { registerBasicHelpers } from "./BasicHelpers";
import { registerActorHelpers } from './ActorHelpers';
import { registerModifierHelpers } from './ModifierHelpers';
import { registerLocalizationHelpers } from './LocalizationHelpers';

export class HandlebarManager {
    static async loadTemplates() {
        await preloadHandlebarsTemplates();
    }
    static registerHelpers(): void {
        registerBasicHelpers();
        registerRollAndLabelHelpers();
        registerItemLineHelpers();
        registerSkillLineHelpers();
        registerAppHelpers();
        registerActorHelpers();
        registerModifierHelpers();
        registerLocalizationHelpers();
    }
}
