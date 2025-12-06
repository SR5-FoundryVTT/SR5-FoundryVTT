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
     *
     * @param packageConfig - The configuration array for the autocomplete-inline-properties module. 
     *     This array is mutated directly to replace its contents with the Shadowrun 5e system's configuration.  
     */
    aipSetupHook: (packageConfig: {packageName: string}[]) => {
        // These checks are more a precaution than necessary, as the event itself is module based.
        // This is only for the case of any other code executing this hook.
        const aipModule = game.modules.get("autocomplete-inline-properties");
        if (!aipModule) return;
        // @ts-expect-error AIP typing
        if (!aipModule?.API?.CONST) return;

        console.debug('Shadowrun 5e | Registering support for autocomplete-inline-properties');

        // @ts-expect-error AIP typing
        const DATA_MODE = aipModule.API.CONST.DATA_MODE;

        const config = {
            packageName: "shadowrun5e",
            sheetClasses: [{
                name: SR5ActiveEffectConfig.name,
                fieldConfigs: [
                    { selector: `.tab[data-tab="changes"] .autocomplete-key-actor input[type="text"]`, defaultPath: "system", showButton: true, allowHotkey: true, dataMode: DATA_MODE.OWNING_ACTOR_DATA },
                    { selector: `.tab[data-tab="changes"] .autocomplete-key-targeted_actor input[type="text"]`, defaultPath: "system", showButton: true, allowHotkey: true, dataMode: DATA_MODE.OWNING_ACTOR_DATA },
                    { selector: `.tab[data-tab="changes"] .autocomplete-key-test_all input[type="text"]`, defaultPath: "", showButton: true, allowHotkey: true, dataMode: DATA_MODE.CUSTOM, customDataGetter: AutocompleteInlineHooksFlow.keyGetterTestData},
                    { selector: `.tab[data-tab="changes"] .autocomplete-key-test_item input[type="text"]`, defaultPath: "", showButton: true, allowHotkey: true, dataMode: DATA_MODE.CUSTOM, customDataGetter: AutocompleteInlineHooksFlow.keyGetterTestData},
                    { selector: `.tab[data-tab="changes"] .autocomplete-key-modifier input[type="text"]`, defaultPath: "", showButton: true, allowHotkey: true, dataMode: DATA_MODE.CUSTOM, customDataGetter: AutocompleteInlineHooksFlow.keyGetterModifiersData},

                    { selector: `.tab[data-tab="changes"] .autocomplete-value-actor input[type="text"]`, defaultPath: "system", inlinePrefix: "@", showButton: true, allowHotkey: true, dataMode: DATA_MODE.CUSTOM, customDataGetter: AutocompleteInlineHooksFlow.valueGetterActor},
                    { selector: `.tab[data-tab="changes"] .autocomplete-value-targeted_actor input[type="text"]`, defaultPath: "", inlinePrefix: "@", showButton: true, allowHotkey: true, dataMode: DATA_MODE.CUSTOM, customDataGetter: AutocompleteInlineHooksFlow.valueGetterTargetedActorData},
                    { selector: `.tab[data-tab="changes"] .autocomplete-value-test_all input[type="text"]`, defaultPath: "system", inlinePrefix: "@", showButton: true, allowHotkey: true, dataMode: DATA_MODE.CUSTOM, customDataGetter: AutocompleteInlineHooksFlow.valueGetterTestData},
                    { selector: `.tab[data-tab="changes"] .autocomplete-value-test_item input[type="text"]`, defaultPath: "system", inlinePrefix: "@", showButton: true, allowHotkey: true, dataMode: DATA_MODE.CUSTOM, customDataGetter: AutocompleteInlineHooksFlow.valueGetterTestData},
                ]
            }]
        };

        // NOTE: AIP 3.1.0 has issues with 'core' fieldConfig overwriting custom fieldConfigs. Replace all configs with ours, works.
        // Other fieldConfigs are 'core' and built-in systems, which we don't need, as we custom map all our fields for AIP.
        // This shoud be revisited, however it also shouldn't matter, as we don't rely on the core fieldConfig anyway.
        // - See their GitHub issue #748
        // - Our GitHub issue #1684
        // Remove only 'core' configs, then prepend ours for higher priority.
        for (let i = packageConfig.length - 1; i >= 0; i--) {  
            if (packageConfig[i].packageName === 'core') {  
                packageConfig.splice(i, 1);  
            }  
        }  
        packageConfig.unshift(config);  

        console.debug('Shadowrun 5e | Registered support for autocomplete-inline-properties', packageConfig);
    },

    /**
     * Getter to show values for apply-to actor.
     * 
     * @param EffectConfig The effect config supplying the effect context.
     * @returns Either a SR5Actor or SR5Item source object.
     */
    valueGetterActor: (EffectConfig: SR5ActiveEffectConfig) => {
        const effect = EffectConfig.document;
        if (!effect.parent) return {};
        return effect.parent?.toObject();
    },

    /**
     * Getter to show keys for apply-to test_all and test_item
     * 
     * @param EffectConfig The effect config supplying the effect context.
     * @returns A test object for the autocomplete module to use.
     */
    keyGetterTestData: (EffectConfig: SR5ActiveEffectConfig) => {
        const effect = EffectConfig.document;
        const testsId = effect.system.selection_tests.map(test => test.id);

        // For  effects targeting specific tests, we can provide a merge of all tests data.
        if (testsId.length > 0) {
            const actor = effect.actor;
            const testData = {};
            for (const TestClassName of testsId) {
                if (!TestClassName) return {};
                const TestClass = TestCreator._getTestClass(TestClassName);
                if (!TestClass) return {};
                const test = new TestClass({}, {actor});
                foundry.utils.mergeObject(testData, test.data);
            }
            return {data: testData};
        }
        
        // For actor effects, we can't determine the test type.
        if (effect.isActorOwned) {
            return {data: new SuccessTest({}).data};
        }
        
        // For item effects, we can determine the test type.
        if (effect.isItemOwned) {
            const item = effect.parent as SR5Item;
            const action = item.getAction();
            if (!action) return {};                
            const SuccessTestClass = TestCreator._getTestClass(action.test) || SuccessTest;
            return {data: new SuccessTestClass({}, {actor: item.actor, item}).data};
        }

        return {};
    },

    /**
     * Getter to show values for apply-to test_all and test_item
     * 
     * @param EffectConfig 
     */
    valueGetterTestData: (EffectConfig: SR5ActiveEffectConfig) => {
        const effect = EffectConfig.document;
        if (!effect.parent) return {};

        // Autocomplete inline properties module doesn't support get-er properties.
        // For this reason we have to manually convert those nested objects we want provide.
        const values = effect.parent.toObject();
        
        if (effect.parent.parent) {
            values['actor'] = effect.parent.parent.toObject();
        }

        return values;
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
            ultrasound: '',
            thermographic_vision: ''
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
        const effect = EffectConfig.document;

        if (effect.parent instanceof SR5Item) {
            const item = effect.parent;
            const action = item.getAction();
            if (!action) return {};                
            const SuccessTestClass = TestCreator._getTestClass(action.test) || SuccessTest;
            const OpposedTestClass = TestCreator._getTestClass(action.opposed.test) || OpposedTest;
            const successTest = new SuccessTestClass({});
            const opposedTest = new OpposedTestClass({against: successTest.data}, {actor: item.actor, item});
            
            return {data: opposedTest.data};
        }
        return {};
    }
}
