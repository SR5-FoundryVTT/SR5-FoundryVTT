import {SR5Actor} from "../actor/SR5Actor";
import ModifiableValue = Shadowrun.ModifiableValue;
import ModListEntry = Shadowrun.ModListEntry;
import ModList = Shadowrun.ModList;
import {Helpers} from "../helpers";

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

    protected _applyCustom(actor: SR5Actor, change: ActiveEffect.Change) {
        return this._applyModify(actor, change);
    }

    /**
     * Apply a modification to a ModifiableValue (has a .mod property).
     * @protected
     */
    protected _applyModify(actor: SR5Actor, change: ActiveEffect.Change) {
        const {key, value} = change;
        // @ts-ignore // TODO: foundry-vtt-types 0.8
        const current = foundry.utils.getProperty(actor.data, key) as ModList[] ?? null;
        // @ts-ignore // TODO: foundry-vtt-types 0.8
        const ct = foundry.utils.getType(current);
        const nodes = key.split('.');
        const isModArray = nodes[nodes.length - 1] === 'mod' && ct === 'Array';

        const update = isModArray ?
            current.concat([{name: this.data.label, value: Number(value)}]) :
            null; // Foundry expects null for un-applied active effects.

        // @ts-ignore
        if (update !== null) foundry.utils.setProperty(actor.data, key, update);
        else console.error(`${game.i18n.localize('SR5.Errors.KeyNotModifyableByActiveEffect')} Actor: [${actor.name}] and Effect Key: [${change.key}]`);

        return update;
    }

    /**
     * Keep the default foundry implementation for the ADD mode but hijack into a MODIFY mode in case of a ModifableValue
     * @protected
     */
    protected _applyAdd(actor: SR5Actor, change: ActiveEffect.Change) {
        const {key, value} = change;
        // @ts-ignore // TODO: foundry-vtt-types 0.8
        const current = foundry.utils.getProperty(actor.data, key) ?? null;
        // @ts-ignore // TODO: foundry-vtt-types 0.8
        const ct = foundry.utils.getType(current);

        const nodes = key.split('.');
        const isModArray = nodes[nodes.length - 1] === 'mod' && ct === 'Array';

        if (isModArray) {
            return this._applyModify(actor, change);
        } else {
            return super._applyAdd(actor, change);
        }
    }

    /**
     * Overriding can be tricky if the overwritten value is a ModifiableValue with derived values.
     *
     * To keep the ActiveEffect workflow simple and still allow to override values that aren't a ModifiableValue,
     * check for such values and give the ActorDataPreparation flow some hints.
     *
     * @protected
     */
    protected _applyOverride(actor: SR5Actor, change: ActiveEffect.Change) {
        // Match against these keys, as the exact ModifiableValue layout might be different from time to time.
        const minValueKeys = ['value', 'base', 'mod'];

        // Check direct key.
        if (this._isKeyModifiableValue(actor, change.key, minValueKeys)) {
            // @ts-ignore // TODO: foundry-vtt-types 0.8
            const value = foundry.utils.getProperty(actor.data, change.key);
            value.override = {name: this.data.label, value: Number(change.value)};
            value.value = change.value;

            // A direct match will override the whole value.
            return value;
        }

        // Check indirect key.
        const nodes = change.key.split('.');
        nodes.pop();
        const indirectKey = nodes.join('.');

        // @ts-ignore // TODO: foundry-vtt-types 0.8
        if (this._isKeyModifiableValue(actor, indirectKey, minValueKeys)) {
            // @ts-ignore // TODO: foundry-vtt-types 0.8
            const value = foundry.utils.getProperty(actor.data, indirectKey);
            value.override = {name: this.data.label, value: Number(change.value)};
        }

        // Neither a direct nor an indirect ModifiableValue match.
        return super._applyOverride(actor, change);
    }

    _isKeyModifiableValue(actor: SR5Actor, key: string, minValueKeys: string[]): boolean {
        // @ts-ignore // TODO: foundry-vtt-types 0.8
        const possibleValue = foundry.utils.getProperty(actor.data, key);
        // @ts-ignore // TODO: foundry-vtt-types 0.8
        const possibleValueType = foundry.utils.getType(possibleValue);

        return possibleValue && possibleValueType === 'Object' && Helpers.objectHasKeys(possibleValue, minValueKeys);
    }

}