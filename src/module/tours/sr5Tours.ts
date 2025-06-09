import { SR5Actor } from "../actor/SR5Actor";
const { DOCUMENT_OWNERSHIP_LEVELS } = foundry.CONST;

export default class Sr5Tour extends foundry.nue.Tour {
    //the tab for the tour
    tab?: String

    //this field is only for internal handling
    actor?: SR5Actor;

    override async _preStep() {
        await super._preStep();

        //create actor if needed
        if(this.actor == undefined) {
            this.actor = new SR5Actor({
                name: "Tour " + this.id,
                type: 'character',
                ownership: {
                    default: DOCUMENT_OWNERSHIP_LEVELS.OWNER
                }
            });
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
