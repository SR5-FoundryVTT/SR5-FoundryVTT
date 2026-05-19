import { SR } from '@/module/constants';
import { VersionMigration } from '../VersionMigration';
import {
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

        this.migrateInitiativeModifierFields(actor.type, system);

        if (actor.type === 'spirit')
            this.migrateSpirit(actor);
        else if (actor.type === 'sprite')
            this.migrateSprite(actor);
    }

    override migrateActiveEffect(effect: any): void {
        const keyMap = {
            'system.level': 'system.attributes.level',
            'system.modifiers.meat_initiative': 'system.initiative.meatspace.formula.constant',
            'system.modifiers.meat_initiative_dice': 'system.initiative.meatspace.formula.dice',
            'system.modifiers.astral_initiative': 'system.initiative.astral.formula.constant',
            'system.modifiers.astral_initiative_dice': 'system.initiative.astral.formula.dice',
            'system.modifiers.matrix_initiative': 'system.initiative.matrix.formula.constant',
            'system.modifiers.matrix_initiative_dice': 'system.initiative.matrix.formula.dice',

            // legacy migration key, because we didn't update change.value before (0.31.5)
            'system.force': 'system.attributes.force',
        } as const;
        this.migrateEffectChanges(effect, keyMap);
    }

    private migrateInitiativeModifierFields(actorType: string, system: any) {
        if (!system || typeof system !== 'object') return;

        const defaultDiceByType = {
            character: { meatspace: 1, astral: 2, matrix: 3 },
            ic: { matrix: 4 },
            spirit: { meatspace: 2, astral: 3 },
            sprite: { matrix: 4 },
            vehicle: { meatspace: 4, matrix: 3 },
        } as const;

        const modes = [
            { mode: 'meatspace', constantKey: 'meat_initiative', diceKey: 'meat_initiative_dice' },
            { mode: 'astral', constantKey: 'astral_initiative', diceKey: 'astral_initiative_dice' },
            { mode: 'matrix', constantKey: 'matrix_initiative', diceKey: 'matrix_initiative_dice' },
        ] as const;

        for (const { mode, constantKey, diceKey } of modes) {
            const modePath = `initiative.${mode}`;
            const formulaPath = `${modePath}.formula`;
            const baseDice = getProperty(defaultDiceByType, `${actorType}.${mode}`) as number | undefined;

            if (baseDice == null) continue;

            const diceModifier = Number(getProperty(system, `modifiers.${diceKey}`) ?? 0);
            const constantModifier = Number(getProperty(system, `modifiers.${constantKey}`) ?? 0);

            setProperty(system, `${formulaPath}.constant`, constantModifier);
            setProperty(system, `${formulaPath}.dice`, baseDice + diceModifier);

            if (system.modifiers && typeof system.modifiers === 'object' && constantKey in system.modifiers)
                delete system.modifiers[constantKey];
            if (system.modifiers && typeof system.modifiers === 'object' && diceKey in system.modifiers)
                delete system.modifiers[diceKey];
        }
    }

    private migrateSpirit(actor: any) {
        const system = actor.system;
        if (!system || typeof system !== 'object') return;

        const spiritType = typeof system.spiritType === 'string' ? system.spiritType.trim().toLowerCase() : '';
        const profile = PRESET_SPIRIT_PROFILES[spiritType as keyof typeof PRESET_SPIRIT_PROFILES];
        if (!profile) return;
        system.spiritType = humanizePresetTypeKey(spiritType);

        const forceOff = new Set(profile.forceOff ?? []);

        const offsets = profile.attributes ?? {};
        for (const attributeId of SPIRIT_ATTRIBUTE_IDS) {
            const appliesSpecial = !forceOff.has(attributeId);
            setProperty(system, `attributes.${attributeId}.applies_special`, appliesSpecial);
            if (!appliesSpecial) continue;

            setProperty(system, `attributes.${attributeId}.base`, offsets[attributeId] ?? 0);
        }

        if (hasProperty(system, 'attributes.force.base'))
            system.attributes.force.base = Math.max(Number(system.attributes.force.base ?? 0),  1);

        system.half_value_skill = profile.halfValueSkill ?? false;
        this.migrateSpiritInitiative(system, profile.initiative);
        this.migrateSkillToggles(actor, profile.skills ?? []);
    }

    private migrateSpiritInitiative(system: any, initiative: Partial<SpiritProfileInitiative> | undefined) {
        const profile: SpiritProfileInitiative = { ...PRESET_INITIATIVE_DEFAULTS, ...initiative };

        setProperty(system, 'initiative.meatspace.formula', this.initFormulaBuild(profile.init_mult, profile.init, profile.init_dice));
        setProperty(system, 'initiative.astral.formula', this.initFormulaBuild(profile.astral_init_mult, profile.astral_init, profile.astral_init_dice));
    }

    private initFormulaBuild(multiplier: number, constant: number, dice: number): SpiritInitiativeFormula {
        const [attribute_a, attribute_b] = multiplier >= 2 ? ['force', 'force'] : multiplier === 1 ? ['', 'force'] : ['', ''];
        return { attribute_a, attribute_b, constant, dice };
    }

    private migrateSprite(actor: any): void {
        const system = actor.system;
        if (!system || typeof system !== 'object') return;
        setProperty(system, 'attributes.level.base', getProperty(system, 'level'));
        delete system.level;

        const spriteType = typeof system.spriteType === 'string' ? system.spriteType.trim().toLowerCase() : '';
        const profile = PRESET_SPRITE_PROFILES[spriteType];
        if (!profile) return;
        system.spriteType = humanizePresetTypeKey(spriteType);

        this.migrateSkillToggles(actor, profile.skills);
        this.migrateSpriteAttributeOffsets(system, profile.offsets ?? {}, profile.levelOff);

        setProperty(system, 'initiative.matrix.formula.attribute_a', 'level');
        setProperty(system, 'initiative.matrix.formula.attribute_b', 'level');
        setProperty(system, 'initiative.matrix.formula.constant', profile.init ?? 0);
    }

    private migrateSpriteAttributeOffsets(
        system: any,
        offsets: Partial<Record<SpriteAttributeId, number>>,
        levelOff: SpriteAttributeId[] | undefined = [],
    ) {
        const levelOffSet = new Set(levelOff);
        setProperty(system, 'attributes.resonance.applies_special', !levelOffSet.has('resonance'));
        setProperty(system, 'attributes.resonance.base', offsets.resonance ?? 0);

        for (const attributeId of SPRITE_MATRIX_ATTRIBUTE_IDS) {
            setProperty(system, `matrix.${attributeId}.applies_special`, !levelOffSet.has(attributeId));
            setProperty(system, `matrix.${attributeId}.base`, offsets[attributeId] ?? 0);
        }
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
