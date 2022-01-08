import {SR5BaseActorSheet} from "./SR5BaseActorSheet";


export class SR5CharacterSheet extends SR5BaseActorSheet {
    /**
     * Spirit actors will handle these item types specifically.
     *
     * All others will be collected within the gear tab.
     *
     * @returns An array of item types from the template.json Item section.
     */
    getHandledItemTypes(): string[] {
        let itemTypes = super.getHandledItemTypes();

        return [
            ...itemTypes,
            'critter_powers',
            'spells',
            'quality'
        ];
    }
}