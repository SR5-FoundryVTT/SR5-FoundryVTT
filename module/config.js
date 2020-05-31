export const SR5 = {};

SR5.attributes = {
    body: 'SR5.AttrBody',
    agility: 'SR5.AttrAgility',
    reaction: 'SR5.AttrReaction',
    strength: 'SR5.AttrStrength',
    willpower: 'SR5.AttrWillpower',
    logic: 'SR5.AttrLogic',
    intuition: 'SR5.AttrIntution',
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

SR5.limits = {
    physical: 'SR5.LimitPhysical',
    social: 'SR5.LimitSocial',
    mental: 'SR5.LimitMental',
    attack: 'SR5.MatrixAttrAttack',
    sleaze: 'SR5.MatrixAttrSleaze',
    data_processing: 'SR5.MatrixAttrDataProc',
    firewall: 'SR5.MatrixAttrFirewall',
};

SR5.specialTypes = {
    mundane: 'SR5.Mundane',
    magic: 'SR5.Awakened',
    resonance: 'SR5.Emerged',
};

SR5.damageTypes = {
    physical: 'SR5.DmgTypePhysical',
    stun: 'SR5.DmgTypeStun',
    matrix: 'SR5.DmgTypeMatrix',
};

SR5.elementTypes = {
    fire: 'SR5.ElementFire',
    cold: 'SR5.ElementCold',
    acid: 'SR5.ElementAcid',
    electricity: 'SR5.ElementElectricity',
    radiation: 'SR5.ElementRadiation',
};

SR5.spellCategories = {
    combat: 'SR5.SpellCatCombat',
    detection: 'SR5.SpellCatDetection',
    health: 'SR5.SpellCatHealth',
    illusion: 'SR5.SpellCatIllusion',
    manipulation: 'SR5.SpellCatManipulation',
};

SR5.spellTypes = {
    physical: 'SR5.SpellTypePhysical',
    mana: 'SR5.SpellTypeMana',
};

SR5.spellRanges = {
    touch: 'SR5.SpellRangeTouch',
    los: 'SR5.SpellRangeLos',
    los_a: 'SR5.SpellRangeLosA',
};

SR5.combatSpellTypes = {
    direct: 'SR5.SpellCombatDirect',
    indirect: 'SR5.SpellCombatIndirect',
};

SR5.detectionSpellTypes = {
    directional: 'SR5.SpellDetectionDirectional',
    psychic: 'SR5.SpellDetectionPsychic',
    area: 'SR5.SpellDetectionArea',
};

SR5.illusionSpellTypes = {
    obvious: 'SR5.SpellIllusionObvious',
    realistic: 'SR5.SpellIllusionRealistic',
};

SR5.illusionSpellSenses = {
    'single-sense': 'SR5.SpellIllusionSingleSense',
    'multi-sense': 'SR5.SpellIllusionMultiSense',
};

SR5.attributeRolls = {
    composure: 'SR5.RollComposure',
    lift_carry: 'SR5.RollLiftCarry',
    judge_intentions: 'SR5.RollJudgeIntentions',
    memory: 'SR5.RollMemory',
};

SR5.matrixTargets = {
    persona: 'SR5.TargetPersona',
    device: 'SR5.TargetDevice',
    file: 'SR5.TargetFile',
    self: 'SR5.TargetSelf',
    sprite: 'SR5.TargetSprite',
    other: 'SR5.TargetOther',
};

SR5.durations = {
    instant: 'SR5.DurationInstant',
    sustained: 'SR5.DurationSustained',
    permanent: 'SR5.DurationPermanent',
};

SR5.weaponCategories = {
    range: 'SR5.WeaponCatRange',
    melee: 'SR5.WeaponCatMelee',
    thrown: 'SR5.WeaponCatThrown',
};

SR5.qualityTypes = {
    positive: 'SR5.QualityTypePositive',
    negative: 'SR5.QualityTypeNegative',
};

SR5.deviceCategories = {
    commlink: 'SR5.DeviceCatCommlink',
    cyberdeck: 'SR5.DeviceCatCyberdeck',
};

SR5.cyberwareGrades = {
    standard: 'SR5.CyberwareGradeStandard',
    alpha: 'SR5.CyberwareGradeAlpha',
    beta: 'SR5.CyberwareGradeBeta',
    delta: 'SR5.CyberwareGradeDelta',
    used: 'SR5.CyberwareGradeUsed',
};

SR5.knowledgeSkillCategories = {
    street: 'SR5.KnowledgeSkillStreet',
    academic: 'SR5.KnowledgeSkillAcademic',
    professional: 'SR5.KnowledgeSkillProfessional',
    interests: 'SR5.KnowledgeSkillInterests',
};

SR5.activeSkills = {
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

SR5.actionTypes = {
    none: 'SR5.ActionTypeNone',
    free: 'SR5.ActionTypeFree',
    simple: 'SR5.ActionTypeSimple',
    complex: 'SR5.ActionTypeComplex',
    varies: 'SR5.ActionTypeVaries',
};

SR5.matrixAttributes = {
    attack: 'SR5.MatrixAttrAttack',
    sleaze: 'SR5.MatrixAttrSleaze',
    data_processing: 'SR5.MatrixAttrDataProc',
    firewall: 'SR5.MatrixAttrFirewall',
};

SR5.initiativeCategories = {
    meatspace: 'SR5.InitCatMeatspace',
    astral: 'SR5.InitCatAstral',
    matrix: 'SR5.InitCatMatrix',
};

SR5.modificationTypes = {
    weapon: 'SR5.Weapon',
    armor: 'SR5.Armor',
};

SR5.mountPoints = {
    barrel: 'SR5.Barrel',
    stock: 'SR5.Stock',
    top: 'SR5.Top',
    side: 'SR5.Side',
    internal: 'SR5.Internal',
};

SR5.lifestyleTypes = {
    street: 'SR5.LifestyleStreet',
    squatter: 'SR5.LifestyleSquatter',
    low: 'SR5.LifestyleLow',
    medium: 'SR5.LifestyleMiddle',
    high: 'SR5.LifestyleHigh',
    luxory: 'SR5.LifestyleLuxory',
    other: 'SR5.LifestyleOther',
};

SR5.kbmod = {
    STANDARD: 'shiftKey',
    EDGE: 'altKey',
    SPEC: 'ctrlKey',
};
