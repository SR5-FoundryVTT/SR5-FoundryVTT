import { ItemAvailabilityFlow } from '@/module/item/flows/ItemAvailabilityFlow';
import { ModifiableValue } from '@/module/mods/ModifiableValue';
import { VersionMigration } from '../VersionMigration';

const { randomID } = foundry.utils;

const PERCEPTION_TARGET_PATHS = {
    'system.visibilityChecks.astral.hasAura': 'system.visibilityChecks.targets.astral.hasAura',
    'system.visibilityChecks.astral.astralActive': 'system.visibilityChecks.targets.astral.astralActive',
    'system.visibilityChecks.astral.affectedBySpell': 'system.visibilityChecks.targets.astral.affectedBySpell',
    'system.visibilityChecks.matrix.hasIcon': 'system.visibilityChecks.targets.matrix.hasIcon',
    'system.visibilityChecks.matrix.runningSilent': 'system.visibilityChecks.targets.matrix.runningSilent',
    'system.visibilityChecks.meat.hasHeat': 'system.visibilityChecks.targets.physical.thermographic',
} as const;

/** Qualities naming a magical type, checked in order so that e.g. Mystic Adept wins over Adept. */
const MAGICAL_TYPE_QUALITIES = [
    ['mystic adept', 'mystic_adept'],
    ['aspected magician', 'aspected_magician'],
    ['adept', 'adept'],
    ['magician', 'magician'],
] as const;

/** Migrate data changes from every branch that ships in 0.38.0. */
export class Version0_38_0 extends VersionMigration {
    readonly TargetVersion = '0.38.0';

    // Each branch contributing to 0.38.0 keeps its whole flow in its own migrate<Branch> method, called here.
    override migrateActor(actor: any): void {
        this.migrateVision(actor);
        this.migrateMagicalType(actor);
    }

    override migrateActiveEffect(effect: any): void {
        this.migrateVisionEffect(effect);
    }

    override migrateItem(item: any): void {
        this.migrateItemSheetRework(item);
    }

    /** Vision: visibility checks moved under system.visibilityChecks.targets, heat became a thermographic level. */
    private migrateVision(actor: any): void {
        const visibility = actor.system?.visibilityChecks;
        if (!visibility) return;

        visibility.targets ??= {};
        visibility.targets.physical ??= {};
        visibility.targets.astral ??= {};
        visibility.targets.matrix ??= {};

        visibility.targets.physical.active ??= ['character', 'critter', 'vehicle'].includes(actor.type);
        visibility.targets.physical.thermographic ??= visibility.meat?.hasHeat ? 'warm' : 'none';
        visibility.targets.astral.hasAura ??= !!visibility.astral?.hasAura;
        visibility.targets.astral.astralActive ??= !!visibility.astral?.astralActive;
        visibility.targets.astral.affectedBySpell ??= !!visibility.astral?.affectedBySpell;
        visibility.targets.matrix.hasIcon ??= !!visibility.matrix?.hasIcon;
        visibility.targets.matrix.runningSilent ??= !!visibility.matrix?.runningSilent;

        delete visibility.meat;
        delete visibility.astral;
        delete visibility.matrix;
    }

    /**
     * Vision: astral senses now follow the magical type, so awakened characters need one.
     *
     * A magic type quality decides it. Without one, adept powers and spells tell adepts, mystic
     * adepts and magicians apart. Aspected magicians are only recognized by their quality.
     */
    private migrateMagicalType(actor: any): void {
        const magic = actor.system?.magic;
        if (actor.type !== 'character' || actor.system?.special !== 'magic' || !magic || magic.type) return;

        const items: any[] = actor.items ?? [];
        const qualities = new Set(items.filter(item => item.type === 'quality').map(item => String(item.name).toLowerCase()));
        const fromQuality = MAGICAL_TYPE_QUALITIES.find(([quality]) => qualities.has(quality));
        if (fromQuality) {
            magic.type = fromQuality[1];
            return;
        }

        const hasPowers = items.some(item => item.type === 'adept_power');
        const hasSpells = items.some(item => item.type === 'spell');
        magic.type = hasPowers && hasSpells ? 'mystic_adept' : hasPowers ? 'adept' : 'magician';
    }

    /** Vision: effect changes follow the moved visibility check paths. */
    private migrateVisionEffect(effect: any): void {
        this.migrateEffectChanges(effect, PERCEPTION_TARGET_PATHS);
        for (const change of effect.system?.changes ?? []) {
            if (change.key !== PERCEPTION_TARGET_PATHS['system.visibilityChecks.meat.hasHeat']) continue;
            const value = String(change.value).toLowerCase();
            if (value === 'true' || value === '1') change.value = 'warm';
            else if (value === 'false' || value === '0') change.value = 'none';
        }
    }

    /**
     * ItemSheetRework: ids for flag-stored nested items/effects, technology cost/availability/essence as
     * base/value fields, and legacy "adjusted" rating multipliers as item Active Effects.
     */
    private migrateItemSheetRework(item: any): void {
        Version0_38_0.assignNestedIds(item.flags?.shadowrun5e?.embeddedItems);

        const technology = item.system?.technology;
        if (!technology) return;

        // 0.37.0 stored cost as a number and availability as a '12R' string, read the same way its prep did.
        const calculated = technology.calculated;
        const cost = Number(technology.cost ?? 0) || 0;
        const availability = String(technology.availability ?? '');

        technology.cost = { base: cost, value: cost, changes: [] };
        technology.availability = { ...ItemAvailabilityFlow.parseAvailabilityString(availability), changes: [] };

        if (!calculated) return;

        // Essence moved out of the removed calculated block.
        const essence = calculated.essence?.value ?? 0;
        technology.essence ??= { base: essence, value: essence };

        // "adjusted" multiplied cost/availability by rating; keep that as an item effect the user can see and remove.
        for (const field of ['cost', 'availability'] as const) {
            if (!calculated[field]?.adjusted) continue;
            // Availability was only multiplied by rating when it parsed as Number-Letter.
            if (field === 'availability' && !ItemAvailabilityFlow.parseAvailability(availability).isValid) continue;

            const fieldLabel = field === 'cost' ? 'SR5.Cost' : 'SR5.Availability';
            item.effects ??= [];
            item.effects.push({
                _id: randomID(),
                name: `${game.i18n.localize('SR5.Rating')} ${game.i18n.localize(fieldLabel)}`,
                type: 'base',
                flags: { shadowrun5e: { ratingMultiplier: field } },
                system: {
                    targets: [{ id: 'item', applyTo: 'item' }],
                    changes: [{
                        key: `system.technology.${field}`,
                        type: 'multiply',
                        value: '@system.technology.rating',
                        priority: ModifiableValue.Priority.RATING,
                        target: 'item',
                    }],
                },
            });
        }

        delete technology.calculated;
    }

    /** Nested items and their effects are stored in flags and need ids to be addressable as documents. */
    private static assignNestedIds(items: unknown): void {
        if (!Array.isArray(items)) return;

        for (const nested of items) {
            nested._id ??= randomID();

            if (Array.isArray(nested.effects)) {
                for (const effect of nested.effects) effect._id ??= randomID();
            }

            Version0_38_0.assignNestedIds(nested.flags?.shadowrun5e?.embeddedItems);
        }
    }
}
