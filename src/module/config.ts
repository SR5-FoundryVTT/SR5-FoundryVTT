/**
 * Shadowrun 5 configuration for static values.
 *
 * NOTE: Do NOT import code into this file, as this might cause circular imports.
 */

export const SR5 = {
    itemTypes: {
        action: 'SR5.ItemTypes.Action',
        adept_power: 'SR5.ItemTypes.AdeptPower',
        ammo: 'SR5.ItemTypes.Ammo',
        armor: 'SR5.ItemTypes.Armor',
        bioware: 'SR5.ItemTypes.Bioware',
        complex_form: 'SR5.ItemTypes.ComplexForm',
        contact: 'SR5.ItemTypes.Contact',
        critter_power: 'SR5.ItemTypes.CritterPower',
        cyberware: 'SR5.ItemTypes.Cyberware',
        device: 'SR5.ItemTypes.Device',
        equipment: 'SR5.ItemTypes.Equipment',
        host: 'SR5.ItemTypes.Host',
        lifestyle: 'SR5.ItemTypes.Lifestyle',
        modification: 'SR5.ItemTypes.Modification',
        program: 'SR5.ItemTypes.Program',
        quality: 'SR5.ItemTypes.Quality',
        sin: 'SR5.ItemTypes.Sin',
        spell: 'SR5.ItemTypes.Spell',
        sprite_power: 'SR5.ItemTypes.SpritePower',
        weapon: 'SR5.ItemTypes.Weapon',
        call_in_action: 'ITEM.TypeCall_in_action'
    },

    // All available attributes. These are available as testable attributes across all actor types.
    attributes: {
        agility: 'SR5.AttrAgility',
        attack: 'SR5.MatrixAttrAttack',
        body: 'SR5.AttrBody',
        charisma: 'SR5.AttrCharisma',
        data_processing: 'SR5.MatrixAttrDataProc',
        edge: 'SR5.AttrEdge',
        essence: 'SR5.AttrEssence',
        firewall: 'SR5.MatrixAttrFirewall',
        intuition: 'SR5.AttrIntuition',
        logic: 'SR5.AttrLogic',
        magic: 'SR5.AttrMagic',
        reaction: 'SR5.AttrReaction',
        resonance: 'SR5.AttrResonance',
        sleaze: 'SR5.MatrixAttrSleaze',
        strength: 'SR5.AttrStrength',
        willpower: 'SR5.AttrWillpower',
        pilot: 'SR5.Vehicle.Stats.Pilot',
        force: 'SR5.Force'
    },

    /**
     * All labels for all limits used across all actor and item types.
     */
    limits: {
        physical: 'SR5.LimitPhysical',
        social: 'SR5.LimitSocial',
        mental: 'SR5.LimitMental',
        astral: 'SR5.LimitAstral',
        attack: 'SR5.MatrixAttrAttack',
        sleaze: 'SR5.MatrixAttrSleaze',
        data_processing: 'SR5.MatrixAttrDataProc',
        firewall: 'SR5.MatrixAttrFirewall',
        speed: 'SR5.Vehicle.Stats.Speed',
        sensor: 'SR5.Vehicle.Stats.Sensor',
        handling: 'SR5.Vehicle.Stats.Handling',
        magic: 'SR5.AttrMagic'
    },

    specialTypes: {
        mundane: 'SR5.Mundane',
        magic: 'SR5.Awakened',
        resonance: 'SR5.Emerged',
    },

    damageTypes: {
        physical: 'SR5.DmgTypePhysical',
        stun: 'SR5.DmgTypeStun',
        matrix: 'SR5.DmgTypeMatrix',
    },

    elementTypes: {
        fire: 'SR5.ElementFire',
        cold: 'SR5.ElementCold',
        acid: 'SR5.ElementAcid',
        electricity: 'SR5.ElementElectricity',
        radiation: 'SR5.ElementRadiation',
    },

    spellCategories: {
        combat: 'SR5.SpellCatCombat',
        detection: 'SR5.SpellCatDetection',
        health: 'SR5.SpellCatHealth',
        illusion: 'SR5.SpellCatIllusion',
        manipulation: 'SR5.SpellCatManipulation',
    },

    spellTypes: {
        physical: 'SR5.SpellTypePhysical',
        mana: 'SR5.SpellTypeMana',
    },

    spellRanges: {
        touch: 'SR5.SpellRangeTouch',
        los: 'SR5.SpellRangeLos',
        los_a: 'SR5.SpellRangeLosA',
    },

    combatSpellTypes: {
        direct: 'SR5.SpellCombatDirect',
        indirect: 'SR5.SpellCombatIndirect',
    },

    detectionSpellTypes: {
        directional: 'SR5.SpellDetectionDirectional',
        psychic: 'SR5.SpellDetectionPsychic',
        area: 'SR5.SpellDetectionArea',
    },

    illusionSpellTypes: {
        obvious: 'SR5.SpellIllusionObvious',
        realistic: 'SR5.SpellIllusionRealistic',
    },

    illusionSpellSenses: {
        'single-sense': 'SR5.SpellIllusionSingleSense',
        'multi-sense': 'SR5.SpellIllusionMultiSense',
    },

    attributeRolls: {
        composure: 'SR5.RollComposure',
        lift_carry: 'SR5.RollLiftCarry',
        judge_intentions: 'SR5.RollJudgeIntentions',
        memory: 'SR5.RollMemory',
    },

    matrixTargets: {
        persona: 'SR5.TargetPersona',
        device: 'SR5.TargetDevice',
        file: 'SR5.TargetFile',
        self: 'SR5.TargetSelf',
        sprite: 'SR5.TargetSprite',
        other: 'SR5.TargetOther',
    },

    durations: {
        instant: 'SR5.DurationInstant',
        sustained: 'SR5.DurationSustained',
        permanent: 'SR5.DurationPermanent',
    },

    weaponCategories: {
        range: 'SR5.WeaponCatRange',
        melee: 'SR5.WeaponCatMelee',
        thrown: 'SR5.WeaponCatThrown',
    },

    weaponRanges: {
        short: 'SR5.WeaponRangeShort',
        medium: 'SR5.WeaponRangeMedium',
        long: 'SR5.WeaponRangeLong',
        extreme: 'SR5.WeaponRangeExtreme',
    },

    qualityTypes: {
        positive: 'SR5.QualityTypePositive',
        negative: 'SR5.QualityTypeNegative',
    },

    adeptPower: {
        types: {
            active: 'SR5.AdeptPower.Types.Active',
            passive: 'SR5.AdeptPower.Types.Passive',
        },
    },

    deviceCategories: {
        commlink: 'SR5.DeviceCatCommlink',
        cyberdeck: 'SR5.DeviceCatCyberdeck',
    },

    cyberwareGrades: {
        standard: 'SR5.CyberwareGradeStandard',
        alpha: 'SR5.CyberwareGradeAlpha',
        beta: 'SR5.CyberwareGradeBeta',
        delta: 'SR5.CyberwareGradeDelta',
        used: 'SR5.CyberwareGradeUsed',
    },

    knowledgeSkillCategories: {
        street: 'SR5.KnowledgeSkillStreet',
        academic: 'SR5.KnowledgeSkillAcademic',
        professional: 'SR5.KnowledgeSkillProfessional',
        interests: 'SR5.KnowledgeSkillInterests',
    },

    activeSkills: {
        archery: 'SR5.SkillArchery',
        automatics: 'SR5.SkillAutomatics',
        blades: 'SR5.SkillBlades',
        clubs: 'SR5.SkillClubs',
        exotic_melee: 'SR5.SkillExoticMelee',
        exotic_range: 'SR5.SkillExoticRange',
        heavy_weapons: 'SR5.SkillHeavyWeapons',
        longarms: 'SR5.SkillLongarms',
        pistols: 'SR5.SkillPistols',
        throwing_weapons: 'SR5.SkillThrowingWeapons',
        unarmed_combat: 'SR5.SkillUnarmedCombat',
        disguise: 'SR5.SkillDisguise',
        diving: 'SR5.SkillDiving',
        escape_artist: 'SR5.SkillEscapeArtist',
        free_fall: 'SR5.SkillFreeFall',
        gymnastics: 'SR5.SkillGymnastics',
        palming: 'SR5.SkillPalming',
        perception: 'SR5.SkillPerception',
        running: 'SR5.SkillRunning',
        sneaking: 'SR5.SkillSneaking',
        survival: 'SR5.SkillSurvival',
        swimming: 'SR5.SkillSwimming',
        tracking: 'SR5.SkillTracking',
        con: 'SR5.SkillCon',
        etiquette: 'SR5.SkillEtiquette',
        impersonation: 'SR5.SkillImpersonation',
        instruction: 'SR5.SkillInstruction',
        intimidation: 'SR5.SkillIntimidation',
        leadership: 'SR5.SkillLeadership',
        negotiation: 'SR5.SkillNegotiation',
        performance: 'SR5.SkillPerformance',
        alchemy: 'SR5.SkillAlchemy',
        arcana: 'SR5.SkillArcana',
        artificing: 'SR5.SkillArtificing',
        assensing: 'SR5.SkillAssensing',
        astral_combat: 'SR5.SkillAstralCombat',
        banishing: 'SR5.SkillBanishing',
        binding: 'SR5.SkillBinding',
        counterspelling: 'SR5.SkillCounterspelling',
        disenchanting: 'SR5.SkillDisenchanting',
        ritual_spellcasting: 'SR5.SkillRitualSpellcasting',
        spellcasting: 'SR5.SkillSpellcasting',
        summoning: 'SR5.SkillSummoning',
        compiling: 'SR5.SkillCompiling',
        decompiling: 'SR5.SkillDecompiling',
        registering: 'SR5.SkillRegistering',
        aeronautics_mechanic: 'SR5.SkillAeronauticsMechanic',
        automotive_mechanic: 'SR5.SkillAutomotiveMechanic',
        industrial_mechanic: 'SR5.SkillIndustrialMechanic',
        nautical_mechanic: 'SR5.SkillNauticalMechanic',
        animal_handling: 'SR5.SkillAnimalHandling',
        armorer: 'SR5.SkillArmorer',
        artisan: 'SR5.SkillArtisan',
        biotechnology: 'SR5.SkillBiotechnology',
        chemistry: 'SR5.SkillChemistry',
        computer: 'SR5.SkillComputer',
        cybercombat: 'SR5.SkillCybercombat',
        cybertechnology: 'SR5.SkillCybertechnology',
        demolitions: 'SR5.SkillDemolitions',
        electronic_warfare: 'SR5.SkillElectronicWarfare',
        first_aid: 'SR5.SkillFirstAid',
        forgery: 'SR5.SkillForgery',
        hacking: 'SR5.SkillHacking',
        hardware: 'SR5.SkillHardware',
        locksmith: 'SR5.SkillLocksmith',
        medicine: 'SR5.SkillMedicine',
        navigation: 'SR5.SkillNavigation',
        software: 'SR5.SkillSoftware',
        gunnery: 'SR5.SkillGunnery',
        pilot_aerospace: 'SR5.SkillPilotAerospace',
        pilot_aircraft: 'SR5.SkillPilotAircraft',
        pilot_walker: 'SR5.SkillPilotWalker',
        pilot_ground_craft: 'SR5.SkillPilotGroundCraft',
        pilot_water_craft: 'SR5.SkillPilotWaterCraft',
        pilot_exotic_vehicle: 'SR5.SkillPilotExoticVehicle',
    },

    actionTypes: {
        none: 'SR5.ActionTypeNone',
        free: 'SR5.ActionTypeFree',
        simple: 'SR5.ActionTypeSimple',
        complex: 'SR5.ActionTypeComplex',
        varies: 'SR5.ActionTypeVaries',
    },

    // Use within action damage calculation (base <operator> attribute) => value
    actionDamageFormulaOperators: {
        add: '+',
        subtract: '-',
        multiply: '*',
        divide: '/'
    },

    matrixAttributes: {
        attack: 'SR5.MatrixAttrAttack',
        sleaze: 'SR5.MatrixAttrSleaze',
        data_processing: 'SR5.MatrixAttrDataProc',
        firewall: 'SR5.MatrixAttrFirewall',
    },

    initiativeCategories: {
        meatspace: 'SR5.InitCatMeatspace',
        astral: 'SR5.InitCatAstral',
        matrix: 'SR5.InitCatMatrix',
    },

    // Gear modification types. :) Not modifiers.
    modificationTypes: {
        weapon: 'SR5.Weapon',
        armor: 'SR5.Armor',
    },

    mountPoints: {
        barrel: 'SR5.Barrel',
        under_barrel: 'SR5.UnderBarrel',
        stock: 'SR5.Stock',
        top: 'SR5.Top',
        side: 'SR5.Side',
        internal: 'SR5.Internal',
    },

    lifestyleTypes: {
        street: 'SR5.LifestyleStreet',
        squatter: 'SR5.LifestyleSquatter',
        low: 'SR5.LifestyleLow',
        medium: 'SR5.LifestyleMiddle',
        high: 'SR5.LifestyleHigh',
        luxory: 'SR5.LifestyleLuxory',
        other: 'SR5.LifestyleOther',
    },

    kbmod: {
        ITEM_DESCR: 'ctrlKey',
        EDGE: 'altKey',
        HIDE_DIALOG: 'shiftKey',
    },

    /**
     * Labels for ALL actor types actor based local modifiers.
     * 
     * All modifiers across all actor types must be included here, this is only used for display.
     */
    actorModifiers: {
        armor: 'SR5.ModifierTypes.Armor',
        astral_initiative_dice: 'SR5.ModifierTypes.AstralDice',
        astral_initiative: 'SR5.ModifierTypes.AstralInit',
        astral_limit: 'SR5.ModifierTypes.AstralLimit',
        composure: 'SR5.ModifierTypes.Composure',
        defense: 'SR5.ModifierTypes.Defense',
        defense_dodge: 'SR5.ModifierTypes.DefenseDodge',
        defense_block: 'SR5.ModifierTypes.DefenseBlock',
        defense_parry: 'SR5.ModifierTypes.DefenseParry',
        drain: 'SR5.ModifierTypes.Drain',
        essence: 'SR5.ModifierTypes.Essence',
        fade: 'SR5.ModifierTypes.Fade',
        global: 'SR5.ModifierTypes.Global',
        judge_intentions: 'SR5.ModifierTypes.JudgeIntentions',
        lift_carry: 'SR5.ModifierTypes.LiftCarry',
        matrix_initiative_dice: 'SR5.ModifierTypes.MatrixDice',
        matrix_initiative: 'SR5.ModifierTypes.MatrixInit',
        matrix_track: 'SR5.ModifierTypes.MatrixTrack',
        meat_initiative_dice: 'SR5.ModifierTypes.MeatSpaceDice',
        meat_initiative: 'SR5.ModifierTypes.MeatSpaceInit',
        memory: 'SR5.ModifierTypes.Memory',
        mental_limit: 'SR5.ModifierTypes.MentalLimit',
        multi_defense: 'SR5.ModifierTypes.DefenseMulti',
        pain_tolerance_physical: 'SR5.ModifierTypes.PainTolerancePhysical',
        pain_tolerance_stun: 'SR5.ModifierTypes.PainToleranceStun',
        physical_limit: 'SR5.ModifierTypes.PhysicalLimit',
        physical_overflow_track: 'SR5.ModifierTypes.PhysicalOverflowTrack',
        physical_track: 'SR5.ModifierTypes.PhysicalTrack',
        run: 'SR5.ModifierTypes.Run',
        soak: 'SR5.ModifierTypes.Soak',
        social_limit: 'SR5.ModifierTypes.SocialLimit',
        stun_track: 'SR5.ModifierTypes.StunTrack',
        walk: 'SR5.ModifierTypes.Walk',
        wound_tolerance: 'SR5.ModifierTypes.WoundTolerance',
    },

    /**
     * Tooltip labels used for actor modifiers. Key should use actorModifiers key.
     */
    actorModifiersTooltip: {
        armor: 'SR5.Tooltips.Modifiers.armor',
        astral_initiative_dice: 'SR5.Tooltips.Modifiers.astral_initiative_dice',
        astral_initiative: 'SR5.Tooltips.Modifiers.astral_initiative',
        astral_limit: 'SR5.Tooltips.Modifiers.astral_limit',
        composure: 'SR5.Tooltips.Modifiers.composure',
        defense: 'SR5.Tooltips.Modifiers.defense',
        defense_block: 'SR5.Tooltips.Modifiers.defense_block',
        defense_dodge: 'SR5.Tooltips.Modifiers.defense_dodge',
        defense_parry: 'SR5.Tooltips.Modifiers.defense_parry',
        drain: 'SR5.Tooltips.Modifiers.drain',
        essence: 'SR5.Tooltips.Modifiers.essence',
        fade: 'SR5.Tooltips.Modifiers.fade',
        global: 'SR5.Tooltips.Modifiers.global',
        judge_intentions: 'SR5.Tooltips.Modifiers.judge_intentions',
        lift_carry: 'SR5.Tooltips.Modifiers.lift_carry',
        matrix_initiative_dice: 'SR5.Tooltips.Modifiers.matrix_initiative_dice',
        matrix_initiative: 'SR5.Tooltips.Modifiers.matrix_initiative',
        matrix_track: 'SR5.Tooltips.Modifiers.matrix_track',
        meat_initiative_dice: 'SR5.Tooltips.Modifiers.meat_initiative_dice',
        meat_initiative: 'SR5.Tooltips.Modifiers.meat_initiative',
        memory: 'SR5.Tooltips.Modifiers.memory',
        mental_limit: 'SR5.Tooltips.Modifiers.mental_limit',
        multi_defense: 'SR5.Tooltips.Modifiers.multi_defense',
        pain_tolerance_physical: 'SR5.Tooltips.Modifiers.pain_tolerance_physical',
        pain_tolerance_stun: 'SR5.Tooltips.Modifiers.pain_tolerance_stun',
        physical_limit: 'SR5.Tooltips.Modifiers.physical_limit',
        physical_overflow_track: 'SR5.Tooltips.Modifiers.physical_overflow_track',
        physical_track: 'SR5.Tooltips.Modifiers.physical_track',
        run: 'SR5.Tooltips.Modifiers.run',
        soak: 'SR5.Tooltips.Modifiers.soak',
        social_limit: 'SR5.Tooltips.Modifiers.social_limit',
        stun_track: 'SR5.Tooltips.Modifiers.stun_track',
        walk: 'SR5.Tooltips.Modifiers.walk',
        wound_tolerance: 'SR5.Tooltips.Modifiers.wound_tolerance',
    },

    /**
     * Modification types used for actions and general success tests, based on actors.
     *
     * These are meant to be used with the Modifiers and SituationModifier classes and SR5Actor.modifiers.totalFor('wounds').
     *
     * There are additional item based modifiers that aren't present here.
     * 
     * NOTE: Adding a modifier type here will directly affect modifiers shown on item actions for user selection.
     */
    modifierTypes: {
        armor: 'SR5.ModifierTypes.Armor',
        composure: 'SR5.ModifierTypes.Composure',
        defense: 'SR5.ModifierTypes.Defense',
        multi_defense: 'SR5.ModifierTypes.DefenseMulti',
        drain: 'SR5.ModifierTypes.Drain',
        environmental: 'SR5.ModifierTypes.Environmental',
        ['environmental.light']: 'SR5.ModifierTypes.EnvironmentalLight',
        ['environmental.visibility']: 'SR5.ModifierTypes.EnvironmentalVisibility',
        ['environmental.wind']: 'SR5.ModifierTypes.EnvironmentalWind',
        ['environmental.range']: 'SR5.ModifierTypes.EnvironmentalRange',
        background_count: 'SR5.ModifierTypes.BackgroundCount',
        noise: 'SR5.ModifierTypes.Noise',
        fade: 'SR5.ModifierTypes.Fade',
        global: 'SR5.ModifierTypes.Global',
        judge_intentions: 'SR5.ModifierTypes.JudgeIntentions',
        lift_carry: 'SR5.ModifierTypes.LiftCarry',
        memory: 'SR5.ModifierTypes.Memory',
        soak: 'SR5.ModifierTypes.Soak',
        wounds: 'SR5.ModifierTypes.Wounds',
        recoil: 'SR5.ModifierTypes.Recoil'
    },

    /**
     * Define here what kind of active test is to be used for the different weapon categories as a main action test.
     */
    weaponCategoryActiveTests: {
        'range': 'RangedAttackTest',
        'melee': 'MeleeAttackTest',
        'thrown': 'ThrownAttackTest'
    },

    /**
     * When casting tests from these item types, use these tests as active tests
     */
    activeTests: {
        'spell': 'SpellCastingTest',
        'complex_form': 'ComplexFormTest'
    },

    /**
     * Using different active test details should result in these opposed tests
     * 
     * Structure: {
     *  [item.type]: {[item.system.type]}: 'OpposedTest'
     * }
     */
    opposedTests: {
        'spell': {
            'combat': 'CombatSpellDefenseTest'
        }
    },

    /**
     * Using different resist tests for the oppositing depending on active tests details
     *  Structure: {
     *  [item.type]: {[item.system.type]}: 'OpposedTest'
     * }
     */
    opposedResistTests: {
        'spell': {
            'combat': 'PhysicalResistTest'
        }
    },

    /**
     * When a test is cast an active test this defines what tests should follow that tests completion
     */
    followedTests: {
        'SpellCastingTest': 'DrainTest'
    },

    // When a firemode with suppression is used, this test should defend against it.
    suppressionDefenseTest: 'SuppressionDefenseTest',

    /**
     * Names of FoundryVTT packs supplied by the system to be used as action sources.
     */
    packNames: {
        'generalActions': 'General Actions',
        'matrixActions': 'Matrix Actions'
    },

    programTypes: {
        common_program: 'SR5.CommonProgram',
        hacking_program: 'SR5.HackingProgram',
        agent: 'SR5.Agent',
    },

    spiritTypes: {
        // base types
        air: 'SR5.Spirit.Types.Air',
        aircraft: 'SR5.Spirit.Types.Aircraft',
        airwave: 'SR5.Spirit.Types.Airwave',
        automotive: 'SR5.Spirit.Types.Automotive',
        beasts: 'SR5.Spirit.Types.Beasts',
        ceramic: 'SR5.Spirit.Types.Ceramic',
        earth: 'SR5.Spirit.Types.Earth',
        energy: 'SR5.Spirit.Types.Energy',
        fire: 'SR5.Spirit.Types.Fire',
        guardian: 'SR5.Spirit.Types.Guardian',
        guidance: 'SR5.Spirit.Types.Guidance',
        man: 'SR5.Spirit.Types.Man',
        metal: 'SR5.Spirit.Types.Metal',
        plant: 'SR5.Spirit.Types.Plant',
        ship: 'SR5.Spirit.Types.Ship',
        task: 'SR5.Spirit.Types.Task',
        train: 'SR5.Spirit.Types.Train',
        water: 'SR5.Spirit.Types.Water',

        // toxic types
        toxic_air: 'SR5.Spirit.Types.ToxicAir',
        toxic_beasts: 'SR5.Spirit.Types.ToxicBeasts',
        toxic_earth: 'SR5.Spirit.Types.ToxicEarth',
        toxic_fire: 'SR5.Spirit.Types.ToxicFire',
        toxic_man: 'SR5.Spirit.Types.ToxicMan',
        toxic_water: 'SR5.Spirit.Types.ToxicWater',

        // blood types
        blood: 'SR5.Spirit.Types.Blood',

        // shadow types
        muse: 'SR5.Spirit.Types.Muse',
        nightmare: 'SR5.Spirit.Types.Nightmare',
        shade: 'SR5.Spirit.Types.Shade',
        succubus: 'SR5.Spirit.Types.Succubus',
        wraith: 'SR5.Spirit.Types.Wraith',

        // shedim types
        shedim: 'SR5.Spirit.Types.Shedim',
        master_shedim: 'SR5.Spirit.Types.MasterShedim',

        // insect types
        caretaker: 'SR5.Spirit.Types.Caretaker',
        nymph: 'SR5.Spirit.Types.Nymph',
        scout: 'SR5.Spirit.Types.Scout',
        soldier: 'SR5.Spirit.Types.Soldier',
        worker: 'SR5.Spirit.Types.Worker',
        queen: 'SR5.Spirit.Types.Queen',
    },

    /**
     * Actor types that can be called in using the call in action type and be
     * set in it's system.action_type property.
     */
    callInActorTypes: {
        'spirit': 'ACTOR.TypeSpirit',
        'sprite': 'ACTOR.TypeSprite'
    },

    critterPower: {
        categories: {
            mundane: 'SR5.CritterPower.Categories.Mundane',
            paranormal: 'SR5.CritterPower.Categories.Paranormal',
            free_spirit: 'SR5.CritterPower.Categories.FreeSpirit',
            emergent: 'SR5.CritterPower.Categories.Emergent',
            shapeshifter: 'SR5.CritterPower.Categories.Shapeshifter',
            drake: 'SR5.CritterPower.Categories.Drake',
            echoes: 'SR5.CritterPower.Categories.Echoes',
            weakness: 'SR5.CritterPower.Categories.Weakness',
            paranormal_infected: 'SR5.CritterPower.Categories.ParanormalInfected',
        },
        types: {
            mana: 'SR5.CritterPower.Types.Mana',
            physical: 'SR5.CritterPower.Types.Physical',
        },
        ranges: {
            los: 'SR5.CritterPower.Ranges.LineOfSight',
            self: 'SR5.CritterPower.Ranges.Self',
            touch: 'SR5.CritterPower.Ranges.Touch',
            los_a: 'SR5.CritterPower.Ranges.LineOfSightArea',
            special: 'SR5.CritterPower.Ranges.Special',
        },
        durations: {
            always: 'SR5.CritterPower.Durations.Always',
            instant: 'SR5.CritterPower.Durations.Instant',
            sustained: 'SR5.CritterPower.Durations.Sustained',
            permanent: 'SR5.CritterPower.Durations.Permanent',
            special: 'SR5.CritterPower.Durations.Special',
        },
    },

    spriteTypes: {
        courier: 'SR5.Sprite.Types.Courier',
        crack: 'SR5.Sprite.Types.Crack',
        data: 'SR5.Sprite.Types.Data',
        fault: 'SR5.Sprite.Types.Fault',
        machine: 'SR5.Sprite.Types.Machine',
    },

    vehicle: {
        types: {
            air: 'SR5.Vehicle.Types.Air',
            aerospace: 'SR5.Vehicle.Types.Aerospace',
            ground: 'SR5.Vehicle.Types.Ground',
            water: 'SR5.Vehicle.Types.Water',
            walker: 'SR5.Vehicle.Types.Walker',
            exotic: 'SR5.Vehicle.Types.Exotic',
        },
        stats: {
            handling: 'SR5.Vehicle.Stats.Handling',
            off_road_handling: 'SR5.Vehicle.Stats.OffRoadHandling',
            speed: 'SR5.Vehicle.Stats.Speed',
            off_road_speed: 'SR5.Vehicle.Stats.OffRoadSpeed',
            acceleration: 'SR5.Vehicle.Stats.Acceleration',
            pilot: 'SR5.Vehicle.Stats.Pilot',
            sensor: 'SR5.Vehicle.Stats.Sensor',
        },
        control_modes: {
            manual: 'SR5.Vehicle.ControlModes.Manual',
            remote: 'SR5.Vehicle.ControlModes.Remote',
            rigger: 'SR5.Vehicle.ControlModes.Rigger',
            autopilot: 'SR5.Vehicle.ControlModes.Autopilot',
        },
        environments: {
            speed: 'SR5.Vehicle.Environments.Speed',
            handling: 'SR5.Vehicle.Environments.Handling',
        },
    },

    ic: {
        types: {
            acid: "SR5.IC.Types.Acid",
            binder: "SR5.IC.Types.Binder",
            black_ic: "SR5.IC.Types.BlackIC",
            blaster: "SR5.IC.Types.Blaster",
            crash: "SR5.IC.Types.Crash",
            jammer: "SR5.IC.Types.Jammer",
            killer: "SR5.IC.Types.Killer",
            marker: "SR5.IC.Types.Marker",
            patrol: "SR5.IC.Types.Patrol",
            probe: "SR5.IC.Types.Probe",
            scramble: "SR5.IC.Types.Scramble",
            sparky: "SR5.IC.Types.Sparky",
            tar_baby: "SR5.IC.Types.TarBaby",
            track: "SR5.IC.Types.Track"
        }
    },

    character: {
        types: {
            human: 'SR5.Character.Types.Human',
            elf: 'SR5.Character.Types.Elf',
            ork: 'SR5.Character.Types.Ork',
            dwarf: 'SR5.Character.Types.Dwarf',
            troll: 'SR5.Character.Types.Troll',
        },
    },

    /**
     * The available range weapon modes for to SR5#424
     * 
     * These are the mode selectors on the weapon. The term 'fire mode' 
     * is only used to describe as the combination of weapon mode and action
     * used, causing a specific fire mode.
     * 
     * NOTE: This list is also used for sorting order of ranged weapon mode.
     *       Alter it with care.
     */
    rangeWeaponMode: [
        'single_shot',
        'semi_auto',
        'burst_fire',
        'full_auto'
    ],

    rangeWeaponModeLabel: {
        'single_shot': 'SR5.WeaponModeSingleShot',
        'semi_auto': 'SR5.WeaponModeSemiAuto',
        'burst_file': 'SR5.WeaponModeBurstFire',
        'full_auto': 'SR5.WeaponModeFullAuto'
    },

    /**
     * The preconfigured default Shadowrun firemodes according to SR5#180
     * 
     * These are separate from ranged weapon modes but depend on the selected 
     * ranged weapon mode.
     */
    fireModes: [
    {
        label: "SR5.WeaponModeSingleShot",
        value: 1,
        recoil: false,
        defense: 0,
        suppression: false,
        action: 'simple',
        mode: 'single_shot'
    },
    {
        label: "SR5.WeaponModeSemiAutoShort",
        value: 1,
        recoil: true,
        defense: 0,
        suppression: false,
        action: 'simple',
        mode: 'semi_auto'
    },
    {
        label: "SR5.WeaponModeSemiAutoBurst",
        value: 3,
        recoil: true,
        defense: -2,
        suppression: false,
        action: 'complex',
        mode: 'semi_auto'
    },
    
    {
        label: "SR5.WeaponModeBurstFire",
        value: 3,
        recoil: true,
        defense: -2,
        suppression: false,
        action: 'simple',
        mode: 'burst_fire'
    },
    {
        label: "SR5.WeaponModeBurstFireLong",
        value: 6,
        recoil: true,
        defense: -5,
        suppression: false,
        action: 'complex',
        mode: 'burst_fire',
    },
    {
        label: "SR5.WeaponModeFullAutoShort",
        value: 6,
        recoil: true,
        defense: -5,
        suppression: false,
        action: 'simple',
        mode: 'full_auto'
    },
    {
        label: 'SR5.WeaponModeFullAutoLong',
        value: 10,
        recoil: true,
        defense: -9,
        suppression: false,
        action: 'complex',
        mode: 'full_auto'
    },
    {
        label: 'SR5.Suppressing',
        value: 20,
        recoil: false,
        defense: 0,
        suppression: true,
        action: 'complex',
        mode: 'full_auto'
    }
    ] as Shadowrun.FireModeData[],

    itemSubTypes: {
        action: [],
        adept_power: [],
        ammo: [],
        armor: [],
        bioware: [],
        complex_form: [],
        contact: [],
        critter_power: [],
        cyberware: [],
        device: [],
        equipment: [],
        host: [],
        lifestyle: [],
        modification: [],
        program: [],
        quality: [],
        sin: [],
        spell: [],
        sprite_power: [],
        weapon: []
    }
};
