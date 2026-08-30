import {SituationModifiersApplication} from './apps/SituationModifiersApplication';
import {OverwatchScoreTracker} from './apps/gmtools/OverwatchScoreTracker';

/**
 * All systems keybindings should be registered here.
 * 
 * This function is meant to be called during system setup.
 */
export const registerSystemKeybindings = () => {
    game.keybindings.register("shadowrun5e", "show-situation-modifier-app", {
        name: "SR5.Keybindings.ShowSituationModifiers.Label",
        hint: "SR5.Keybindings.ShowSituationModifiers.Hint",
        editable: [{ key: "KeyM", modifiers: [] }],
        onDown: () => { SituationModifiersApplication.open(); },
    });

    game.keybindings.register("shadowrun5e", "success-test-prompt", {
        name: "SR5.Keybindings.SuccessTestPrompt.Label",
        hint: "SR5.Keybindings.SuccessTestPrompt.Hint",
        editable: [{ key: "KeyZ", modifiers: [] }],
        onDown: () => { game.shadowrun5e.test.promptSuccessTest(); }
    });

    game.keybindings.register("shadowrun5e", "show-overwatch-tracker-app", {
        name: "SR5.Keybindings.OverwatchScoreTracker.Label",
        hint: "SR5.Keybindings.OverwatchScoreTracker.Hint",
        editable: [{ key: "KeyO", modifiers: [] }],
        onDown: () => { OverwatchScoreTracker.open(); },
    });

    game.keybindings.register("shadowrun5e", "hide-test-dialog", {
        name: game.i18n.localize("SR5.Keybindings.HideTestDialog.Label"),
        hint: game.i18n.localize("SR5.Keybindings.HideTestDialog.Hint"),
        editable: [{key: "shiftKey"}]
    });

    game.keybindings.register("shadowrun5e", "show-item-card", {
        name: game.i18n.localize("SR5.Keybindings.ShowItemCard.Label"),
        hint: game.i18n.localize("SR5.Keybindings.ShowItemCard.Hint"),
        editable: [{key: "ctrlKey"}]
    });

    game.keybindings.register("shadowrun5e", "add-remove-some-qty", {
        name: game.i18n.localize("SR5.Keybindings.AddRemoveSomeQty.Label"),
        hint: game.i18n.localize("SR5.Keybindings.AddRemoveSomeQty.Hint"),
        editable: [{key: "shiftKey"}]
    });

    game.keybindings.register("shadowrun5e", "add-remove-many-qty", {
        name: game.i18n.localize("SR5.Keybindings.AddRemoveManyQty.Label"),
        hint: game.i18n.localize("SR5.Keybindings.AddRemoveManyQty.Hint"),
        editable: [{key: "ctrlKey"}]
    });
}
