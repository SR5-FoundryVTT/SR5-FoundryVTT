import { SR5Actor } from "../actor/SR5Actor";

// @ts-expect-error
export default class Sr5Tour extends Tour {
    actorType?: String;
    actor?: SR5Actor;

    /** @override */
    async _preStep() {
        await super._preStep();

         // @ts-expect-error
        let actorType = this.config.actorType

        // If we need an actor, make it and render
        if (actorType) {
            //get an unopened actor
            // @ts-expect-error
            this.actor = game.actors?.getName("Tour " + this.id);

            //create actor if needed
            if(this.actor == undefined) {
                this.actor = await Actor.create({
                    //@ts-expect-error
                    name: "Tour " + this.id,
                    type: actorType
                });
            }

            //@ts-expect-error Calling _render because it's async unlike render
            await this.actor.sheet?._render(true);
        }
    }

    /** @override */
    async complete() {
         // @ts-expect-error
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
