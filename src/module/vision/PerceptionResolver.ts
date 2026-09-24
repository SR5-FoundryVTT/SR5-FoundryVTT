import type { PerceptionCapabilitiesType } from '@/module/types/template/Visibility';
import { SR5 } from '@/module/config';

type PerceptionActor = {
    system: Record<string, any>;
};

/** GM overrides of astral eligibility. 'default' keeps what the magical type grants. */
const OVERRIDES: Record<string, boolean | undefined> = { allow: true, deny: false };

export class PerceptionResolver {
    /**
     * Resolve which senses an actor has.
     *
     * Active Effect grants are already part of the prepared capabilities, as actor preparation applies
     * actor and item effects. Metatype senses and magical eligibility are added on top, with explicit
     * GM overrides applied last.
     */
    static resolve(actor: PerceptionActor): PerceptionCapabilitiesType {
        const capabilities = actor.system.visibilityChecks?.capabilities;
        const resolved: PerceptionCapabilitiesType = {
            physical: {
                lowLight: !!capabilities?.physical?.lowLight,
                thermographic: !!capabilities?.physical?.thermographic,
                ultrasound: !!capabilities?.physical?.ultrasound,
            },
            astral: {
                perception: !!capabilities?.astral?.perception,
                projection: !!capabilities?.astral?.projection,
            },
            matrix: {
                perception: !!capabilities?.matrix?.perception,
            },
        };

        this.applyMetatypeSenses(actor.system.metatype, resolved);
        this.applyMagicalEligibility(actor.system.magic, resolved);
        return resolved;
    }

    private static applyMetatypeSenses(metatype: unknown, capabilities: PerceptionCapabilitiesType) {
        if (typeof metatype !== 'string') return;

        switch (metatype.toLowerCase()) {
            case 'elf':
            case 'ork':
                capabilities.physical.lowLight = true;
                break;
            case 'dwarf':
            case 'troll':
                capabilities.physical.thermographic = true;
                break;
        }
    }

    private static applyMagicalEligibility(magic: Record<string, any> | undefined, capabilities: PerceptionCapabilitiesType) {
        if (!magic) return;

        const type = magic.type as keyof typeof SR5.magicalTypes | undefined;
        if (type === 'magician') {
            capabilities.astral.perception = true;
            capabilities.astral.projection = true;
        } else if (type === 'aspected_magician') {
            capabilities.astral.perception = true;
        }

        capabilities.astral.perception = OVERRIDES[magic.astralPerceptionOverride] ?? capabilities.astral.perception;
        capabilities.astral.projection = OVERRIDES[magic.astralProjectionOverride] ?? capabilities.astral.projection;
    }
}
