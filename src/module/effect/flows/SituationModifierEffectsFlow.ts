import { NestedKeys } from './../../utils/types';
import { EffectChangeData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/effectChangeData";
import { SR5Actor } from "../../actor/SR5Actor";
import { SR5ActiveEffect } from "../SR5ActiveEffect";
import { SituationModifier, SituationalModifierApplyOptions } from "../../rules/modifiers/SituationModifier";
import { imageMagnification, lowLightVision, smartlink, tracerRounds, ultrasound } from "./EnvironmentalChangeFlow";
import { SuccessTest } from "../../tests/SuccessTest";
import { allApplicableDocumentEffects, allApplicableItemEffects } from "../../effects";

/**
 * TODO: Documentation.
 * 
 */
export class SituationModifierEffectsFlow<T extends SituationModifier> {
    modifier: T;
    applyHandlers: Record<string, Function> = {};

    constructor(modifier: T) {
        this.modifier = modifier;

        // Configure handlers for effect change values.
        this.applyHandlers = {
            'low_light_vision': lowLightVision,
            'image_magnification': imageMagnification,
            'tracer_rounds': tracerRounds,
            'smartlink': smartlink,
            'ultrasound': ultrasound
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
            if (!effect.active) return;

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
     */
    *allApplicableEffects(): Generator<SR5ActiveEffect> {
        if (this.modifier.sourceDocumentIsActor && this.modifier.modifiers?.document) {
            const actor = this.modifier.modifiers.document as SR5Actor;

            for (const effect of allApplicableDocumentEffects(actor, {applyTo: ['modifier']})) {
                yield effect;
            }
            
            for (const effect of allApplicableItemEffects(actor, {applyTo: ['modifier']})) {
                yield effect;
            }
        }
    }
}