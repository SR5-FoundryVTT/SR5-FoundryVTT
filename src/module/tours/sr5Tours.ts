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
            let availableActors = game.actors.filter(actor => actor.type.includes(actorType) && Object.values(actor.apps).filter(app => app?.rendered).length == 0);
            
            this.actor = availableActors[0]
            // @ts-expect-error
            await availableActors[0].sheet?._render(true)
        }
    }

    /** @override */
    get canStart() {
        // @ts-expect-error
        let actorType = this.config.actorType
        if (actorType) {
            // @ts-expect-error
            return game.actors.filter(actor => actor.type.includes(actorType) && Object.values(actor.apps).filter(app => app?.rendered).length == 0).length > 0;
        }

        return true;
    }

    /** @override */
    async complete() {
         // @ts-expect-error
        if (this.config.actorType) {
            // for some reason the sheet does not update after the tour anymore
            // so we open an unopend one and close it after the tour
            this.actor?.sheet?.close()
        }
        return super.complete()
      }
}
