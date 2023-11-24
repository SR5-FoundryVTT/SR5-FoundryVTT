import { SR5Actor } from "../actor/SR5Actor";

// @ts-expect-error
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

        //check if the tour actor already exists. This can happen when resuming the tour
        // @ts-expect-error
        this.actor = game.actors?.getName("Tour " + this.id);

        //create actor if needed
        if(this.actor == undefined) {
            this.actor = await Actor.create({
                //@ts-expect-error
                name: "Tour " + this.id,
                // @ts-expect-error
                type: this.config.actorType
            });
        }

        //@ts-expect-error Calling _render because it's async unlike render
        await this.actor.sheet?._render(true);

        // @ts-expect-error
        if(this.config.tab) {
            // @ts-expect-error
            this.actor?.sheet?.activateTab(this.config.tab)
        }
    }

    /** @override */
    async complete() {
        await this.actor?.sheet?.close()
        // @ts-expect-error
        await Actor.deleteDocuments([this.actor?.id]);

        return super.complete()
      }

    /** @override */
    get canStart() {
        // @ts-expect-error
        return game.user.can("ACTOR_CREATE");
    }
}
