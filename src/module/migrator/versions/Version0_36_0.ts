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
} from '@/module/data/SpiritSpritePresetProfiles';

const { hasProperty, setProperty, getProperty } = foundry.utils;

/**
 * Migrate spirit and sprite profile data to the new preset-driven structure,
 * move legacy initiative modifier fields into formula fields,
 * and remap related active effect keys and formula paths.
 */
export class Version0_36_0 extends VersionMigration {
    readonly TargetVersion = '0.36.0';

    override migrateActor(actor: any): void {
        const system = actor.system;

        this.migrateInitiativeModifierFields(actor.type, system);

        if (actor.type === 'spirit')
            this.migrateSpirit(actor);
        else if (actor.type === 'sprite')
            this.migrateSprite(actor);
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
            const baseDice = getProperty(defaultDiceByType, `${actorType}.${mode}`) as number | undefined;

            if (baseDice == null) continue;

            const diceModifier = Number(getProperty(system, `modifiers.${diceKey}`) ?? 0);
            const constantModifier = Number(getProperty(system, `modifiers.${constantKey}`) ?? 0);

            setProperty(system, `${modePath}.constant.base`, constantModifier);
            setProperty(system, `${modePath}.dice.base`, baseDice + diceModifier);

            if (system.modifiers && typeof system.modifiers === 'object' && constantKey in system.modifiers)
                delete system.modifiers[constantKey];
            if (system.modifiers && typeof system.modifiers === 'object' && diceKey in system.modifiers)
                delete system.modifiers[diceKey];
        }
    }

    private migrateSpirit(actor: any) {
        const system = actor.system;
        if (!system || typeof system !== 'object') return;

        const spiritType = typeof system.spiritType === 'string' ? system.spiritType : '';
        const profile = PRESET_SPIRIT_PROFILES[spiritType as keyof typeof PRESET_SPIRIT_PROFILES];
        if (!profile) return;

        const forceOff = new Set(profile.forceOff ?? []);

        const offsets = profile.attributes ?? {};
        for (const attributeId of SPIRIT_ATTRIBUTE_IDS) {
            const appliesSpecial = !forceOff.has(attributeId);
            setProperty(system, `attributes.${attributeId}.applies_special`, appliesSpecial);
            if (!appliesSpecial) continue;

            setProperty(system, `attributes.${attributeId}.base`, offsets[attributeId] ?? 0);
        }

        if (hasProperty(system, 'attributes.force.base'))
            system.attributes.force.base = Math.max(Number(system.attributes.force.base ?? 0), 1);

        system.half_value_skill = profile.halfValueSkill ?? false;
        this.migrateSpiritInitiative(system, profile.initiative);
        this.migrateSkillToggles(actor, profile.skills ?? []);
    }

    private migrateSpiritInitiative(system: any, initiative: Partial<SpiritProfileInitiative> | undefined) {
        const profile: SpiritProfileInitiative = { ...PRESET_INITIATIVE_DEFAULTS, ...initiative };

        const meatspace = this.initFormulaBuild(profile.init_mult, profile.init, profile.init_dice);
        setProperty(system, 'initiative.meatspace.attribute_a', meatspace.attribute_a);
        setProperty(system, 'initiative.meatspace.attribute_b', meatspace.attribute_b);
        setProperty(system, 'initiative.meatspace.constant.base', meatspace.constant);
        setProperty(system, 'initiative.meatspace.dice.base', meatspace.dice);

        const astral = this.initFormulaBuild(profile.astral_init_mult, profile.astral_init, profile.astral_init_dice);
        setProperty(system, 'initiative.astral.attribute_a', astral.attribute_a);
        setProperty(system, 'initiative.astral.attribute_b', astral.attribute_b);
        setProperty(system, 'initiative.astral.constant.base', astral.constant);
        setProperty(system, 'initiative.astral.dice.base', astral.dice);
    }

    private initFormulaBuild(multiplier: number, constant: number, dice: number): SpiritInitiativeFormula {
        return {
            attribute_a: multiplier >= 2 ? 'force' : '',
            attribute_b: multiplier >= 1 ? 'force' : '',
            constant: constant,
            dice: dice
        };
    }

    private migrateSprite(actor: any): void {
        this.migrateLevel(actor);

        const system = actor.system;
        if (!system || typeof system !== 'object') return;
        setProperty(system, 'attributes.level.base', getProperty(system, 'level'));
        delete system.level;

        const spriteType = typeof system.spriteType === 'string' ? system.spriteType : '';
        const profile = PRESET_SPRITE_PROFILES[spriteType];
        if (!profile) return;

        this.migrateSkillToggles(actor, profile.skills);
        this.migrateSpriteAttributeOffsets(system, profile.offsets ?? {}, profile.levelOff);

        setProperty(system, 'initiative.matrix.attribute_a', 'level');
        setProperty(system, 'initiative.matrix.attribute_b', 'level');
        setProperty(system, 'initiative.matrix.constant.base', profile.init ?? 0);
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

    private _mapSelectionValue(value: unknown): string | undefined {
        if (typeof value === 'string') return value;
        if (typeof value === 'object' && value !== null && typeof value['id'] === 'string') {
            return value['id'];
        }
        return undefined;
    }

    // Migrate legacy level field to new attributes.level.base and update related active effect changes and formula paths
    private migrateLevel(actor: any): void {
        const actorEffects = Array.isArray(actor.effects) ? actor.effects : [];
        for (const effect of actorEffects) {
            this.migrateEffectChanges(
                effect,
                { 'system.level': 'system.attributes.level' },
                { 'system.level': 'system.attributes.level.value' },
            );
        }

        const migrateItemEffects = (item: any): void => {
            if (!item || typeof item !== 'object') return;

            const itemEffects = Array.isArray(item.effects) ? item.effects : [];
            for (const effect of itemEffects) {
                // Item schema still owns system.level, so only migrate keys targeting the actor.
                this.migrateEffectChanges(
                    effect,
                    { 'system.level': 'system.attributes.level' },
                    {}
                );
            }

            const embeddedItems = getProperty(item, 'flags.shadowrun5e.embeddedItems');
            const nestedItems = Array.isArray(embeddedItems) ? embeddedItems : Object.values(embeddedItems ?? {});
            for (const nestedItem of nestedItems) {
                migrateItemEffects(nestedItem);
            }
        };

        const items = Array.isArray(actor.items) ? actor.items : [];
        for (const item of items) {
            migrateItemEffects(item);
        }
    }

    override migrateActiveEffect(effect: any): void {
        const keyMap: Record<string, string> = {
            'system.initiative.meatspace.base': 'system.initiative.meatspace.constant',
            'system.initiative.meatspace.base.base': 'system.initiative.meatspace.constant.base',
            'system.initiative.meatspace.base.value': 'system.initiative.meatspace.constant.value',
            'system.initiative.astral.base': 'system.initiative.astral.constant',
            'system.initiative.astral.base.base': 'system.initiative.astral.constant.base',
            'system.initiative.astral.base.value': 'system.initiative.astral.constant.value',
            'system.initiative.matrix.base': 'system.initiative.matrix.constant',
            'system.initiative.matrix.base.base': 'system.initiative.matrix.constant.base',
            'system.initiative.matrix.base.value': 'system.initiative.matrix.constant.value',
            'system.modifiers.meat_initiative': 'system.initiative.meatspace.constant.base',
            'system.modifiers.meat_initiative_dice': 'system.initiative.meatspace.dice.base',
            'system.modifiers.astral_initiative': 'system.initiative.astral.constant.base',
            'system.modifiers.astral_initiative_dice': 'system.initiative.astral.dice.base',
            'system.modifiers.matrix_initiative': 'system.initiative.matrix.constant.base',
            'system.modifiers.matrix_initiative_dice': 'system.initiative.matrix.dice.base',

            // legacy migration key, because we didn't update change.value before (0.31.5)
            'system.force': 'system.attributes.force',
        };

        const valueMap: Record<string, string> = {
            'system.initiative.meatspace.base': 'system.initiative.meatspace.constant',
            'system.initiative.meatspace.base.base': 'system.initiative.meatspace.constant.base',
            'system.initiative.meatspace.base.value': 'system.initiative.meatspace.constant.value',
            'system.initiative.astral.base': 'system.initiative.astral.constant',
            'system.initiative.astral.base.base': 'system.initiative.astral.constant.base',
            'system.initiative.astral.base.value': 'system.initiative.astral.constant.value',
            'system.initiative.matrix.base': 'system.initiative.matrix.constant',
            'system.initiative.matrix.base.base': 'system.initiative.matrix.constant.base',
            'system.initiative.matrix.base.value': 'system.initiative.matrix.constant.value',
            'system.modifiers.meat_initiative': 'system.initiative.meatspace.constant.base',
            'system.modifiers.meat_initiative_dice': 'system.initiative.meatspace.dice.base',
            'system.modifiers.astral_initiative': 'system.initiative.astral.constant.base',
            'system.modifiers.astral_initiative_dice': 'system.initiative.astral.dice.base',
            'system.modifiers.matrix_initiative': 'system.initiative.matrix.constant.base',
            'system.modifiers.matrix_initiative_dice': 'system.initiative.matrix.dice.base',

            // legacy migration key, because we didn't update change.value before (0.31.5)
            'system.force': 'system.attributes.force.value',
        };

        this.migrateEffectChanges(effect, keyMap, valueMap);

        const system = effect.system;
        if (!system) return;

        const selectionFields = [
            'selection_attributes',
            'selection_categories',
            'selection_limits',
            'selection_skills',
            'selection_tests',
        ] as const;

        for (const field of selectionFields) {
            const values = system[field];
            if (!Array.isArray(values)) continue;

            system[field] = values
                .map(value => this._mapSelectionValue(value))
                .filter(value => typeof value === 'string');
        }
    }
}
