import { SR5Actor } from "../../actor/SR5Actor";
import { SR5ActiveEffect } from "../SR5ActiveEffect";
import { SituationModifier } from "../../rules/modifiers/SituationModifier";
import { imageMagnification, lowLightVision, smartlink, thermographicVision, tracerRounds, ultrasound } from "./EnvironmentalChangeFlow";
import { SuccessTest } from "../../tests/SuccessTest";
import { allApplicableDocumentEffects, allApplicableItemsEffects } from "../../effects";

/**
 * TODO: Documentation.
 * 
 */
export class SituationModifierEffectsFlow<T extends SituationModifier> {
    modifier: T;
    applyHandlers: Record<string, (modifier: any, test?: SuccessTest) => void> = {};

    constructor(modifier: T) {
        this.modifier = modifier;

        // Configure handlers for effect change values.
        this.applyHandlers = {
            'low_light_vision': lowLightVision,
            'image_magnification': imageMagnification,
            'tracer_rounds': tracerRounds,
            smartlink,
            ultrasound,
            'thermographic_vision': thermographicVision
        }
    }

    /**
     * Copied version of SR5Actor.applyActiveEffects to apply effects to situation modifiers.
     * 
     * @param test The test to use during application for context.
     * @returns 
     */
    applyAllEffects(test?: SuccessTest) {
        console.debug('Shadowrun 5e | Applying Situation Modifier Effects', this);
        const changes: any[] = [];
        for (const effect of this.allApplicableEffects()) {
            if (!effect.active) continue;
            // Special case for modifier effects: Some only apply to tests of their parent item.
            if (effect.onlyForItemTest && (test === undefined || effect.parent !== test?.item)) continue;

            changes.push(...effect.changes.map(change => {
                const c = foundry.utils.deepClone(change) as any;
                c.effect = effect;
                return c;
            }));
        }

        changes.sort((a, b) => a.priority - b.priority);

        console.debug('Shadowrun 5e | Applying Situation Modifier Effect changes', changes);
        for (const change of changes) {
            if (!change.key) continue;
            
            // expect keys in format of <modifierType>.<modifierHandler>
            const changeKeySplit = change.key.split('.') as [string, string];
            if (changeKeySplit.length !== 2) return false;
            const [modifierType, modifierHandler] = changeKeySplit;

            if (modifierType !== this.modifier.type) continue;

            const handler = this.applyHandlers[modifierHandler];
            if (!handler) continue;

            console.debug('Shadowrun 5e | ... applying modifier handler', this.modifier, handler, test);
            handler(this.modifier, test);
        }
    }

    /**
     * Reduce all actor effects to those applicable to Situational Modifiers.
     * 
     * Since Foundry Core uses a generator, keep this pattern for consistency.
     * @param test An optional SuccessTest implementation to use for context.
     */
    *allApplicableEffects(): Generator<SR5ActiveEffect> {
        if (this.modifier.sourceDocumentIsActor && this.modifier.modifiers?.document) {
            const actor = this.modifier.modifiers.document as SR5Actor;

            for (const effect of allApplicableDocumentEffects(actor, {applyTo: ['modifier']})) {
                yield effect;
            }
            
            for (const effect of allApplicableItemsEffects(actor, {applyTo: ['modifier']})) {
                yield effect;
            }
        }
    }
}