import { SR5Actor } from "../../actor/SR5Actor";
import { SR5Item } from "../../item/SR5Item";
import { OpposedTest } from "../../tests/OpposedTest";
import { SuccessTest } from "../../tests/SuccessTest";
import { TestCreator } from "../../tests/TestCreator";
import { SR5ActiveEffectConfig } from "../SR5ActiveEffectConfig";

/**
 * Collection of functionality necessary for the autocomplete inline properties module
 * https://foundryvtt.com/packages/autocomplete-inline-properties/
 * 
 * All effect change key and value getters live here and should be added here for separation with the rest of the system.
 */
export const AutocompleteInlineHooksFlow =  {
    /**
     * Add support for https://github.com/schultzcole/FVTT-Autocomplete-Inline-Properties module
     * to give auto complete for active effect attribute keys.
     *
     * This is taken from: https://github.com/schultzcole/FVTT-Autocomplete-Inline-Properties/blob/master/CONTRIBUTING.md
     * It partially uses: https://github.com/schultzcole/FVTT-Autocomplete-Inline-Properties/blob/master/package-config.mjs#L141
     */
    setupHook: () => {
        // Module might not be installed.
        const aipModule = game.modules.get("autocomplete-inline-properties");
        if (!aipModule) return;
        // @ts-expect-error
        // API might be missing.
        const api = aipModule.API;
        if (!api) return;

        console.log('Shadowrun 5e | Registering support for autocomplete-inline-properties');
        const DATA_MODE = api.CONST.DATA_MODE;

        const config = {
            packageName: "shadowrun5e",
            sheetClasses: [{
                name: "ActiveEffectConfig",
                fieldConfigs: [
                    { selector: `.tab[data-tab="effects"] .key-actor input[type="text"]`, defaultPath: "system", showButton: true, allowHotkey: true, dataMode: DATA_MODE.OWNING_ACTOR_DATA },
                    { selector: `.tab[data-tab="effects"] .key-targeted_actor input[type="text"]`, defaultPath: "system", showButton: true, allowHotkey: true, dataMode: DATA_MODE.OWNING_ACTOR_DATA },
                    { selector: `.tab[data-tab="effects"] .key-test_all input[type="text"]`, defaultPath: "", showButton: true, allowHotkey: true, dataMode: DATA_MODE.CUSTOM, customDataGetter: AutocompleteInlineHooksFlow.keyGetterTestData},
                    { selector: `.tab[data-tab="effects"] .key-test_item input[type="text"]`, defaultPath: "", showButton: true, allowHotkey: true, dataMode: DATA_MODE.CUSTOM, customDataGetter: AutocompleteInlineHooksFlow.keyGetterTestData},
                    { selector: `.tab[data-tab="effects"] .key-modifier input[type="text"]`, defaultPath: "", showButton: true, allowHotkey: true, dataMode: DATA_MODE.CUSTOM, customDataGetter: AutocompleteInlineHooksFlow.keyGetterModifiersData},

                    { selector: `.tab[data-tab="effects"] .value-targeted_actor input[type="text"]`, defaultPath: "", inlinePrefix: "@", showButton: true, allowHotkey: true, dataMode: DATA_MODE.CUSTOM, customDataGetter: AutocompleteInlineHooksFlow.valueGetterTargetedActorData}
                ]
            }]
        };

        api.PACKAGE_CONFIG.push(config);
    },

    /**
     * Getter to show data for apply-to test_all and test_item
     * 
     * @param EffectConfig The effect config supplying the effect context.
     * @returns A test object for the autocomplete module to use.
     */
    keyGetterTestData: (EffectConfig: SR5ActiveEffectConfig) => {
        const effect = EffectConfig.object;
        
        if (effect.parent instanceof SR5Actor) {
            const test = new SuccessTest({});
            return test;
        }
        
        if (effect.parent instanceof SR5Item) {
            const item = effect.parent as SR5Item;
            const test = TestCreator.fromItem(item);
            return test;
        }
    },

    /**
     * Getter to show data for apply-to modifier.
     * 
     * Modifier effects don't apply directly to data but allow the system to use keys to determine what rules
     * apply at any point in the system.
     * 
     * environmental is applied during calculation of situational modifiers.
     * Others might be applied where ever.
     * 
     * @param EffectConfig The effect config supplying the effect context.
     * @returns A simple object for autocomplete module to use.
     */
    keyGetterModifiersData: (EffectConfig: SR5ActiveEffectConfig) => {
        return {environmental: {
            low_light_vision: '',
            image_magnification: '',
            tracer_rounds: '',
            smartlink: '',
            ultrasound: ''
        }}
    },

    /**
     * Getter to show as many fields available as possible as closely matching the parent item of the effect.
     * 
     * When apply-to targeted Actor is used, the values can access all values in relation of the opposed test.
     * Effects for targeted actors are applied from within the opposed actor context.
     * 
     * @param EffectConfig The effect config supplying the effect context.
     * @returns A opposed test instance for autocomplete module to use.
     */
    valueGetterTargetedActorData: (EffectConfig: SR5ActiveEffectConfig) => {
        const effect = EffectConfig.object;

        if (effect.parent instanceof SR5Item) {
            const item = effect.parent as SR5Item;
            const action = item.getAction();
            if (!action) return {};                
            const SuccessTestClass = TestCreator._getTestClass(action.test) || SuccessTest;
            const OpposedTestClass = TestCreator._getTestClass(action.opposed.test) || OpposedTest;
            const successTest = new SuccessTestClass({});
            const opposedTest = new OpposedTestClass({against: successTest.data}, {actor: item.actor, item});
            
            return opposedTest;
        }
    }
}