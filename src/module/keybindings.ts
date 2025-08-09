import {SituationModifiersApplication} from './apps/SituationModifiersApplication';
import {OverwatchScoreTracker} from './apps/gmtools/OverwatchScoreTracker';

/**
 * All systems keybindings should be registered here.
 * 
 * This function is meant to be called during system setup.
 */
export const registerSystemKeybindings = () => {
    game.keybindings.register("shadowrun5e", "show-situation-modifier-app", {
        name: "SR5.Keybinding.ShowSituationModifiers.Label",
        hint: "SR5.Keybinding.ShowSituationModifiers.Hint",
        editable: [{ key: "KeyM", modifiers: [] }],
        onDown: () => { SituationModifiersApplication.openForKeybinding(); },
    });

    game.keybindings.register("shadowrun5e", "show-overwatch-tracker-app", {
        name: "SR5.Keybinding.OverwatchScoreTracker.Label",
        hint: "SR5.Keybinding.OverwatchScoreTracker.Hint",
        editable: [{ key: "KeyO", modifiers: [] }],
        onDown: () => { new OverwatchScoreTracker().render(true); },
    });

    game.keybindings.register("shadowrun5e", "hide-test-dialog", {
        name: game.i18n.localize("SR5.Keybinding.HideTestDialog.Label"),
        hint: game.i18n.localize("SR5.Keybinding.HideTestDialog.Hint"),
        editable: [{key: "shiftKey"}]
    });

    game.keybindings.register("shadowrun5e", "show-item-card", {
        name: game.i18n.localize("SR5.Keybinding.ShowItemCard.Label"),
        hint: game.i18n.localize("SR5.Keybinding.ShowItemCard.Hint"),
        editable: [{key: "ctrlKey"}]
    });
}