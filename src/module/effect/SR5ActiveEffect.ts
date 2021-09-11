import {SR5Actor} from "../actor/SR5Actor";
import {SR5Item} from "../item/SR5Item";

export class SR5ActiveEffect extends ActiveEffect {
    /**
     * Can be used to determine if the origin of the effect is an document that is owned by another document.
     *
     * A use case would be to check if the effect is applied by an actor owned item.
     *
     * The current approach is a bit simple, due to the limited effect use. Should there be a time of effects applied to
     * items, this would need change.
     */
    public get isOriginOwned(): boolean {
        const path = this.data.origin.split('.');

        if (path[0] === 'Scene' && path.length === 6) return true;
        if (path[0] === 'Actor' && path.length === 4) return true;

        return false;
    }

    public get source(): Promise<Document> {
        // @ts-ignore // TODO: foundry-vtt-types 0.8
        return fromUuid(this.data.origin);
    }

    /**
     * Render the sheet of the active effect source
     */
    public async renderSourceSheet() {
        const document = await this.source;
        // @ts-ignore
        return document?.sheet?.render(true);
    }

    async toggleDisabled() {
        // @ts-ignore
        return this.update({disabled: !this.data.disabled});
    }

    async disable(disabled) {
        // @ts-ignore
        return this.update({disabled});
    }
}