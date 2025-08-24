/**
 * Shadowrun 5 configuration for static values.
 *
 * NOTE: Do NOT import code into this file, as this might cause circular imports.
 */

export const SR5 = {
    compendiums: {
        root: 'SR5.Compendiums.Root',

        // Actors
        critter: 'SR5.Compendiums.Critter',
        drone: 'SR5.Compendiums.Drone',

        //Items
        gear: 'SR5.Compendiums.Gear',
        trait: 'SR5.Compendiums.Trait',
        magic: 'SR5.Compendiums.Magic',
        modification: 'SR5.Compendiums.Modification',
        weapon: 'SR5.Compendiums.Weapon',
    },
    
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
        echo: 'SR5.ItemTypes.Echo',
        equipment: 'SR5.ItemTypes.Equipment',
        host: 'SR5.ItemTypes.Host',
        lifestyle: 'SR5.ItemTypes.Lifestyle',
        metamagic: 'SR5.ItemTypes.Metamagic',
        modification: 'SR5.ItemTypes.Modification',
        program: 'SR5.ItemTypes.Program',
        quality: 'SR5.ItemTypes.Quality',
        ritual: 'SR5.ItemTypes.Ritual',
        sin: 'SR5.ItemTypes.Sin',
        spell: 'SR5.ItemTypes.Spell',
        sprite_power: 'SR5.ItemTypes.SpritePower',
        weapon: 'SR5.ItemTypes.Weapon',
        call_in_action: 'TYPES.Item.call_in_action'
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
        force: 'SR5.Force',
        initiation: 'SR5.Initiation',
        submersion: 'SR5.Submersion',
        rating: 'SR5.Rating',
    },

    mentalAttributes: ['charisma', 'intuition', 'logic', 'willpower'],
    physicalAttributes: ['agility', 'body', 'reaction', 'strength'],

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
        magic: 'SR5.AttrMagic',
        initiation: 'SR5.Initiation'
    },

    specialTypes: {
        mundane: 'SR5.Mundane',
        magic: 'SR5.Awakened',
        resonance: 'SR5.Emerged',
    },

    damageTypes: {
        physical: 'SR5.DmgTypePhysical',
        stun: 'SR5.DmgTypeStun',
        matrix: 'SR5.DmgTypeMatrix'
    },

    biofeedbackOptions: {
        // create an empty string option, this should not be needed after appv2
        '': '',
        physical: 'SR5.DmgTypePhysical',
        stun: 'SR5.DmgTypeStun',
    },

    weaponRangeCategories: {
        manual: {
            label: 'SR5.Weapon.Range.Category.Manual',
        },
        taser: {
            label: 'SR5.Weapon.Range.Category.Taser',
            ranges: {
                short: 5,
                medium: 10,
                long: 15,
                extreme: 20,
            },
        },
        holdOutPistol: {
            label: 'SR5.Weapon.Range.Category.HoldOutPistol',
            ranges: {
                short: 5,
                medium: 15,
                long: 30,
                extreme: 50,
            },
        },
        lightPistol: {
            label: 'SR5.Weapon.Range.Category.LightPistol',
            ranges: {
                short: 5,
                medium: 15,
                long: 30,
                extreme: 50,
            },
        },
        heavyPistol: {
            label: 'SR5.Weapon.Range.Category.HeavyPistol',
            ranges: {
                short: 5,
                medium: 20,
                long: 40,
                extreme: 60,
            },
        },
        machinePistol: {
            label: 'SR5.Weapon.Range.Category.MachinePistol',
            ranges: {
                short: 5,
                medium: 15,
                long: 30,
                extreme: 50,
            },
        },
        smg: {
            label: 'SR5.Weapon.Range.Category.SMG',
            ranges: {
                short: 10,
                medium: 40,
                long: 80,
                extreme: 150,
            },
        },
        assaultRifle: {
            label: 'SR5.Weapon.Range.Category.AssaultRifle',
            ranges: {
                short: 25,
                medium: 150,
                long: 350,
                extreme: 550,
            },
        },
        shotgunFlechette: {
            label: 'SR5.Weapon.Range.Category.ShotgunFlechette',
            ranges: {
                short: 15,
                medium: 30,
                long: 45,
                extreme: 60,
            },
        },
        shotgunSlug: {
            label: 'SR5.Weapon.Range.Category.ShotgunSlug',
            ranges: {
                short: 10,
                medium: 40,
                long: 80,
                extreme: 150,
            },
        },
        sniperRifle: {
            label: 'SR5.Weapon.Range.Category.SniperRifle',
            ranges: {
                short: 50,
                medium: 350,
                long: 800,
                extreme: 1500,
            },
        },
        sportingRifle: {
            label: 'SR5.Weapon.Range.Category.SportingRifle',
            ranges: {
                short: 50,
                medium: 250,
                long: 500,
                extreme: 750,
            },
        },
        lightMachinegun: {
            label: 'SR5.Weapon.Range.Category.LightMachinegun',
            ranges: {
                short: 25,
                medium: 200,
                long: 400,
                extreme: 800,
            },
        },
        mediumHeavyMachinegun: {
            label: 'SR5.Weapon.Range.Category.MediumHeavyMachinegun',
            ranges: {
                short: 40,
                medium: 250,
                long: 750,
                extreme: 1200,
            },
        },
        assaultCannon: {
            label: 'SR5.Weapon.Range.Category.AssaultCannon',
            ranges: {
                short: 50,
                medium: 300,
                long: 750,
                extreme: 1500,
            },
        },
        grenadeLauncher: {
            label: 'SR5.Weapon.Range.Category.GrenadeLauncher',
            ranges: {
                short: 50,
                medium: 100,
                long: 150,
                extreme: 500,
            },
        },
        missileLauncher: {
            label: 'SR5.Weapon.Range.Category.MissileLauncher',
            ranges: {
                short: 70,
                medium: 150,
                long: 450,
                extreme: 1500,
            },
        },
        bow: {
            label: 'SR5.Weapon.Range.Category.Bow',
            ranges: {
                short: 1,
                medium: 10,
                long: 30,
                extreme: 60,
                attribute: 'strength',
            },
        },
        lightCrossbow: {
            label: 'SR5.Weapon.Range.Category.LightCrossbow',
            ranges: {
                short: 6,
                medium: 24,
                long: 60,
                extreme: 120,
            },
        },
        mediumCrossbow: {
            label: 'SR5.Weapon.Range.Category.MediumCrossbow',
            ranges: {
                short: 9,
                medium: 36,
                long: 90,
                extreme: 150,
            },
        },
        heavyCrossbow: {
            label: 'SR5.Weapon.Range.Category.HeavyCrossbow',
            ranges: {
                short: 15,
                medium: 45,
                long: 120,
                extreme: 180,
            },
        },
        thrownKnife: {
            label: 'SR5.Weapon.Range.Category.ThrownKnife',
            ranges: {
                short: 1,
                medium: 2,
                long: 3,
                extreme: 5,
                attribute: 'strength',
            },
        },
        net: {
            label: 'SR5.Weapon.Range.Category.Net',
            ranges: {
                short: 0.5,
                medium: 1,
                long: 1.5,
                extreme: 2.5,
                attribute: 'strength',
            },
        },
        shuriken: {
            label: 'SR5.Weapon.Range.Category.Shuriken',
            ranges: {
                short: 1,
                medium: 2,
                long: 5,
                extreme: 7,
                attribute: 'strength',
            },
        },
        standardThrownGrenade: {
            label: 'SR5.Weapon.Range.Category.StandardThrownGrenade',
            ranges: {
                short: 2,
                medium: 4,
                long: 6,
                extreme: 10,
                attribute: 'strength',
            },
        },
        aerodynamicThrownGrenade: {
            label: 'SR5.Weapon.Range.Category.AerodynamicThrownGrenade',
            ranges: {
                short: 2,
                medium: 4,
                long: 8,
                extreme: 15,
                attribute: 'strength',
            },
        },
        harpoonGun: {
            label: 'SR5.Weapon.Range.Category.HarpoonGun',
            ranges: {
                short: 5,
                medium: 20,
                long: 40,
                extreme: 60,
            },
        },
        harpoonGunUnderwater: {
            label: 'SR5.Weapon.Range.Category.HarpoonGunUnderwater',
            ranges: {
                short: 6,
                medium: 24,
                long: 60,
                extreme: 120,
            },
        },
        flamethrower: {
            label: 'SR5.Weapon.Range.Category.Flamethrower',
            ranges: {
                short: 15,
                medium: 20,
                long: -1,
                extreme: -1,
            },
        }

    },

    elementTypes: {
        fire: 'SR5.ElementFire',
        cold: 'SR5.ElementCold',
        acid: 'SR5.ElementAcid',
        electricity: 'SR5.ElementElectricity',
        radiation: 'SR5.ElementRadiation',
    },

    spellCategories: {
        combat: 'SR5.Spell.CatCombat',
        detection: 'SR5.Spell.CatDetection',
        health: 'SR5.Spell.CatHealth',
        illusion: 'SR5.Spell.CatIllusion',
        manipulation: 'SR5.Spell.CatManipulation'
    },

    spellTypes: {
        physical: 'SR5.Spell.TypePhysical',
        mana: 'SR5.Spell.TypeMana',
    },

    spellRanges: {
        touch: 'SR5.Spell.RangeTouch',
        los: 'SR5.Spell.RangeLos',
        los_a: 'SR5.Spell.RangeLosA',
    },

    combatSpellTypes: {
        direct: 'SR5.Spell.CombatDirect',
        indirect: 'SR5.Spell.CombatIndirect',
    },

    detectionSpellTypes: {
        directional: 'SR5.Spell.DetectionDirectional',
        psychic: 'SR5.Spell.DetectionPsychic',
        area: 'SR5.Spell.DetectionArea',
    },

    illusionSpellTypes: {
        obvious: 'SR5.Spell.IllusionObvious',
        realistic: 'SR5.Spell.IllusionRealistic',
    },

    illusionSpellSenses: {
        'single-sense': 'SR5.Spell.IllusionSingleSense',
        'multi-sense': 'SR5.Spell.IllusionMultiSense',
    },

    attributeRolls: {
        composure: 'SR5.RollComposure',
        lift_carry: 'SR5.RollLiftCarry',
        judge_intentions: 'SR5.RollJudgeIntentions',
        memory: 'SR5.RollMemory',
    },

    /**
     * Used for complex form targeting options.
     */
    matrixTargets: {
        persona: 'SR5.TargetPersona',
        device: 'SR5.TargetDevice',
        file: 'SR5.TargetFile',
        self: 'SR5.TargetSelf',
        sprite: 'SR5.TargetSprite',
        host: 'TYPES.Item.host',
        ic: 'TYPES.Actor.ic',
        other: 'SR5.TargetOther',
    },

    gridCategories: {
        local: 'SR5.Labels.Matrix.Local',
        global: 'SR5.Labels.Matrix.Global',
        public: 'SR5.Labels.Matrix.Public'
    },

    durations: {
        instant: 'SR5.DurationInstant',
        sustained: 'SR5.DurationSustained',
        permanent: 'SR5.DurationPermanent',
    },

    weaponCategories: {
        range: 'SR5.Weapon.Category.Range',
        melee: 'SR5.Weapon.Category.Melee',
        thrown: 'SR5.Weapon.Category.Thrown',
    },

    weaponCliptypes: {
        removable_clip: 'SR5.Weapon.Cliptype.RemovableClip',
        break_action:'SR5.Weapon.Cliptype.BreakAction',
        belt_fed:'SR5.Weapon.Cliptype.BeltFed',
        internal_magazin:'SR5.Weapon.Cliptype.InternalMagazin',
        muzzle_loader:'SR5.Weapon.Cliptype.MuzzleLoader',
        cylinder:'SR5.Weapon.Cliptype.Cylinder',
        drum:'SR5.Weapon.Cliptype.Drum',
        bow:'SR5.Weapon.Cliptype.Bow',
    },

    weaponRanges: {
        short: 'SR5.Weapon.Range.Short',
        medium: 'SR5.Weapon.Range.Medium',
        long: 'SR5.Weapon.Range.Long',
        extreme: 'SR5.Weapon.Range.Extreme',
    },

    qualityTypes: {
        positive: 'SR5.QualityTypePositive',
        negative: 'SR5.QualityTypeNegative',
        lifemodule: 'SR5.QualityTypeLifeModule'
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
        rcc: 'SR5.DeviceCatRCC',
    },

    cyberwareGrades: {
        standard: 'SR5.CyberwareGradeStandard',
        alpha: 'SR5.CyberwareGradeAlpha',
        beta: 'SR5.CyberwareGradeBeta',
        delta: 'SR5.CyberwareGradeDelta',
        gamma: 'SR5.CyberwareGradeGamma',
        grey: 'SR5.CyberwareGradeGrey',
        used: 'SR5.CyberwareGradeUsed',
    },

    knowledgeSkillCategories: {
        street: 'SR5.KnowledgeSkillStreet',
        academic: 'SR5.KnowledgeSkillAcademic',
        professional: 'SR5.KnowledgeSkillProfessional',
        interests: 'SR5.KnowledgeSkillInterests',
    },

    activeSkills: {
        archery: 'SR5.Skill.Archery',
        automatics: 'SR5.Skill.Automatics',
        blades: 'SR5.Skill.Blades',
        clubs: 'SR5.Skill.Clubs',
        exotic_melee: 'SR5.Skill.ExoticMelee',
        exotic_range: 'SR5.Skill.ExoticRange',
        heavy_weapons: 'SR5.Skill.HeavyWeapons',
        longarms: 'SR5.Skill.Longarms',
        pistols: 'SR5.Skill.Pistols',
        throwing_weapons: 'SR5.Skill.ThrowingWeapons',
        unarmed_combat: 'SR5.Skill.UnarmedCombat',
        disguise: 'SR5.Skill.Disguise',
        diving: 'SR5.Skill.Diving',
        escape_artist: 'SR5.Skill.EscapeArtist',
        free_fall: 'SR5.Skill.FreeFall',
        gymnastics: 'SR5.Skill.Gymnastics',
        palming: 'SR5.Skill.Palming',
        perception: 'SR5.Skill.Perception',
        running: 'SR5.Skill.Running',
        sneaking: 'SR5.Skill.Sneaking',
        survival: 'SR5.Skill.Survival',
        swimming: 'SR5.Skill.Swimming',
        tracking: 'SR5.Skill.Tracking',
        con: 'SR5.Skill.Con',
        etiquette: 'SR5.Skill.Etiquette',
        impersonation: 'SR5.Skill.Impersonation',
        instruction: 'SR5.Skill.Instruction',
        intimidation: 'SR5.Skill.Intimidation',
        leadership: 'SR5.Skill.Leadership',
        negotiation: 'SR5.Skill.Negotiation',
        performance: 'SR5.Skill.Performance',
        alchemy: 'SR5.Skill.Alchemy',
        arcana: 'SR5.Skill.Arcana',
        artificing: 'SR5.Skill.Artificing',
        assensing: 'SR5.Skill.Assensing',
        astral_combat: 'SR5.Skill.AstralCombat',
        banishing: 'SR5.Skill.Banishing',
        binding: 'SR5.Skill.Binding',
        counterspelling: 'SR5.Skill.Counterspelling',
        disenchanting: 'SR5.Skill.Disenchanting',
        ritual_spellcasting: 'SR5.Skill.RitualSpellcasting',
        spellcasting: 'SR5.Skill.Spellcasting',
        summoning: 'SR5.Skill.Summoning',
        compiling: 'SR5.Skill.Compiling',
        decompiling: 'SR5.Skill.Decompiling',
        registering: 'SR5.Skill.Registering',
        aeronautics_mechanic: 'SR5.Skill.AeronauticsMechanic',
        automotive_mechanic: 'SR5.Skill.AutomotiveMechanic',
        industrial_mechanic: 'SR5.Skill.IndustrialMechanic',
        nautical_mechanic: 'SR5.Skill.NauticalMechanic',
        animal_handling: 'SR5.Skill.AnimalHandling',
        armorer: 'SR5.Skill.Armorer',
        artisan: 'SR5.Skill.Artisan',
        biotechnology: 'SR5.Skill.Biotechnology',
        chemistry: 'SR5.Skill.Chemistry',
        computer: 'SR5.Skill.Computer',
        cybercombat: 'SR5.Skill.Cybercombat',
        cybertechnology: 'SR5.Skill.Cybertechnology',
        demolitions: 'SR5.Skill.Demolitions',
        electronic_warfare: 'SR5.Skill.ElectronicWarfare',
        first_aid: 'SR5.Skill.FirstAid',
        forgery: 'SR5.Skill.Forgery',
        hacking: 'SR5.Skill.Hacking',
        hardware: 'SR5.Skill.Hardware',
        locksmith: 'SR5.Skill.Locksmith',
        medicine: 'SR5.Skill.Medicine',
        navigation: 'SR5.Skill.Navigation',
        software: 'SR5.Skill.Software',
        gunnery: 'SR5.Skill.Gunnery',
        pilot_aerospace: 'SR5.Skill.PilotAerospace',
        pilot_aircraft: 'SR5.Skill.PilotAircraft',
        pilot_walker: 'SR5.Skill.PilotWalker',
        pilot_ground_craft: 'SR5.Skill.PilotGroundCraft',
        pilot_water_craft: 'SR5.Skill.PilotWaterCraft',
        pilot_exotic_vehicle: 'SR5.Skill.PilotExoticVehicle',
        flight: 'SR5.Skill.Flight'
    },

    /**
     * Some skills are created on the fly and don't exist on all actors.
     * These values are used for those.
     */
    activeSkillAttribute: {
        flight: 'agility'
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

    // Map all Shadowrun.ActionCategories to their matching labels.
    // For more information around action categories, see type documentation.
    actionCategories: {
        'addiction_mental': "SR5.ActionCategory.AddictionMental",
        'addiction_physical': "SR5.ActionCategory.AddictionPhysical",
        'addiction': "SR5.ActionCategory.Addiction",
        'attack_matrix': "SR5.ActionCategory.AttackMatrix",
        'attack_melee': "SR5.ActionCategory.AttackMelee",
        'attack_ranged': "SR5.ActionCategory.AttackRanged", 
        'attack_thrown': "SR5.ActionCategory.AttackThrown",
        'attack': "SR5.ActionCategory.Attack",
        'brute_force': "SR5.ActionCategory.BruteForce",
        "climbing": "SR5.ActionCategory.Climbing",
        'compiling': "SR5.ActionCategory.Compiling",
        'complex_form': "SR5.ActionCategory.ComplexForm",
        'defense': "SR5.ActionCategory.Defense",
        'defense_matrix': "SR5.ActionCategory.DefenseMatrix",
        'defense_suppression': "SR5.ActionCategory.DefenseSuppression",
        'drain': "SR5.ActionCategory.Drain",
        'fade': "SR5.ActionCategory.Fade", 
        'hack_on_the_fly': "SR5.ActionCategory.HackOnTheFly",
        'magic': "SR5.ActionCategory.Magic",
        'matrix': 'SR5.ActionCategory.Matrix',
        'recovery_physical': "SR5.ActionCategory.RecoveryPhysical",
        'recovery_stun': "SR5.ActionCategory.RecoveryStun",
        'recovery': "SR5.ActionCategory.Recovery",
        'resist_biofeedback': "SR5.ActionCategory.ResistBiofeedback",
        'resist_disease': "SR5.ActionCategory.ResistDisease",
        'resist_toxin': "SR5.ActionCategory.ResistToxin",
        'resist_matrix': "SR5.ActionCategory.ResistMatrix",
        'resist': "SR5.ActionCategory.Resist",
        'resonance': "SR5.ActionCategory.Resonance",
        'rigging': "SR5.ActionCategory.Rigging",
        'social': 'SR5.ActionCategory.Social',
        'spell_combat': "SR5.ActionCategory.SpellCombat",
        'spell_detection': "SR5.ActionCategory.SpellDetection",
        'spell_healing': "SR5.ActionCategory.SpellHealing",
        'spell_illusion': "SR5.ActionCategory.SpellIllusion", 
        'spell_manipulation': "SR5.ActionCategory.SpellManipulation",
        'spell_ritual': "SR5.ActionCategory.SpellRitual",
        'summoning': "SR5.ActionCategory.Summoning",
    },

    matrixAttributes: {
        attack: 'SR5.MatrixAttrAttack',
        sleaze: 'SR5.MatrixAttrSleaze',
        data_processing: 'SR5.MatrixAttrDataProc',
        firewall: 'SR5.MatrixAttrFirewall'
    },

    initiativeCategories: {
        meatspace: 'SR5.InitCatMeatspace',
        astral: 'SR5.InitCatAstral',
        matrix: 'SR5.InitCatMatrix',
    },

    // Gear modification types. :) Not modifiers.
    modificationTypes: {
        weapon: 'SR5.Weapon.Weapon',
        armor: 'SR5.Armor',
        vehicle: 'SR5.Vehicle.Vehicle',
        drone: 'SR5.Vehicle.Drone'
    },

    mountPoints: {
        barrel: 'SR5.Barrel',
        under_barrel: 'SR5.UnderBarrel',
        stock: 'SR5.Stock',
        top: 'SR5.Top',
        side: 'SR5.Side',
        internal: 'SR5.Internal',
    },

    modificationCategories: {
        body: 'SR5.Vehicle.ModificationCategoryTypes.body',
        cosmetic: 'SR5.Vehicle.ModificationCategoryTypes.cosmetic',
        electromagnetic: 'SR5.Vehicle.ModificationCategoryTypes.electromagnetic',
        power_train: 'SR5.Vehicle.ModificationCategoryTypes.power_train',
        protection: 'SR5.Vehicle.ModificationCategoryTypes.protection',
        weapons: 'SR5.Vehicle.ModificationCategoryTypes.weapons',
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
        defense_block: 'SR5.ModifierTypes.DefenseBlock',
        defense_dodge: 'SR5.ModifierTypes.DefenseDodge',
        defense_parry: 'SR5.ModifierTypes.DefenseParry',
        defense_melee: 'SR5.ModifierTypes.DefenseMelee',
        defense_ranged: 'SR5.ModifierTypes.DefenseRanged',
        defense: 'SR5.ModifierTypes.Defense',
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
        reach: 'SR5.ModifierTypes.Reach',
        recoil: 'SR5.ModifierTypes.Recoil',
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
        defense_block: 'SR5.Tooltips.Modifiers.defense_block',
        defense_dodge: 'SR5.Tooltips.Modifiers.defense_dodge',
        defense_parry: 'SR5.Tooltips.Modifiers.defense_parry',
        defense_melee: 'SR5.Tooltips.Modifiers.defense_melee',
        defense_ranged: 'SR5.Tooltips.Modifiers.defense_ranged',
        defense: 'SR5.Tooltips.Modifiers.defense',
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
        reach: 'SR5.Tooltips.Modifiers.reach',
        recoil: 'SR5.Tooltips.Modifiers.recoil',
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
        'environmental.light': 'SR5.ModifierTypes.EnvironmentalLight',
        'environmental.visibility': 'SR5.ModifierTypes.EnvironmentalVisibility',
        'environmental.wind': 'SR5.ModifierTypes.EnvironmentalWind',
        'environmental.range': 'SR5.ModifierTypes.EnvironmentalRange',
        background_count: 'SR5.ModifierTypes.BackgroundCount',
        noise: 'SR5.ModifierTypes.Noise',
        fade: 'SR5.ModifierTypes.Fade',
        global: 'SR5.ModifierTypes.Global',
        judge_intentions: 'SR5.ModifierTypes.JudgeIntentions',
        lift_carry: 'SR5.ModifierTypes.LiftCarry',
        memory: 'SR5.ModifierTypes.Memory',
        soak: 'SR5.ModifierTypes.Soak',
        wounds: 'SR5.ModifierTypes.Wounds',
        recoil: 'SR5.ModifierTypes.Recoil',
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
        'ritual': 'RitualSpellcastingTest',
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
        // packNames keys should match the name of the FLAG
        'GeneralActionsPack': 'sr5e-general-actions',
        'MatrixActionsPack': 'sr5e-matrix-actions',
        'ICActionsPack': 'sr5e-ic-actions',
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
        ally: 'SR5.Spirit.Types.Ally',
        automotive: 'SR5.Spirit.Types.Automotive',
        beasts: 'SR5.Spirit.Types.Beasts',
        ceramic: 'SR5.Spirit.Types.Ceramic',
        earth: 'SR5.Spirit.Types.Earth',
        energy: 'SR5.Spirit.Types.Energy',
        fire: 'SR5.Spirit.Types.Fire',
        guardian: 'SR5.Spirit.Types.Guardian',
        guidance: 'SR5.Spirit.Types.Guidance',
        homunculus: 'SR5.Spirit.Types.Homunculus',
        man: 'SR5.Spirit.Types.Man',
        metal: 'SR5.Spirit.Types.Metal',
        plant: 'SR5.Spirit.Types.Plant',
        ship: 'SR5.Spirit.Types.Ship',
        task: 'SR5.Spirit.Types.Task',
        train: 'SR5.Spirit.Types.Train',
        water: 'SR5.Spirit.Types.Water',
        watcher: 'SR5.Spirit.Types.Watcher',

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
        hopper: 'SR5.Spirit.Types.Hopper',
        blade_summoned: 'SR5.Spirit.Types.BladeSummoned',
        horror_show: 'SR5.Spirit.Types.HorrorShow',
        unbreakable: 'SR5.Spirit.Types.Unbreakable',
        master_shedim: 'SR5.Spirit.Types.MasterShedim',

        // insect types
        caretaker: 'SR5.Spirit.Types.Caretaker',
        nymph: 'SR5.Spirit.Types.Nymph',
        scout: 'SR5.Spirit.Types.Scout',
        soldier: 'SR5.Spirit.Types.Soldier',
        worker: 'SR5.Spirit.Types.Worker',
        queen: 'SR5.Spirit.Types.Queen',

        // Necro types
        carcass: "SR5.Spirit.Types.Carcass",
        corpse: "SR5.Spirit.Types.Corpse",
        rot: "SR5.Spirit.Types.Rot",
        palefire: "SR5.Spirit.Types.Palefire",
        detritus: "SR5.Spirit.Types.Detritus",

        // Howling Shadow spirits
        anarch: "SR5.Spirit.Types.Anarch",
        arboreal: "SR5.Spirit.Types.Arboreal",
        blackjack: "SR5.Spirit.Types.Blackjack",
        boggle: "SR5.Spirit.Types.Boggle",
        bugul: "SR5.Spirit.Types.Bugul",
        chindi: "SR5.Spirit.Types.Chindi",
        croki: "SR5.Spirit.Types.Croki",
        duende: "SR5.Spirit.Types.Duende",
        ejerian: "SR5.Spirit.Types.Ejerian",
        elvar: "SR5.Spirit.Types.Elvar",
        erinyes: "SR5.Spirit.Types.Erinyes",
        green_man: "SR5.Spirit.Types.GreenMan",
        imp: "SR5.Spirit.Types.Imp",
        jarl: "SR5.Spirit.Types.Jarl",
        kappa: "SR5.Spirit.Types.Kappa",
        kokopelli: "SR5.Spirit.Types.Kokopelli",
        morbi: "SR5.Spirit.Types.Morbi",
        nocnitsa: "SR5.Spirit.Types.Nocnitsa",
        phantom: "SR5.Spirit.Types.Phantom",
        preta: "SR5.Spirit.Types.Preta",
        stabber: "SR5.Spirit.Types.Stabber",
        tungak: "SR5.Spirit.Types.Tungak",
        vucub_caquix: "SR5.Spirit.Types.VucubCaquix",

        // blood magic spirits
        blood_shade: 'SR5.Spirit.Types.BloodShade',
        bone: 'SR5.Spirit.Types.Bone',

        // aetherology spirits
        gum_toad: 'SR5.Spirit.Types.GumToad',
        crawler: 'SR5.Spirit.Types.Crawler',
        ghasts: 'SR5.Spirit.Types.Ghasts',
        vrygoths: 'SR5.Spirit.Types.Vrygoths',
        gremlin: 'SR5.Spirit.Types.Gremlin',
        anansi: 'SR5.Spirit.Types.Anansi',
        tsuchigumo_warrior: 'SR5.Spirit.Types.TsuchigumoWarrior',

        // horror terrors spirits
        corps_cadavre: 'SR5.Spirit.Types.CorpsCadavre',
    },

    /**
     * Actor types that can be called in using the call in action type and be
     * set in it's system.action_type property.
     */
    callInActorTypes: {
        'spirit': 'TYPES.Actor.spirit',
        'sprite': 'TYPES.Actor.sprite'
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
        optional: {
            standard: 'SR5.CritterPower.Optional.Standard',
            enabled_option: 'SR5.CritterPower.Optional.EnabledOption',
            disabled_option: 'SR5.CritterPower.Optional.DisabledOption',
        },
    },

    spriteTypes: {
        courier: 'SR5.Sprite.Types.Courier',
        crack: 'SR5.Sprite.Types.Crack',
        data: 'SR5.Sprite.Types.Data',
        fault: 'SR5.Sprite.Types.Fault',
        machine: 'SR5.Sprite.Types.Machine',
        companion: 'SR5.Sprite.Types.Companion',
        generalist:'SR5.Sprite.Types.Generalist',
    },

    spritePower: {
        durations: {
            always: 'SR5.SpritePower.Durations.Always',
            instant: 'SR5.SpritePower.Durations.Instant',
            sustained: 'SR5.SpritePower.Durations.Sustained',
            permanent: 'SR5.SpritePower.Durations.Permanent',
            special: 'SR5.SpritePower.Durations.Special',
        },
        optional: {
            standard: 'SR5.SpritePower.Optional.Standard',
            enabled_option: 'SR5.SpritePower.Optional.EnabledOption',
            disabled_option: 'SR5.SpritePower.Optional.DisabledOption',
        },
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
            seats: 'SR5.Vehicle.Stats.Seats'
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
            bloodhound: "SR5.IC.Types.Bloodhound",
            blue_goo: "SR5.IC.Types.BlueGoo",
            catapult: "SR5.IC.Types.Catapult",
            crash: "SR5.IC.Types.Crash",
            flicker: "SR5.IC.Types.Flicker",
            jammer: "SR5.IC.Types.Jammer",
            killer: "SR5.IC.Types.Killer",
            marker: "SR5.IC.Types.Marker",
            patrol: "SR5.IC.Types.Patrol",
            probe: "SR5.IC.Types.Probe",
            scramble: "SR5.IC.Types.Scramble",
            shocker: "SR5.IC.Types.Shocker",
            sleuther: "SR5.IC.Types.Sleuther",
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
        'single_shot': 'SR5.Weapon.Mode.SingleShot',
        'semi_auto': 'SR5.Weapon.Mode.SemiAuto',
        'burst_file': 'SR5.Weapon.Mode.BurstFire',
        'full_auto': 'SR5.Weapon.Mode.FullAuto'
    },

    wirelessModes: {
        'online': 'SR5.WirelessOnline',
        'silent': 'SR5.RunningSilent',
        'offline': 'SR5.WirelessOffline',
        'none': 'SR5.WirelessUnavailable'
    },

    /**
     * The preconfigured default Shadowrun firemodes according to SR5#180
     *
     * These are separate from ranged weapon modes but depend on the selected
     * ranged weapon mode.
     */
    fireModes: [
    {
        label: "SR5.Weapon.Mode.SingleShot",
        value: 1,
        recoil: false,
        defense: 0,
        suppression: false,
        action: 'simple',
        mode: 'single_shot'
    },
    {
        label: "SR5.Weapon.Mode.SemiAutoShort",
        value: 1,
        recoil: true,
        defense: 0,
        suppression: false,
        action: 'simple',
        mode: 'semi_auto'
    },
    {
        label: "SR5.Weapon.Mode.SemiAutoBurst",
        value: 3,
        recoil: true,
        defense: -2,
        suppression: false,
        action: 'complex',
        mode: 'semi_auto'
    },

    {
        label: "SR5.Weapon.Mode.BurstFire",
        value: 3,
        recoil: true,
        defense: -2,
        suppression: false,
        action: 'simple',
        mode: 'burst_fire'
    },
    {
        label: "SR5.Weapon.Mode.BurstFireLong",
        value: 6,
        recoil: true,
        defense: -5,
        suppression: false,
        action: 'complex',
        mode: 'burst_fire',
    },
    {
        label: "SR5.Weapon.Mode.FullAutoShort",
        value: 6,
        recoil: true,
        defense: -5,
        suppression: false,
        action: 'simple',
        mode: 'full_auto'
    },
    {
        label: 'SR5.Weapon.Mode.FullAutoLong',
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
    ],

    /**
     * Active/AdvancedEffect apply To types and their labels.
     *
     * actor is the default Foundry apply to type of ActiveEffects and will be affect actor data.
     */
    effectApplyTo: {
        'actor': 'SR5.FOUNDRY.Actor',
        // 'item': 'SR5.FOUNDRY.Item', // Disabled, as systems nested item approach brings issues.
        'targeted_actor': 'SR5.ActiveEffect.ApplyTos.TargetedActor',
        'test_all': 'SR5.Test',
        'test_item': 'SR5.ActiveEffect.ApplyTos.TestItem',
        'modifier': 'SR5.Modifier'
    },

    itemSubTypeIconOverrides: {
        action: {},
        adept_power: {
            'adept-spell': 'spell/spell'
        },
        ammo: {
            'ammo': '',
            'arrow': '',
            'bola': '',
            'bolt': '',
            'grenade': '',
            'micro-torpedo': '',
            'minigrenade': '',
            'missile': '',
            'rocket': '',
            'torpedo-grenade': ''
        },
        armor: {
            'armor': '',
            'cloaks': '',
            'clothing': '',
            'high-fashion-armor-clothing': '',
            'specialty-armor': ''
        },
        bioware: {
            'basic': 'bioware/bioware',
            'bio-weapons': '',
            'biosculpting': '',
            'chemical-gland-modifications': '',
            'complimentary-genetics': '',
            'cosmetic-bioware': '',
            'cultured': '',
            'environmental-microadaptation': '',
            'exotic-metaglands': '',
            'genetic-restoration': '',
            'immunization': '',
            'orthoskin-upgrades': '',
            'phenotype-adjustment': 'bioware/biosculpting',
            'symbionts': 'bioware/cultured',
            'transgenic-alteration': 'bioware/transgenic-alteration',
            'transgenics': ''
        },
        character: {
            'dracoforms': 'critter/dracoforms',
            'extraplanar-travelers': 'critter/extraplanar-travelers',
            'infected': 'critter/infected',
            'mundane-critters': 'critter/mundane-critters',
            'mutant-critters': 'critter/mutant-critters',
            'paranormal-critters': 'critter/paranormal-critters',
            'protosapients': 'critter/protosapients',
            'technocritters': 'critter/technocritters',
            'toxic-critters': 'critter/toxic-critters',
            'warforms': 'critter/warforms',
        },
        complex_form: {},
        contact: {},
        critter_power: {
            'mana': '',
            'physical': 'critter_power/critter_power'
        },
        cyberware: {
            'auto-injector-mods': '',
            'bodyware': '',
            'cosmetic-enhancement': 'bioware/cosmetic-bioware',
            'cyber-implant-weapon': '',
            'cyber-implant-weapon-accessory': '',
            'cyberlimb': '',
            'cyberlimb-accessory': '',
            'cyberlimb-enhancement': '',
            'cybersuite': '',
            'earware': '',
            'eyeware': '',
            'hard-nanoware': '',
            'headware': 'cyberware/cyberware',
            'nanocybernetics': 'cyberware/hard-nanoware',
            'soft-nanoware': 'cyberware/hard-nanoware',
            'special-biodrone-cyberware': ''
        },
        device: {
            'commlink': 'device',
            'cyberdeck': '',
            'rcc': ''
        },
        echo: {},
        equipment: {
            'alchemical-tools': '',
            'appearance-modification': '',
            'armor-enhancements': '',
            'audio-devices': '',
            'audio-enhancements': '',
            'autosofts': 'equipment/software',
            'biotech': '',
            'booster-chips': '',
            'breaking-and-entering-gear': '',
            'btls': '',
            'chemicals': '',
            'commlink-accessories': '',
            'commlink-apps': 'equipment/software',
            'commlink-cyberdeck-form-factors': '',
            'communications-and-countermeasures': 'equipment/pi-tac',
            'contracts-upkeep': '',
            'critter-gear': '',
            'currency': '',
            'custom-cyberdeck-attributes': '',
            'cyberdeck-modules': '',
            'cyberterminals': 'equipment/pi-tac',
            'disguises': 'equipment/appearance-modification',
            'drug-grades': '',
            'drugs': '',
            'electronic-accessories': '',
            'electronic-modification': '',
            'electronic-parts': '',
            'electronics-accessories': '',
            'entertainment': '',
            'explosives': '',
            'extraction-devices': '',
            'foci': '',
            'food': '',
            'formulae': '',
            'grapple-gun': '',
            'hard-nanoware': 'cyberware/hard-nanoware',
            'housewares': '',
            'id-credsticks': '',
            'magical-compounds': '',
            'magical-supplies': '',
            'matrix-accessories': '',
            'metatype-specific': '',
            'miscellany': '',
            'musical-instruments': '',
            'nanogear': 'cyberware/hard-nanoware',
            'paydata': '',
            'pi-tac': '',
            'pi-tac-programs': 'equipment/software',
            'printing': '',
            'reporter-gear': '',
            'rfid-tags': 'equipment/pi-tac',
            'security-devices': '',
            'sensor-functions': '',
            'sensor-housings': '',
            'sensors': 'equipment/pi-tac',
            'services': '',
            'skillsofts': 'equipment/software',
            'software': '',
            'software-tweaks': 'equipment/software',
            'survival-gear': '',
            'tailored-perfume-cologne': '',
            'tools': '',
            'tools-of-the-trade': '',
            'toxins': '',
            'vision-devices': '',
            'vision-enhancements': ''
        },
        host: {},
        lifestyle: {},
        metamagic: {},
        modification: {
            'barrel': '',
            'other': '',
            'side': '',
            'stock': '',
            'top': '',
            'under': 'modification/modification'
        },
        program:        {
            'common_program': '',
            'hacking_program': ''
        },
        quality: {
            'negative': '',
            'positive': ''
        },
        ritual: {},
        sin: {},
        spell: {
            'combat': '',
            'detection': '',
            'enchantments': '',
            'health': '',
            'illusion': '',
            'manipulation': ''
        },
        spirit: {
            'extraplanar-travelers': 'critter/extraplanar-travelers',
            'insect-spirits': 'critter/insect-spirits',
            'necro-spirits': 'critter/necro-spirits',
            'shadow-spirits': 'critter/shadow-spirits',
            'shedim': 'critter/shedim',
            'spirits': 'critter/spirits',
            'ritual': 'critter/ritual',
            'toxic-spirits': 'critter/toxic-spirits',
        },
        sprite: 'critter/sprites',
        sprite_power: {},
        vehicle: {
            /* Vehicles */
            'bikes': 'vehicle/bike',
            'cars': 'vehicle/car',
            'trucks': 'vehicle/truck',
            'municipal-construction': 'vehicle/construction',
            'corpsec-police-military': 'vehicle/military',
            'boats': 'vehicle/boat',
            'submarines': 'vehicle/submarine',
            'fixed-wing-aircraft': 'vehicle/airplane',
            'ltav': 'vehicle/ltav',
            'rotorcraft': 'vehicle/rotorcraft',
            'vtol-vstol': 'vehicle/vtol',
            'hovercraft': 'vehicle/hovercraft',

            /* Drones */
            'drones-micro': 'drone/micro',
            'drones-mini': 'drone/mini',
            'drones-small': 'drone/small',
            'drones-medium': 'drone/medium',
            'drones-anthro': 'drone/anthro',
            'drones-large': 'drone/large',
            'drones-huge': 'drone/huge',
            'drones-missile': 'ammo/missile',
        },
        weapon: {
            // Options before : in name are 'Grenade', 'Minigrenade', 'Rocket', 'Missile', 'Torpedo Grenade', 'Micro-Torpedo'
            'melee': '',
            'range': '',
            'thrown': '',
            'assault-cannons': '',
            'assault-rifles': '',
            'bio-weapon': 'cyberware/cyber-implant-weapon',
            'blades': '',
            'bows': '',
            'carbines': '',
            'clubs': '',
            'crossbows': '',
            'cyberweapon': 'cyberware/cyber-implant-weapon',
            'exotic-melee-weapons': '',
            'exotic-ranged-weapons': '',
            'flamethrowers': '',
            'gear': 'equipment/equipment',
            'grenade-launchers': '',
            'grenade': 'ammo/grenade',
            'heavy-machine-guns': 'weapon/assault-cannons',
            'heavy-pistols': '',
            'holdouts': '',
            'improvised-weapons': '',
            'laser-weapons': '',
            'light-machine-guns': 'weapon/assault-cannons',
            'light-pistols': '',
            'machine-pistols': '',
            'medium-machine-guns': 'weapon/assault-cannons',
            'micro-drone-weapons': '',
            'micro-torpedo': 'ammo/micro-torpedo',
            'minigrenade': 'ammo/minigrenade',
            'missile': 'ammo/missile',
            'missile-launchers': '',
            'quality': 'quality/quality',
            'rocket': 'ammo/rocket',
            'shotguns': '',
            'sniper-rifles': '',
            'sporting-rifles': 'weapon/carbines',
            'submachine-guns': '',
            'tasers': '',
            'torpedo-grenade': 'ammo/torpedo-grenade',
            'unarmed': '',
            'underbarrel-weapons': 'modification/modification'
        }
    }
} as const;
