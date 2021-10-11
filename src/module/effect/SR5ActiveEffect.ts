import {SR5Actor} from "../actor/SR5Actor";
import {Helpers} from "../helpers";
import ModifiableValue = Shadowrun.ModifiableValue;
import {EffectChangeData} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/effectChangeData";

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
        if (!this.data.origin) return false;
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

    protected _applyCustom(actor: SR5Actor, change: EffectChangeData) {
        return this._applyModify(actor, change);
    }

    /**
     * Apply a modification to a ModifiableValue.
     * Both direct key matches to the whole value and indirect matches to a value property are supported.
     *
     * @protected
     */
    protected _applyModify(actor: SR5Actor, change: EffectChangeData) {
        // Check direct key.
        if (this._isKeyModifiableValue(actor, change.key)) {
            // @ts-ignore // TODO: foundry-vtt-types 0.8
            const value = foundry.utils.getProperty(actor.data, change.key) as ModifiableValue;
            value.mod.push({name: this.data.label, value: Number(change.value)});

            return null;
        }

        // Check indirect key.
        const nodes = change.key.split('.');
        nodes.pop();
        const indirectKey = nodes.join('.');

        // Don't apply any changes if it's also not a indirect match.
        if (this._isKeyModifiableValue(actor, indirectKey)) {
            // @ts-ignore // TODO: foundry-vtt-types 0.8
            const value = foundry.utils.getProperty(actor.data, indirectKey) as ModifiableValue;
            value.mod.push({name: this.data.label, value: Number(change.value)});

            return null;
        }

        // If both indirect or direct didn't provide a match, assume the user want's to add to whatever value choosen
        return super._applyAdd(actor, change);
    }

    /**
     * Overriding can be tricky if the overwritten value is a ModifiableValue with derived values.
     *
     * To keep the ActiveEffect workflow simple and still allow to override values that aren't a ModifiableValue,
     * check for such values and give the ActorDataPreparation flow some hints.
     *
     * @protected
     */
    protected _applyOverride(actor: SR5Actor, change: EffectChangeData) {
        // Check direct key.
        if (this._isKeyModifiableValue(actor, change.key)) {
            // @ts-ignore // TODO: foundry-vtt-types 0.8
            const value = foundry.utils.getProperty(actor.data, change.key);
            value.override = {name: this.data.label, value: Number(change.value)};
            value.value = change.value;

            return null;
        }

        // Check indirect key.
        const nodes = change.key.split('.');
        nodes.pop();
        const indirectKey = nodes.join('.');

        // @ts-ignore // TODO: foundry-vtt-types 0.8
        if (this._isKeyModifiableValue(actor, indirectKey)) {
            // @ts-ignore // TODO: foundry-vtt-types 0.8
            const value = foundry.utils.getProperty(actor.data, indirectKey);
            value.override = {name: this.data.label, value: Number(change.value)};

            return null;
        }

        // Neither a direct nor an indirect ModifiableValue match.
        return super._applyOverride(actor, change);
    }

    _isKeyModifiableValue(actor: SR5Actor, key: string): boolean {
        // @ts-ignore // TODO: foundry-vtt-types 0.8
        const possibleValue = foundry.utils.getProperty(actor.data, key);
        // @ts-ignore // TODO: foundry-vtt-types 0.8
        const possibleValueType = foundry.utils.getType(possibleValue);

        return possibleValue && possibleValueType === 'Object' && Helpers.objectHasKeys(possibleValue, this.minValueKeys);
    }

    get minValueKeys(): string[] {
        // Match against these keys, as the exact ModifiableValue layout might be different from time to time.
        return ['value', 'mod'];
    }
}