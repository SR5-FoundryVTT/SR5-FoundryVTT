import {SR5BaseActorSheet} from "./SR5BaseActorSheet";


export class SR5SpriteActorSheet extends SR5BaseActorSheet {
    /**
     * Sprite actors will handle these item types specifically.
     *
     * All others will be collected within the gear tab.
     *
     * @returns An array of item types from the template.json Item section.
     */
    getHandledItemTypes(): string[] {
        let itemTypes = super.getHandledItemTypes();

        return [
            ...itemTypes,
            'sprite_power'
        ];
    }
}