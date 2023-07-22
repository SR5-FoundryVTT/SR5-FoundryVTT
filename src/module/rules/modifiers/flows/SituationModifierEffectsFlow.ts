import { EffectChangeData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/effectChangeData";
import { SR5Actor } from "../../../actor/SR5Actor";
import { SR5ActiveEffect } from "../../../effect/SR5ActiveEffect";
import { SituationModifier } from "../SituationModifier";
import { imageMagnification, lowLight } from "./EnvironmentalChangeFlow";

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
            'low_light': lowLight,
            'image_magnification': imageMagnification
        }
    }

    apply() {
        console.debug('Shadowrun 5e | Applying Situation Modifier Effects', this);
        const changes: any[] = [];
        for (const effect of this.allApplicable()) {
            changes.push(...effect.changes.map(change => {
                const c = foundry.utils.deepClone(change) as any;
                c.effect = effect;
                return c;
            }));
        }

        changes.sort((a, b) => a.priority - b.priority);

        console.debug('Shadowrun 5e | Applying Sitation Modifier Effect changes', changes);
        for (const change of changes) {
            if (!change.key) continue;
            if (!this._changeKeyMatchesModifierType(change)) continue;

            const handler = this.applyHandlers[change.value];
            if (!handler) continue;

            handler(this.modifier);
        }
    }

    /**
     * Reduce all actor effects to those applicable to Situational Modifiers.
     * 
     * Since Foundry Core uses a generator, keep this pattern for consistency.
     */
    *allApplicable(): Generator<SR5ActiveEffect> {
        if (this.modifier.sourceDocumentIsActor && this.modifier.modifiers?.document) {
            const actor = this.modifier.modifiers.document as SR5Actor;
            for (const effect of actor.effects as unknown as SR5ActiveEffect[]) {
                if (!effect.active) continue;
                if (effect.applyTo === 'modifier') yield effect;
            }
        }
    }

    _changeKeyMatchesModifierType(change: EffectChangeData): boolean {
        return change.key === this.modifier.type;
    }
}