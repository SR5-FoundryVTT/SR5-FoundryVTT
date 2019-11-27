export const SR5 = { };

SR5.edge = {
  PUSH_THE_LIMIT: 'push-the-limit',
  SECOND_CHANGE: 'second-chance'
};

SR5.quality = {
  types: {
    POSITIVE: 'positive',
    NEGATIVE: 'negative'
  }
}


SR5.damageTypes = {
  PHYSICAL: 'physical',
  STUN: 'stun'
};

SR5.elementTypes = {
  FIRE: 'fire',
  COLD: 'cold',
  ACID: 'acid',
  ELEC: 'electricity',
  RAD: 'radiation'
};

SR5.spell = {
  categories: {
    COMBAT: 'combat',
    DETECTION: 'detection',
    HEALTH: 'health',
    ILLUSION: 'illusion',
    MANIPULATION: 'manipulation'
  },
  types: {
    PHYSICAL: 'physical',
    MANA: 'mana'
  },
  ranges: {
    TOUCH: 'touch',
    LOS: 'los',
    LOSA: 'los_a'
  },
  duration: {
    INSTANT: 'instant',
    SUSTAINED: 'sustained',
    PERMANENT: 'permament'
  },
  combatTypes: {
    DIRECT: 'direct',
    INDIRECT: 'indirect'
  },
  detectionTypes: {
    DIRECTIONAL: 'directional',
    PSYCHIC: 'psychic',
    AREA: 'area'
  },
  illusionTypes: {
    OBVIOUS: 'obvious',
    REALISTIC: 'realistic'
  },
  illusionSenses: {
    SINGLE: 'single-sense',
    MULTI: 'multi-sense'
  },
  attributes: {
    INTUITION: 'intuition',
    LOGIC: 'logic',
    CHARISMA: 'charisma'
  }
}

SR5.weapon = {
  categories: {
    RANGE: 'range',
    MELEE: 'melee',
    THROWN: 'thrown'
  }
}

SR5.rangeWeapon = {
  skills: {
    ARCHERY: 'archery',
    HEAVY_WEAPONS: 'heavy_weapons',
    LONGARMS: 'longarms',
    PISTOLS: 'pistols',
    GUNNERY: 'gunnery',
    AUTOMATICS: 'automatics'
  }
};
SR5.meleeWeapon = {
  skills: {
    BLADES: 'blades',
    CLUBS: 'clubs',
    UNARMED_COMBAT: 'unarmed_combat'
  }
};

SR5.skills = {
  ...SR5.rangeWeapon.skills,
  ...SR5.meleeWeapon.skills
};

SR5.kbmod = {
  STANDARD: 'shiftKey',
  EDGE: 'altKey',
  SPEC: 'ctrlKey'
};

SR5.attributes = {
  ...SR5.spell.attributes,
  BODY: 'body',
  AGILIGITY: 'agility',
  STRENGTH: 'strength',
  REACTION: 'reaction',
  WILLPOWER: 'willpower',
  EDGE: 'edge',
  MAGIC: 'magic',
  RESONANCE: 'resonance',
  ESSENCE: 'essence'
};
