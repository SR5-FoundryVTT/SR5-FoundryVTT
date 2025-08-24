import { preloadHandlebarsTemplates } from './HandlebarTemplates';
import { registerRollAndLabelHelpers } from './RollAndLabelHelpers';
import { registerItemLineHelpers } from './ItemLineHelpers';
import { registerSkillLineHelpers } from './SkillLineHelpers';
import { registerAppHelpers } from "./AppHelpers";
import { registerBasicHelpers } from "./BasicHelpers";
import { registerActorHelpers } from './ActorHelpers';
import { registerValueHelpers } from './ValueHelpers';

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
        registerValueHelpers();
    }
}