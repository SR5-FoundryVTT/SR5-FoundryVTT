import { SR } from '@/module/constants';
import { VersionMigration } from '../VersionMigration';
import {
    DEFAULT_FORCE_APPLIES,
    DEFAULT_LEVEL_APPLIES,
    PRESET_INITIATIVE_DEFAULTS,
    PRESET_SPIRIT_PROFILES,
    PRESET_SPRITE_PROFILES,
    SPIRIT_ATTRIBUTE_IDS,
    SPRITE_MATRIX_ATTRIBUTE_IDS,
    type SpiritProfileInitiative,
    type SpiritInitiativeFormula,
    type SpriteAttributeId,
    humanizePresetTypeKey,
} from '@/module/data/SpiritSpritePresetProfiles';
const { hasProperty, setProperty, getProperty } = foundry.utils;

/**
 * Migrate initiative to have a blitz field, and vehicle stats to have off-road acceleration.
 * Also migrate combat flags for tracking initiative pass and if a combatant attacked last turn.
 * Finally, migrate spirits to have force apply flags, and initiative formulae based on the hard-coded profile system.
 */
export class Version0_34_0 extends VersionMigration {
    readonly TargetVersion = '0.34.0';

    override migrateCombat(combat: any) {
        const initiativePass = combat.flags.shadowrun5e?.combatInitiativePass ?? SR.combat.FIRST_PASS;
        setProperty(combat, "system.pass", Math.max(initiativePass, SR.combat.FIRST_PASS));
    }

    override migrateCombatant(combatant: any): void {
        if (combatant.flags.shadowrun5e?.turnsSinceLastAttack) combatant.system.attackedLastTurn = true;
    }

    override migrateActor(actor: any): void {
        const system = actor.system;
        if (hasProperty(system as any, "initiative"))
            system.initiative.blitz = system.initiative.edge;

        if (actor.type === "vehicle" && hasProperty(system as any, "vehicle_stats")) {
            const acceleration = getProperty(system, "vehicle_stats.acceleration.base");
            setProperty(system, "vehicle_stats.off_road_acceleration.base", acceleration);
        }

        if (actor.type === 'spirit')
            this.migrateSpirit(actor);
        else if (actor.type === 'sprite')
            this.migrateSprite(actor);
    }

    private migrateSpirit(actor: any) {
        const system = actor.system;
        if (!system || typeof system !== 'object') return;

        const spiritType = typeof system.spiritType === 'string' ? system.spiritType.trim().toLowerCase() : '';
        const profile = PRESET_SPIRIT_PROFILES[spiritType as keyof typeof PRESET_SPIRIT_PROFILES];
        if (!profile) return;
        system.spiritType = humanizePresetTypeKey(spiritType);

        system.force_applies = this.buildToggleMap(DEFAULT_FORCE_APPLIES, profile.forceOff);

        const offsets = profile.attributes ?? {};
        for (const attributeId of SPIRIT_ATTRIBUTE_IDS) {
            if (!system.force_applies[attributeId]) continue;

            setProperty(system, `attributes.${attributeId}.base`, offsets[attributeId] ?? 0);
        }

        if (hasProperty(system, 'attributes.force.base'))
            system.attributes.force.base = Math.max(Number(system.attributes.force.base ?? 0),  1);

        system.half_value_skill = profile.halfValueSkill ?? false;
        this.migrateSpiritInitiative(system, profile.initiative);
        this.migrateSkillToggles(actor, profile.skills ?? []);
    }

    private buildToggleMap<T extends string>(
        defaults: Readonly<Record<T, boolean>>,
        disabled: readonly T[] | undefined,
    ): Record<T, boolean> {
        const toggles: Record<T, boolean> = { ...defaults };
        for (const key of disabled ?? [])
            toggles[key] = false;
        return toggles;
    }

    private migrateSpiritInitiative(system: any, initiative: Partial<SpiritProfileInitiative> | undefined) {
        const profile: SpiritProfileInitiative = { ...PRESET_INITIATIVE_DEFAULTS, ...initiative };

        system.initiative_formulae ??= {};
        system.initiative_formulae.meatspace = this.initFormulaBuild(profile.init_mult, profile.init, profile.init_dice);
        system.initiative_formulae.astral = this.initFormulaBuild(profile.astral_init_mult, profile.astral_init, profile.astral_init_dice);
    }

    private initFormulaBuild(multiplier: number, constant: number, dice: number): SpiritInitiativeFormula {
        const [attribute_a, attribute_b] = multiplier >= 2 ? ['force', 'force'] : multiplier === 1 ? ['', 'force'] : ['', ''];
        return { attribute_a, attribute_b, constant, dice };
    }

    private migrateSprite(actor: any): void {
        const system = actor.system;
        if (!system || typeof system !== 'object') return;

        const spriteType = typeof system.spriteType === 'string' ? system.spriteType.trim().toLowerCase() : '';
        const profile = PRESET_SPRITE_PROFILES[spriteType];
        if (!profile) return;
        system.spriteType = humanizePresetTypeKey(spriteType);

        this.migrateSpriteLevelApplies(system, profile.levelOff);
        this.migrateSpriteAttributeOffsets(system, profile.offsets ?? {});
        this.migrateSpriteInitiativeModifier(system, profile.init ?? 0);
        this.migrateSkillToggles(actor, profile.skills ?? ['computer']);
    }

    private migrateSpriteLevelApplies(system: any, levelOff: SpriteAttributeId[] | undefined) {
        setProperty(system, 'level_applies', this.buildToggleMap(DEFAULT_LEVEL_APPLIES, levelOff));
    }

    private migrateSpriteAttributeOffsets(system: any, offsets: Partial<Record<SpriteAttributeId, number>>) {
        setProperty(system, 'attributes.resonance.base', offsets.resonance ?? 0);

        for (const attributeId of SPRITE_MATRIX_ATTRIBUTE_IDS) {
            setProperty(system, `matrix.${attributeId}.base`, offsets[attributeId] ?? 0);
        }
    }

    private migrateSpriteInitiativeModifier(system: any, profileInitConstant: number) {
        const currentModifier = Number(getProperty(system, 'modifiers.matrix_initiative') ?? 0);
        setProperty(system, 'modifiers.matrix_initiative', currentModifier + profileInitConstant);
    }

    private migrateSkillToggles(actor: any, profileSkills: string[]) {
        const profileSkillKeys = new Set(profileSkills.map(skill => this.normalizeSkillKey(skill)));
        if (profileSkillKeys.size === 0) return;

        const items = Array.isArray(actor.items) ? actor.items : [];
        for (const item of items) {
            if (item?.type !== 'skill') continue;
            if (item.system?.type !== 'skill') continue;

            const itemSkillName = typeof item.name === 'string' ? item.name : '';
            const itemSkillKey = this.normalizeSkillKey(itemSkillName);
            if (!itemSkillKey) continue;

            const rating = profileSkillKeys.has(itemSkillKey) ? 1 : 0;
            setProperty(item, 'system.skill.rating', rating);
        }
    }

    private normalizeSkillKey(name: string) {
        if (typeof name !== 'string') return '';
        return name.trim().replace(/[\s-]+/g, '_').toLowerCase();
    }
}




