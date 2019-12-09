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
};

SR5.device = {
  categories: {
    COMMLINK: 'commlink',
    CYBERDECK: 'cyberdeck'
  }
};

SR5.weapon = {
  categories: {
    RANGE: 'range',
    MELEE: 'melee',
    THROWN: 'thrown'
  }
};

SR5.rangeWeapon = {
  skills: {
    ARCHERY: 'archery',
    HEAVY_WEAPONS: 'heavy_weapons',
    LONGARMS: 'longarms',
    PISTOLS: 'pistols',
    GUNNERY: 'gunnery',
    AUTOMATICS: 'automatics',
    EXOTIC_RANGE: 'exotic_range'
  }
};
SR5.meleeWeapon = {
  skills: {
    BLADES: 'blades',
    CLUBS: 'clubs',
    UNARMED_COMBAT: 'unarmed_combat',
    EXOTIC_MELEE: 'exotic_melee'
  }
};

SR5.skills = {
  active: {
    ...SR5.rangeWeapon.skills,
    ...SR5.meleeWeapon.skills
  },
  categories: {
    combat: {
      label: "Combat",
      skills: [
        'archery',
        'heavy_weapons',
        'longarms',
        'pistols',
        'gunnery',
        'automatics',
        'exotic_range',
        'throwing_weapons',
        'blades',
        'clubs',
        'unarmed_combat',
        'exotic_melee'
      ]
    },
    physical: {
      label: 'Physical',
      skills: [
        'disguise',
        'diving',
        'escape_artist',
        'free_fall',
        'gymnastics',
        'palming',
        'perception',
        'running',
        'sneaking',
        'survival',
        'swimming',
        'tracking'
      ]
    },
    social: {
      label: 'Social',
      skills: [
        'con',
        'etiquette',
        'impersonation',
        'instruction',
        'intimidation',
        'leadership',
        'negotiation',
        'performance'
      ]
    },
    technical: {
      label: 'Technical',
      skills: [
        'aeronautics_mechanic',
        'automotive_mechanic',
        'industrial_mechanic',
        'nautical_mechanic',
        'animal_handling',
        'armorer',
        'artisan',
        'biotechnology',
        'chemistry',
        'computer',
        'cybercombat',
        'cybertechnology',
        'demolitions',
        'electronic_warfare',
        'first_aid',
        'forgery',
        'hacking',
        'hardware',
        'locksmith',
        'medicine',
        'navigation',
        'software',
        'pilot_aerospace',
        'pilot_aircraft',
        'pilot_walker',
        'pilot_ground_craft',
        'pilot_water_craft',
        'pilot_exotic_vehicle'
      ]
    },
    magic: {
      label: 'Magic',
      skills: [
        'alchemy',
        'arcana',
        'artificing',
        'assensing',
        'astral_combat',
        'banishing',
        'binding',
        'counterspelling',
        'disenchanting',
        'ritual_spellcasting',
        'spellcasting',
        'summoning'
      ]
    },
    resonance: {
      label: 'Resonance',
      skills: [
        'compiling',
        'decompiling',
        'registering'
      ]
    }
  }
};

SR5.initiative = {
  categories: {
    MEATSPACE: 'meatspace',
    ASTRAL: 'astral',
    MATRIX: 'matrix'
  }
};

SR5.kbmod = {
  STANDARD: 'shiftKey',
  EDGE: 'altKey',
  SPEC: 'ctrlKey'
};

SR5.attributes = {
  ...SR5.spell.attributes,
  BODY: 'body',
  AGILITY: 'agility',
  STRENGTH: 'strength',
  REACTION: 'reaction',
  WILLPOWER: 'willpower',
  EDGE: 'edge',
  MAGIC: 'magic',
  RESONANCE: 'resonance',
  ESSENCE: 'essence'
};
