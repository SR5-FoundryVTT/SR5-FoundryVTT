import { SR5Actor } from "../actor/SR5Actor";

export default class Sr5Tour extends Tour {
    //the type of actor that should be created for the tour
    actorType: String;

    //the tab for the tour
    tab?: String

    //this field is only for internal handling
    actor?: SR5Actor;

    /** @override */
    async _preStep() {
        await super._preStep();

        //create actor if needed
        if(this.actor == undefined) {
            this.actor = new SR5Actor.implementation({
                name: "Tour " + this.id,
                type: this.config.actorType,
                ownership: {
                    default: 3
                }
            }) as SR5Actor;
        }

        // @ts-expect-error
        await this.actor.sheet?._render(true, {editable: false});

        // @ts-expect-error
        if(this.config.tab) {
            // @ts-expect-error
            this.actor?.sheet?.activateTab(this.config.tab)
        }
    }

    override async complete() {
        await this.actor?.sheet?.close()
        return super.complete()
    }
}
