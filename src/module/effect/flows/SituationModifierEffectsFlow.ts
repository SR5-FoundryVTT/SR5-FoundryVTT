import { SR5Actor } from "../../actor/SR5Actor";
import { SR5ActiveEffect } from "../SR5ActiveEffect";
import { SituationModifier } from "../../rules/modifiers/SituationModifier";
import {
    applyBestVisionCompensation,
    flareCompensation,
    imageMagnification,
    lowLightVision,
    smartlink,
    sunglasses,
    thermographicVision,
    tracerRounds,
    ultrasound,
    VISION_COMPENSATIONS,
} from "./EnvironmentalChangeFlow";
import { SuccessTest } from "../../tests/SuccessTest";
import { allApplicableDocumentEffects, allApplicableItemsEffects } from "../../effects";
import { PerceptionResolver } from "../../vision/PerceptionResolver";

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
            'smartlink': smartlink,
            'ultrasound': ultrasound,
            'thermographic_vision': thermographicVision,
            'flare_compensation': flareCompensation,
            'sunglasses': sunglasses,
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
        // const changes: ActiveEffect.ChangeData[] = [];
        const changes: (ActiveEffect.ChangeData & { effect: SR5ActiveEffect; priority: number })[] = [];
        for (const effect of this.allApplicableEffects()) {
            if (!effect.active) continue;

            // Only apply changes assigned to a 'modifier' target. A target may opt to only apply
            // to tests of its parent item via its onlyForItemTest flag.
            const effectChanges = effect.changesForApplyTo('modifier').filter(change => {
                const target = effect.targetForChange(change);
                return !(target?.onlyForItemTest && (test === undefined || effect.parent !== test?.item));
            });
            changes.push(...effectChanges.map(change => {
                const c = foundry.utils.deepClone<typeof changes[number]>(change as any);
                c.effect = effect;
                return c;
            }));
        }

        changes.sort((a, b) => a.priority - b.priority);

        console.debug('Shadowrun 5e | Applying Situation Modifier Effect changes', changes);
        // A handler granted by several effects or senses only applies once.
        const handlerNames = new Set<string>(this.senseHandlerNames());
        for (const change of changes) {
            if (!change.key) continue;
            
            // expect keys in format of <modifierType>.<modifierHandler>
            const changeKeySplit = change.key.split('.') as [string, string];
            if (changeKeySplit.length !== 2) continue;
            const [modifierType, modifierHandler] = changeKeySplit;

            if (modifierType !== this.modifier.type) continue;
            if (this.applyHandlers[modifierHandler]) handlerNames.add(modifierHandler);
        }

        const visionHandlers: ((modifier: any, test?: SuccessTest) => void)[] = [];
        for (const handlerName of handlerNames) {
            const handler = this.applyHandlers[handlerName];
            if (VISION_COMPENSATIONS.has(handlerName)) {
                visionHandlers.push(handler);
                continue;
            }
            console.debug('Shadowrun 5e | ... applying modifier handler', this.modifier, handler, test);
            handler(this.modifier, test);
        }
        if (visionHandlers.length) applyBestVisionCompensation(this.modifier as any, visionHandlers, test);
        return false;
    }

    /**
     * Senses of the actor compensate environmental modifiers without needing an effect. See SR5#175
     */
    *senseHandlerNames(): Generator<string> {
        if (this.modifier.type !== 'environmental') return;
        if (!this.modifier.sourceDocumentIsActor || !this.modifier.modifiers?.document) return;

        const senses = PerceptionResolver.resolve(this.modifier.modifiers.document as SR5Actor).physical;
        if (senses.lowLight) yield 'low_light_vision';
        if (senses.thermographic) yield 'thermographic_vision';
        if (senses.ultrasound) yield 'ultrasound';
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