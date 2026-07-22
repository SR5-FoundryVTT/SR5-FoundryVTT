import { SR5 } from '../../../config';
import { SR } from '../../../constants';
import { SR5Actor } from '../../SR5Actor';
import { SR5Item } from 'src/module/item/SR5Item';
import { ModifiableValue } from '@/module/mods/ModifiableValue';
import { AttributeFieldType } from 'src/module/types/template/Attributes';

export class AttributesPrep {
    /**
     * Prepare actor data for attributes
     */
    /**
     * @param useSourceAnchor Anchor each attribute on its persisted `_source` value instead of the prepared
     *   `base` field. Opt-in because some actor types (IC, vehicle) deliberately overwrite `attribute.base`
     *   during preparation, where the prepared base - not the persisted one - is the intended anchor.
     */
    static prepareAttributes(
        system: SR5Actor['system'],
        ranges?: Record<string, {min: number, max?: number}>,
        preparedAttributes: ReadonlySet<string> = new Set(),
        useSourceAnchor = false
    ) {
        const {attributes} = system;

        // hide magic and resonance based on the actor's special property
        attributes.magic.hidden = system.special !== 'magic';
        attributes.resonance.hidden = system.special !== 'resonance';

        // always hide edge and essence, we display these separately
        attributes.edge.hidden = true;
        attributes.essence.hidden = true;

        // set the value for the attributes
        for (const [name, attribute] of Object.entries(attributes)) {
            if (preparedAttributes.has(name)) attribute.label = SR5.attributes[name];
            else AttributesPrep.prepareAttribute(name, attribute, ranges, useSourceAnchor ? system : undefined);

            if ('max' in attribute) {
                attribute.max = attribute.value;
            }
        }
    }

    /**
     * Prepare one single AttributeField
     * @param name The key field (and name) of the attribute given
     * @param attribute The AttributeField to prepare
     */
    static prepareAttribute(
        name: string,
        attribute: AttributeFieldType,
        ranges?: Record<string, {min: number, max?: number}>,
        sourceModel?: object
    ) {
        // Check for valid attributes. Active Effects can cause unexpected properties to appear.
        if (!Object.hasOwn(SR5.attributes, name) || !attribute) return;

        // Each attribute can have a unique value range.
        // TODO:  Implement metatype attribute value ranges for character actors.
        AttributesPrep.calculateAttribute(name, attribute, ranges, sourceModel);

        // add i18n labels.
        attribute.label = SR5.attributes[name];
    }

    /**
     * Calculate a single attributes value with all it's ranges and rules applied.
     *
     * @param name The attributes name / id
     * @param attribute The attribute will be modified in place
     */
    static calculateAttribute(
        name: string,
        attribute: AttributeFieldType,
        ranges?: Record<string, {min: number, max?: number}>,
        sourceModel?: object
    ) {
        // Check for valid attributes. Active Effects can cause unexpected properties to appear.
        if (!Object.hasOwn(SR5.attributes, name) || !attribute) return;

        // Each attribute can have a unique value range.
        // TODO:  Implement metatype attribute value ranges for character actors.
        const range = ranges ? ranges[name] : SR.attributes.ranges[name];

        // Anchor on the persisted `_source` value when available. Preparation never resets the model, so the
        // prepared `base` is not a reliable starting point; `_source` is the authored number.
        const from = sourceModel
            ? ModifiableValue.sourceAnchor(sourceModel, `attributes.${name}`)
            : undefined;

        ModifiableValue.applyChanges(attribute, { ...range, from });
    }

    /**
     * Out-of-place AE spike: re-enforce attribute value ranges after native ActiveEffect application.
     *
     * Foundry's NumberField applies AE changes onto `attribute.value` but only cleans against the field's
     * own options (integer), not SR5's augmented min/max ranges. applyChanges normally enforces those via
     * EnforcedMinimum/Maximum, so re-clamp here to keep natively-applied values within range and refresh
     * the tracked `max` for attributes that expose one.
     *
     * @param system A system actor with attributes.
     * @param ranges Optional per-attribute ranges, defaulting to the SR5 attribute ranges.
     */
    static clampAttributesToRange(system: SR5Actor['system'], ranges?: Record<string, {min: number, max?: number}>) {
        for (const [name, attribute] of Object.entries(system.attributes)) {
            if (!Object.hasOwn(SR5.attributes, name) || !attribute) continue;

            const range = ranges ? ranges[name] : SR.attributes.ranges[name];
            if (!range) continue;

            if (range.max != null && attribute.value > range.max) attribute.value = range.max;
            if (range.min != null && attribute.value < range.min) attribute.value = range.min;

            if ('max' in attribute) attribute.max = attribute.value;
        }
    }

    /**
     * Calculate the Essence attribute and it's modifiers.
     * 
     * @param system A system actor having an essence attribute
     * @param items The items that might cause an essence loss.
     */
    static prepareEssence(system: Actor.SystemOfType<'character'>, items: SR5Item[]) {
        // The essence base is fixed. Changes should be made through the attribute.temp field.
        system.attributes.essence.base = SR.attributes.defaults.essence;

        // Modify essence by actor modifer
        const parts = new ModifiableValue(system.attributes.essence);

        const essenceMod = system.modifiers.essence;
        parts.addUnique('SR5.Bonus', essenceMod);

        for (const item of items) {
            if (item.isEquipped() && item.isType('bioware', 'cyberware'))
                parts.add(item.name, -item.getEssenceLoss());
        }

        ModifiableValue.applyChanges(system.attributes.essence, { decimal: true });
    }
}
