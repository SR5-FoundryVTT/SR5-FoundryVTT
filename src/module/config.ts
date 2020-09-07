export const SR5 = {};

SR5['itemTypes'] = {
    action: 'SR5.ItemTypes.Action',
    adept_power: 'SR5.ItemTypes.AdeptPower',
    ammo: 'SR5.ItemTypes.Ammo',
    armor: 'SR5.ItemTypes.Armor',
    complex_form: 'SR5.ItemTypes.ComplexForm',
    contact: 'SR5.ItemTypes.Contact',
    critter_power: 'SR5.ItemTypes.CritterPower',
    cyberware: 'SR5.ItemTypes.Cyberware',
    device: 'SR5.ItemTypes.Device',
    equipment: 'SR5.ItemTypes.Equipment',
    lifestyle: 'SR5.ItemTypes.Lifestyle',
    modification: 'SR5.ItemTypes.Modification',
    quality: 'SR5.ItemTypes.Quality',
    sin: 'SR5.ItemTypes.Sin',
    spell: 'SR5.ItemTypes.Spell',
    weapon: 'SR5.ItemTypes.Weapon',
};

SR5['attributes'] = {
    body: 'SR5.AttrBody',
    agility: 'SR5.AttrAgility',
    reaction: 'SR5.AttrReaction',
    strength: 'SR5.AttrStrength',
    willpower: 'SR5.AttrWillpower',
    logic: 'SR5.AttrLogic',
    intuition: 'SR5.AttrIntuition',
    charisma: 'SR5.AttrCharisma',
    magic: 'SR5.AttrMagic',
    resonance: 'SR5.AttrResonance',
    edge: 'SR5.AttrEdge',
    essence: 'SR5.AttrEssence',
    attack: 'SR5.MatrixAttrAttack',
    sleaze: 'SR5.MatrixAttrSleaze',
    data_processing: 'SR5.MatrixAttrDataProc',
    firewall: 'SR5.MatrixAttrFirewall',
};

SR5['limits'] = {
    physical: 'SR5.LimitPhysical',
    social: 'SR5.LimitSocial',
    mental: 'SR5.LimitMental',
    attack: 'SR5.MatrixAttrAttack',
    sleaze: 'SR5.MatrixAttrSleaze',
    data_processing: 'SR5.MatrixAttrDataProc',
    firewall: 'SR5.MatrixAttrFirewall',
};

SR5['specialTypes'] = {
    mundane: 'SR5.Mundane',
    magic: 'SR5.Awakened',
    resonance: 'SR5.Emerged',
};

SR5['damageTypes'] = {
    physical: 'SR5.DmgTypePhysical',
    stun: 'SR5.DmgTypeStun',
    matrix: 'SR5.DmgTypeMatrix',
};

SR5['elementTypes'] = {
    fire: 'SR5.ElementFire',
    cold: 'SR5.ElementCold',
    acid: 'SR5.ElementAcid',
    electricity: 'SR5.ElementElectricity',
    radiation: 'SR5.ElementRadiation',
};

SR5['spellCategories'] = {
    combat: 'SR5.SpellCatCombat',
    detection: 'SR5.SpellCatDetection',
    health: 'SR5.SpellCatHealth',
    illusion: 'SR5.SpellCatIllusion',
    manipulation: 'SR5.SpellCatManipulation',
};

SR5['spellTypes'] = {
    physical: 'SR5.SpellTypePhysical',
    mana: 'SR5.SpellTypeMana',
};

SR5['spellRanges'] = {
    touch: 'SR5.SpellRangeTouch',
    los: 'SR5.SpellRangeLos',
    los_a: 'SR5.SpellRangeLosA',
};

SR5['combatSpellTypes'] = {
    direct: 'SR5.SpellCombatDirect',
    indirect: 'SR5.SpellCombatIndirect',
};

