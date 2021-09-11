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

    /**
     * Render the sheet of the active effect origin
     */
    public async renderOriginSheet() {
        const path = this.data.origin.split('.');

        if (path.length === 0) return;

        switch (path[0]) {
            case 'Actor':
                const actorId = path[1];
                const actor = game.actors.get(actorId);

                switch (path.length) {
                    case 2:
                        return actor.sheet.render(true);
                    case 4:
                        const itemId = path[3];
                        const item = actor.items.get(itemId);

                        return item.sheet.render(true);
                    default:
                        return console.error('The active effect origin does not adhere to an know case', this.data, this.data.origin);
                }

            case 'Scene':
                const sceneId = path[1];
                const tokenId = path[3];

                const scene = game.scenes.get(sceneId);
                // @ts-ignore // foundry-vtt-types 0.8
                const token = scene.tokens.get(tokenId);

                switch (path.length) {
                    case 4:
                        return token.actor.sheet.render(true);

                    case 6:
                        const itemId = path[5];
                        const item = token.actor.items.get(itemId);

                        return item.sheet.render(true);

                    default:
                        return console.error('The active effect origin does not adhere to an know case', this.data, this.data.origin);
                }
        }
    }

    update(data: ActiveEffect.Data, options?: Entity.UpdateOptions): Promise<ActiveEffect.Data> {
        if (this.isOriginOwned) {
            ui.notifications.error(game.i18n.localize('SR5.Error.CantEditAppliedItemEffects'))
        }

        return super.update(data, options);
    }
}