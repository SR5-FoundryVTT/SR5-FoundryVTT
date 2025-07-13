import { SR5Actor } from '../actor/SR5Actor';

// @ts-expect-error fall back for old versions, tour is any, which is pretty bad
const tour = foundry?.nue?.Tour ?? Tour;
export default class Sr5Tour extends tour {
    //the type of actor that should be created for the tour
    actorType: string;
    tab?: string;

    //this field is only for internal handling
    actor?: SR5Actor;

    /** @override */
    async _preStep() {
        await super._preStep();

        //create actor if needed
        if (!this.actor) {
            this.actor = new SR5Actor.implementation({
                name: 'Tour ' + this.id,
                type: this.config.actorType,
                ownership: {
                    default: 3,
                },
            }) as SR5Actor;
        }

        // @ts-expect-error render problematic
        await this.actor.sheet?._render(true, { editable: false });

        if (this.config.tab) {
            // @ts-expect-error activateTab problematic
            this.actor?.sheet?.activateTab(this.config.tab);
        }
    }

    /** @override */
    async complete() {
        await this.actor?.sheet?.close();
        return super.complete();
    }
}
