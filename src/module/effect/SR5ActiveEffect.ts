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
        //@ts-expect-error // TODO: foundry-vtt-types v10
        if (!this.origin) return false;
        //@ts-expect-error // TODO: foundry-vtt-types v10
        const path = this.origin.split('.');

        if (path[0] === 'Scene' && path.length === 6) return true;
        if (path[0] === 'Actor' && path.length === 4) return true;

        return false;
    }

    public get source() {
        //@ts-expect-error // TODO: foundry-vtt-types v10
        return this.origin ? fromUuid(this.origin) : null;
    }

    /**
     * Render the sheet of the active effect source
     */
    public async renderSourceSheet() {
        const document = await this.source;
        // @ts-expect-error
        return document?.sheet?.render(true);
    }

    async toggleDisabled() {
        // @ts-expect-error
        return this.update({disabled: !this.disabled});
    }

    async disable(disabled) {
        return this.update({disabled});
    }

    //@ts-expect-error // TODO: foundry-vtt-types
    protected _applyCustom(actor: SR5Actor, change: EffectChangeData, current, delta, changes) {
        return this._applyModify(actor, change, current, delta, changes);
    }

    /**
     * Apply a modification to a ModifiableValue.
     * Both direct key matches to the whole value and indirect matches to a value property are supported.
     *
     * @protected
     */
    protected _applyModify(actor: SR5Actor, change: EffectChangeData, current, delta, changes) {
        // Check direct key.
        if (this._isKeyModifiableValue(actor, change.key)) {
            const value = foundry.utils.getProperty(actor, change.key) as ModifiableValue;
            //@ts-expect-error // TODO: foundry-vtt-types v10
            value.mod.push({name: this.label, value: Number(change.value)});

            return null;
        }

        // Check indirect key.
        const nodes = change.key.split('.');
        nodes.pop();
        const indirectKey = nodes.join('.');

        // Don't apply any changes if it's also not a indirect match.
        if (this._isKeyModifiableValue(actor, indirectKey)) {
            const value = foundry.utils.getProperty(actor, indirectKey) as ModifiableValue;
            //@ts-expect-error // TODO: foundry-vtt-types v10
            value.mod.push({name: this.label, value: Number(change.value)});

            return null;
        }

        // If both indirect or direct didn't provide a match, assume the user want's to add to whatever value chosen
        //@ts-expect-error // TODO: foundry-vtt-types
        return super._applyAdd(actor, change, current, delta, changes);
    }

    /**
     * Overriding can be tricky if the overwritten value is a ModifiableValue with derived values.
     *
     * To keep the ActiveEffect workflow simple and still allow to override values that aren't a ModifiableValue,
     * check for such values and give the ActorDataPreparation flow some hints.
     *
     * @protected
     */
    //@ts-expect-error // TODO: foundry-vtt-types
    protected _applyOverride(actor: SR5Actor, change: EffectChangeData, current, delta, changes) {
        // Check direct key.
        if (this._isKeyModifiableValue(actor, change.key)) {
            const value = foundry.utils.getProperty(actor, change.key);
            //@ts-expect-error // TODO: foundry-vtt-types v10
            value.override = {name: this.label, value: Number(change.value)};
            value.value = change.value;

            return null;
        }

        // Check indirect key.
        const nodes = change.key.split('.');
        nodes.pop();
        const indirectKey = nodes.join('.');

        if (this._isKeyModifiableValue(actor, indirectKey)) {
            const value = foundry.utils.getProperty(actor, indirectKey);
            //@ts-expect-error // TODO: foundry-vtt-types v10
            value.override = {name: this.label, value: Number(change.value)};

            return null;
        }

        // Neither a direct nor an indirect ModifiableValue match.
        //@ts-expect-error // TODO: foundry-vtt-types v10
        return super._applyOverride(actor, change, current, delta, changes);
    }

    _isKeyModifiableValue(actor: SR5Actor, key: string): boolean {
        const possibleValue = foundry.utils.getProperty(actor, key);
        const possibleValueType = foundry.utils.getType(possibleValue);

        return possibleValue && possibleValueType === 'Object' && Helpers.objectHasKeys(possibleValue, this.minValueKeys);
    }

    get minValueKeys(): string[] {
        // Match against these keys, as the exact ModifiableValue layout might be different from time to time.
        return ['value', 'mod'];
    }
}