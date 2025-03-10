import { SR5Actor } from "../actor/SR5Actor";

// @ts-expect-error TODO: foundry-vtt-types v10
export default class Sr5Tour extends Tour {
    //the type of actor that should be created for the tour
    actorType: string;

    //the tab for the tour
    tab?: string

    //this field is only for internal handling
    actor?: SR5Actor;

    /** @override */
    async _preStep() {
        await super._preStep();

        //create actor if needed
        if(this.actor === undefined) {
            this.actor = new SR5Actor.implementation({
                //@ts-expect-error TODO: foundry-vtt-types v10
                name: "Tour " + this.id,
                // @ts-expect-error TODO: foundry-vtt-types v10
                type: this.config.actorType,
                ownership: {
                    default: 3
                }
            }) as SR5Actor;
        }

        // @ts-expect-error TODO: foundry-vtt-types v10
        await this.actor.sheet?._render(true, {editable: false});

        // @ts-expect-error TODO: foundry-vtt-types v10
        if(this.config.tab) {
            // @ts-expect-error TODO: foundry-vtt-types v10
            this.actor?.sheet?.activateTab(this.config.tab)
        }
    }

    /** @override */
    async complete() {
        await this.actor?.sheet?.close()
        return super.complete()
      }
}