SR5['detectionSpellTypes'] = {
    directional: 'SR5.SpellDetectionDirectional',
    psychic: 'SR5.SpellDetectionPsychic',
    area: 'SR5.SpellDetectionArea',
};

SR5['illusionSpellTypes'] = {
    obvious: 'SR5.SpellIllusionObvious',
    realistic: 'SR5.SpellIllusionRealistic',
};

SR5['illusionSpellSenses'] = {
    'single-sense': 'SR5.SpellIllusionSingleSense',
    'multi-sense': 'SR5.SpellIllusionMultiSense',
};

SR5['attributeRolls'] = {
    composure: 'SR5.RollComposure',
    lift_carry: 'SR5.RollLiftCarry',
    judge_intentions: 'SR5.RollJudgeIntentions',
    memory: 'SR5.RollMemory',
};

SR5['matrixTargets'] = {
    persona: 'SR5.TargetPersona',
    device: 'SR5.TargetDevice',
    file: 'SR5.TargetFile',
    self: 'SR5.TargetSelf',
    sprite: 'SR5.TargetSprite',
    other: 'SR5.TargetOther',
};

SR5['durations'] = {
    instant: 'SR5.DurationInstant',
    sustained: 'SR5.DurationSustained',
    permanent: 'SR5.DurationPermanent',
};

SR5['weaponCategories'] = {
    range: 'SR5.WeaponCatRange',
    melee: 'SR5.WeaponCatMelee',
    thrown: 'SR5.WeaponCatThrown',
};

SR5['weaponRanges'] = {
    short: 'SR5.WeaponRangeShort',
    medium: 'SR5.WeaponRangeMedium',
    long: 'SR5.WeaponRangeLong',
    extreme: 'SR5.WeaponRangeExtreme',
};

SR5['qualityTypes'] = {
    positive: 'SR5.QualityTypePositive',
    negative: 'SR5.QualityTypeNegative',
};

SR5['deviceCategories'] = {
    commlink: 'SR5.DeviceCatCommlink',
    cyberdeck: 'SR5.DeviceCatCyberdeck',
};

SR5['cyberwareGrades'] = {
    standard: 'SR5.CyberwareGradeStandard',
    alpha: 'SR5.CyberwareGradeAlpha',
    beta: 'SR5.CyberwareGradeBeta',
    delta: 'SR5.CyberwareGradeDelta',
    used: 'SR5.CyberwareGradeUsed',
};

SR5['knowledgeSkillCategories'] = {
    street: 'SR5.KnowledgeSkillStreet',
    academic: 'SR5.KnowledgeSkillAcademic',
    professional: 'SR5.KnowledgeSkillProfessional',
    interests: 'SR5.KnowledgeSkillInterests',
};

SR5['activeSkills'] = {
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
};

SR5['actionTypes'] = {
    none: 'SR5.ActionTypeNone',
    free: 'SR5.ActionTypeFree',
    simple: 'SR5.ActionTypeSimple',
    complex: 'SR5.ActionTypeComplex',
    varies: 'SR5.ActionTypeVaries',
};

SR5['matrixAttributes'] = {
    attack: 'SR5.MatrixAttrAttack',
    sleaze: 'SR5.MatrixAttrSleaze',
    data_processing: 'SR5.MatrixAttrDataProc',
    firewall: 'SR5.MatrixAttrFirewall',
};

SR5['initiativeCategories'] = {
    meatspace: 'SR5.InitCatMeatspace',
    astral: 'SR5.InitCatAstral',
    matrix: 'SR5.InitCatMatrix',
};

SR5['modificationTypes'] = {
    weapon: 'SR5.Weapon',
    armor: 'SR5.Armor',
};

SR5['mountPoints'] = {
    barrel: 'SR5.Barrel',
    stock: 'SR5.Stock',
    top: 'SR5.Top',
    side: 'SR5.Side',
    internal: 'SR5.Internal',
};

