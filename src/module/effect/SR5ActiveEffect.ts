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

    protected _applyAdd(actor: Actor, change: ActiveEffect.Change) {
        const {key, value} = change;
        // @ts-ignore
        const current = foundry.utils.getProperty(actor.data, key) ?? null;
        // @ts-ignore
        const ct = foundry.utils.getType(current);
        let update = null;

        // Handle different types of the current data
        switch (ct) {
            case "null":
                update = value;
                break;
            case "string":
                update = current + String(value);
                break;
            case "number":
                if (Number.isNumeric(value)) update = current + Number(value);
                break;
            case "Array":

                const nodes = key.split('.');
                const isModArray = nodes[nodes.length - 1] === 'mod';
                if (isModArray) {
                    const mod = {name: this.data.label, value: Number(value)};
                    update = current.concat([mod]);
                } else {
                    // @ts-ignore
                    const at = foundry.utils.getType(current[0]);
                    // @ts-ignore
                    if (!current.length || (foundry.utils.getType(value) === at)) update = current.concat([value]);
                }
        }
        if (update !== null) { // @ts-ignore
            foundry.utils.setProperty(actor.data, key, update);
        }
        return update;
    }
}