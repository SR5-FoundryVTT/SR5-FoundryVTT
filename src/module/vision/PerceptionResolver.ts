import type { PerceptionCapabilities, PerceptionTargets } from '@/module/types/template/Visibility';

export type MagicalType = 'mundane' | 'magician' | 'aspected_magician' | 'adept' | 'mystic_adept';

export interface ResolvedPerceptionState {
    capabilities: PerceptionCapabilities;
    targets: PerceptionTargets;
}

type PerceptionActor = {
    system: Record<string, any>;
    effects?: Iterable<PerceptionEffect>;
    items?: Iterable<PerceptionItem>;
};

type PerceptionEffect = {
    disabled?: boolean;
    isSuppressed?: boolean;
    system?: {
        changes?: Iterable<{ key?: string; value?: unknown }>;
    };
};

type PerceptionItem = {
    effects?: Iterable<PerceptionEffect>;
    items?: Iterable<PerceptionItem>;
    isEquipped?: () => boolean;
    system?: Record<string, any>;
};

const CAPABILITY_KEYS = {
    'system.visibilityChecks.capabilities.physical.lowLight': ['physical', 'lowLight'],
    'system.visibilityChecks.capabilities.physical.thermographic': ['physical', 'thermographic'],
    'system.visibilityChecks.capabilities.physical.ultrasound': ['physical', 'ultrasound'],
    'system.visibilityChecks.capabilities.astral.perception': ['astral', 'perception'],
    'system.visibilityChecks.capabilities.astral.projection': ['astral', 'projection'],
    'system.visibilityChecks.capabilities.matrix.perception': ['matrix', 'perception'],
} as const;

export class PerceptionResolver {
    static resolve(actor: PerceptionActor): ResolvedPerceptionState {
        const visibility = actor.system.visibilityChecks ?? {};
        const resolved: ResolvedPerceptionState = {
            capabilities: {
                physical: {
                    lowLight: !!visibility.capabilities?.physical?.lowLight,
                    thermographic: !!visibility.capabilities?.physical?.thermographic,
                    ultrasound: !!visibility.capabilities?.physical?.ultrasound,
                },
                astral: {
                    perception: !!visibility.capabilities?.astral?.perception,
                    projection: !!visibility.capabilities?.astral?.projection,
                },
                matrix: {
                    perception: !!visibility.capabilities?.matrix?.perception,
                },
            },
            targets: {
                physical: {
                    active: !!visibility.targets?.physical?.active,
                    thermographic: visibility.targets?.physical?.thermographic ?? 'none',
                },
                astral: {
                    hasAura: !!visibility.targets?.astral?.hasAura,
                    astralActive: !!visibility.targets?.astral?.astralActive,
                    affectedBySpell: !!visibility.targets?.astral?.affectedBySpell,
                },
                matrix: {
                    hasIcon: !!visibility.targets?.matrix?.hasIcon,
                    runningSilent: !!visibility.targets?.matrix?.runningSilent,
                },
            },
        };

        this.applyMetatypeSenses(actor.system.metatype, resolved.capabilities);
        this.applyMagicalEligibility(actor.system.magic, resolved.capabilities);
        this.applyEffects(actor.effects, resolved.capabilities);
        this.applyItemEffects(actor.items, resolved.capabilities);
        return resolved;
    }

    private static applyMetatypeSenses(metatype: unknown, capabilities: PerceptionCapabilities) {
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

    private static applyMagicalEligibility(magic: Record<string, any> | undefined, capabilities: PerceptionCapabilities) {
        if (!magic) return;

        const type = magic.type as MagicalType | undefined;
        if (type === 'magician') {
            capabilities.astral.perception = true;
            capabilities.astral.projection = true;
        } else if (type === 'aspected_magician') {
            capabilities.astral.perception = true;
        }

        if (magic.astralPerceptionOverride === 'allow' || magic.astralPerceptionOverride === true) capabilities.astral.perception = true;
        if (magic.astralPerceptionOverride === 'deny' || magic.astralPerceptionOverride === false) capabilities.astral.perception = false;
        if (magic.astralProjectionOverride === 'allow' || magic.astralProjectionOverride === true) capabilities.astral.projection = true;
        if (magic.astralProjectionOverride === 'deny' || magic.astralProjectionOverride === false) capabilities.astral.projection = false;
    }

    private static applyEffects(effects: Iterable<PerceptionEffect> | undefined, capabilities: PerceptionCapabilities) {
        if (!effects) return;
        for (const effect of effects) {
            if (effect.disabled || effect.isSuppressed) continue;
            for (const change of effect.system?.changes ?? []) {
                const path = CAPABILITY_KEYS[change.key as keyof typeof CAPABILITY_KEYS];
                if (!path || !this.isTruthyGrant(change.value)) continue;
                const [domain, capability] = path;
                (capabilities[domain][capability] as boolean) = true;
            }
        }
    }

    private static applyItemEffects(
        items: Iterable<PerceptionItem> | undefined,
        capabilities: PerceptionCapabilities,
        parentEnabled = true,
    ) {
        if (!items) return;
        for (const item of items) {
            const technology = item.system?.technology;
            const equipped = item.isEquipped?.() ?? technology?.equipped;
            const enabled = parentEnabled && (!technology || !!equipped);
            if (enabled) this.applyEffects(item.effects, capabilities);
            this.applyItemEffects(item.items, capabilities, enabled);
        }
    }

    private static isTruthyGrant(value: unknown) {
        if (typeof value === 'string') return ['true', '1'].includes(value.toLowerCase());
        return value === true || value === 1;
    }
}
