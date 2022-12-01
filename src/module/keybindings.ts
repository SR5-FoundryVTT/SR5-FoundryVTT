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
        onUp: () => SituationModifiersApplication.openForKeybinding(),
    });

    game.keybindings.register("shadowrun5e", "show-overwatch-tracker-app", {
        name: "SR5.Keybinding.OverwatchScoreTracker.Label",
        hint: "SR5.Keybinding.OverwatchScoreTracker.Hint",
        editable: [{ key: "KeyO", modifiers: [] }],
        onUp: () => new OverwatchScoreTracker().render(true),
    });
}