SR5['lifestyleTypes'] = {
    street: 'SR5.LifestyleStreet',
    squatter: 'SR5.LifestyleSquatter',
    low: 'SR5.LifestyleLow',
    medium: 'SR5.LifestyleMiddle',
    high: 'SR5.LifestyleHigh',
    luxory: 'SR5.LifestyleLuxory',
    other: 'SR5.LifestyleOther',
};

SR5['kbmod'] = {
    STANDARD: 'shiftKey',
    EDGE: 'altKey',
    SPEC: 'ctrlKey',
};

SR5['actorModifiers'] = {
    soak: 'SR5.RollSoak',
    drain: 'SR5.Drain',
    armor: 'SR5.Armor',
    physical_limit: 'SR5.PhysicalLimit',
    social_limit: 'SR5.SocialLimit',
    mental_limit: 'SR5.MentalLimit',
    stun_track: 'SR5.StunTrack',
    physical_track: 'SR5.PhysicalTrack',
    meat_initiative: 'SR5.MeatSpaceInit',
    meat_initiative_dice: 'SR5.MeatSpaceDice',
    astral_initiative: 'SR5.AstralInit',
    astral_initiative_dice: 'SR5.AstralDice',
    matrix_initiative: 'SR5.MatrixInit',
    matrix_initiative_dice: 'SR5.MatrixDice',
    composure: 'SR5.RollComposure',
    lift_carry: 'SR5.RollLiftCarry',
    judge_intentions: 'SR5.RollJudgeIntentions',
    memory: 'SR5.RollMemory',
    walk: 'SR5.Walk',
    run: 'SR5.Run',
    defense: 'SR5.RollDefense',
    wound_tolerance: 'SR5.WoundTolerance',
    essence: 'SR5.AttrEssence',
    fade: 'SR5.RollFade',
    global: 'SR5.Global',
};

SR5['programTypes'] = {
    common_program: 'SR5.CommonProgram',
    hacking_program: 'SR5.HackingProgram',
    agent: 'SR5.Agent',
};

SR5['spiritTypes'] = {
    // base types
    air: 'SR5.Spirit.Types.Air',
    beasts: 'SR5.Spirit.Types.Beasts',
    earth: 'SR5.Spirit.Types.Earth',
    fire: 'SR5.Spirit.Types.Fire',
    guardian: 'SR5.Spirit.Types.Guardian',
    guidance: 'SR5.Spirit.Types.Guidance',
    man: 'SR5.Spirit.Types.Man',
    plant: 'SR5.Spirit.Types.Plant',
    task: 'SR5.Spirit.Types.Task',
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
};

SR5['critterPower'] = {
    types: {
        mana: 'SR5.CritterPower.Types.Mana',
        physical: 'SR5.CritterPower.Types.Physical',
    },
    ranges: {
        los: 'SR5.CritterPower.Ranges.LineOfSight',
        self: 'SR5.CritterPower.Ranges.Self',
        touch: 'SR5.CritterPower.Ranges.Touch',
    },
    durations: {
        always: 'SR5.CritterPower.Durations.Always',
        instant: 'SR5.CritterPower.Durations.Instant',
        sustained: 'SR5.CritterPower.Durations.Sustained',
        permanent: 'SR5.CritterPower.Durations.Permanent',
        special: 'SR5.CritterPower.Durations.Special',
    },
};

SR5['spriteTypes'] = {
    courier: 'SR5.Sprite.Types.Courier',
    crack: 'SR5.Sprite.Types.Crack',
    data: 'SR5.Sprite.Types.Data',
    fault: 'SR5.Sprite.Types.Fault',
    machine: 'SR5.Sprite.Types.Machine',
};

SR5['vehicle'] = {
    types: {
        air: 'SR5.Vehicle.Types.Air',
        aerospace: 'SR5.Vehicle.Types.Aerospace',
        ground: 'SR5.Vehicle.Types.Ground',
        water: 'SR5.Vehicle.Types.Water'
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
};
