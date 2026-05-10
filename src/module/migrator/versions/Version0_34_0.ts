import { SR } from '@/module/constants';
import { VersionMigration } from '../VersionMigration';

const { setProperty, hasProperty } = foundry.utils;

type SpiritAttributeId =
    | 'body'
    | 'agility'
    | 'reaction'
    | 'strength'
    | 'willpower'
    | 'logic'
    | 'intuition'
    | 'charisma'
    | 'magic'
    | 'essence';

type LegacySpiritInitiativeProfile = {
    init: number;
    astral_init: number;
    init_mult: number;
    astral_init_mult: number;
    init_dice: number;
    astral_init_dice: number;
};

type SpiritInitiativeFormula = {
    attribute_a: string;
    attribute_b: string;
    constant: number;
    dice: number;
};

type LegacySpiritProfile = {
    attributes?: Partial<Record<SpiritAttributeId, number>>;
    forceOff?: SpiritAttributeId[];
    initiative?: Partial<LegacySpiritInitiativeProfile>;
    skills?: string[];
    halfValueSkill?: boolean;
};

const SPIRIT_ATTRIBUTE_IDS: SpiritAttributeId[] = [
    'body',
    'agility',
    'reaction',
    'strength',
    'willpower',
    'logic',
    'intuition',
    'charisma',
    'magic',
    'essence',
];

const LEGACY_INITIATIVE_DEFAULTS: LegacySpiritInitiativeProfile = {
    init: 0,
    astral_init: 0,
    init_mult: 2,
    astral_init_mult: 2,
    init_dice: 2,
    astral_init_dice: 3,
};

const LEGACY_SPIRIT_PROFILES: Record<string, LegacySpiritProfile> = {
    abomination: {
        attributes: { body: 2, agility: 1, strength: 2 },
        skills: [
            'assensing',
            'astral_combat',
            'exotic_ranged_weapon',
            'gymnastics',
            'perception',
            'running',
            'unarmed_combat',
        ],
    },
    air: {
        attributes: { body: -2, agility: 3, reaction: 4, strength: -3 },
        initiative: { init: 4 },
        skills: ['assensing', 'astral_combat', 'exotic_ranged_weapon', 'perception', 'unarmed_combat'],
    },
    aircraft: {
        attributes: { body: 2, agility: 1, strength: 1, logic: -2 },
        skills: ['free_fall', 'navigation', 'perception', 'pilot_aircraft', 'unarmed_combat'],
    },
    airwave: {
        attributes: { body: 2, agility: 3, reaction: 4, strength: -3 },
        initiative: { init: 4 },
        skills: [
            'assensing',
            'astral_combat',
            'exotic_ranged_weapon',
            'impersonation',
            'perception',
            'running',
            'unarmed_combat',
        ],
    },
    ally: { skills: ['assensing', 'astral_combat', 'perception', 'unarmed_combat'] },
    anansi: {
        attributes: { agility: 2, reaction: 2 },
        initiative: { init: 2 },
        skills: ['assensing', 'astral_combat', 'gymnastics', 'perception', 'sneaking', 'unarmed_combat'],
    },
    anarch: {
        attributes: { body: -1, agility: -1, reaction: 1, strength: -1 },
        initiative: { init: 1 },
        skills: [
            'assensing',
            'automatics',
            'blades',
            'clubs',
            'con',
            'demolitions',
            'disguise',
            'forgery',
            'gymnastics',
            'impersonation',
            'locksmith',
            'palming',
            'perception',
            'pistols',
            'sneaking',
            'throwing_weapons',
            'unarmed_combat',
        ],
    },
    arboreal: {
        attributes: { body: 2, strength: 1, essence: -2 },
        skills: [
            'assensing',
            'astral_combat',
            'blade',
            'clubs',
            'unarmed_combat',
            'exotic_ranged_weapon',
            'perception',
        ],
    },
    automotive: {
        attributes: { body: 1, agility: 2, reaction: 1, logic: -2 },
        initiative: { init: 1 },
        skills: ['navigation', 'perception', 'pilot_ground_craft', 'running', 'unarmed_combat'],
    },
    barren: {
        attributes: { body: 4, agility: -2, reaction: -1, strength: 4, logic: -1 },
        initiative: { init: -1 },
        skills: ['assensing', 'astral_combat', 'exotic_ranged_weapon', 'perception', 'unarmed_combat'],
    },
    beasts: {
        attributes: { body: 2, agility: 1, strength: 2 },
        skills: ['assensing', 'astral_combat', 'perception', 'unarmed_combat'],
    },
    blackjack: {
        attributes: { body: 2, agility: 1, reaction: 1 },
        initiative: { init: 1 },
        skills: [
            'assensing',
            'automatics',
            'blades',
            'clubs',
            'computer',
            'first_aid',
            'gymnastics',
            'intimidation',
            'locksmith',
            'longarms',
            'perception',
            'pilot_ground_craft',
            'pistols',
            'sneaking',
            'throwing_weapons',
            'unarmed_combat',
        ],
    },
    blade_summoned: {
        attributes: { body: 1, agility: 3, reaction: 2, strength: 1 },
        initiative: { init: 2, init_dice: 1 },
        skills: [
            'assensing',
            'astral_combat',
            'blades',
            'gymnastics',
            'perception',
            'running',
            'sneaking',
            'throwing_weapons',
            'unarmed_combat',
        ],
    },
    blood: {
        attributes: { body: 2, agility: 2, strength: 2, logic: -1 },
        skills: ['assensing', 'astral_combat', 'perception', 'running', 'unarmed_combat'],
    },
    blood_shade: {
        attributes: { agility: 2, reaction: 2, strength: -1, charisma: 1 },
        initiative: { init: 2 },
        skills: ['assensing', 'astral_combat', 'counterspelling', 'impersonation', 'perception', 'unarmed_combat'],
    },
    boggle: {
        attributes: { body: -2, agility: -1, reaction: -1, strength: -2, willpower: 2 },
        initiative: { init: -1 },
        skills: ['assensing', 'astral_combat', 'blades', 'clubs', 'unarmed_combat', 'gymnastics', 'perception'],
    },
    bone: {
        attributes: { body: 3, strength: 2, logic: -1, charisma: -1 },
        skills: ['assensing', 'astral_combat', 'perception', 'unarmed_combat'],
    },
    bugul: {
        attributes: { agility: -1, reaction: -1, strength: -2, willpower: 1, logic: 2 },
        skills: [
            'artisan',
            'assensing',
            'astral_combat',
            'con',
            'counterspelling',
            'disenchanting',
            'gymnastics',
            'negotiation',
            'perception',
            'unarmed_combat',
        ],
    },
    carcass: {
        attributes: { body: 3, strength: 2, charisma: -1 },
        skills: ['assensing', 'astral_combat', 'perception', 'unarmed_combat'],
    },
    caretaker: {
        attributes: { agility: 1, reaction: 1 },
        initiative: { init: 1 },
        skills: ['assensing', 'astral_combat', 'leadership', 'perception', 'unarmed_combat'],
    },
    ceramic: {
        attributes: { agility: 1, reaction: 2 },
        initiative: { init: 2 },
        skills: ['assensing', 'astral_combat', 'exotic_ranged_weapon', 'perception', 'unarmed_combat'],
    },
    chindi: {
        attributes: { body: 2, agility: 1, reaction: 2, strength: 1 },
        initiative: { init: 2 },
        skills: [
            'archery',
            'blades',
            'clubs',
            'first_aid',
            'gymnastics',
            'intimidation',
            'perception',
            'sneaking',
            'throwing_weapons',
            'unarmed_combat',
        ],
    },
    corps_cadavre: {
        attributes: { body: 2, agility: -2, reaction: -2 },
        forceOff: ['willpower', 'logic', 'intuition', 'charisma'],
        initiative: { init: 1, init_mult: 1, astral_init_mult: 1, init_dice: 1, astral_init_dice: 1 },
        skills: ['assensing', 'astral_combat', 'perception', 'unarmed_combat'],
    },
    corpse: {
        attributes: { body: 2, agility: -1, reaction: 2, strength: -2, intuition: 1, charisma: -1 },
        initiative: { init: 2 },
        skills: ['assensing', 'astral_combat', 'perception', 'unarmed_combat'],
    },
    corpselight: {},
    crawler: {
        attributes: { body: 4, reaction: 3, strength: 6, willpower: -1, intuition: 3, charisma: -1 },
        initiative: { init: 6, astral_init: 6 },
        skills: ['assensing', 'astral_combat', 'perception', 'running', 'sneaking', 'unarmed_combat'],
    },
    croki: {
        attributes: { reaction: 2, strength: 2 },
        initiative: { init: 2 },
        skills: [
            'artificing',
            'assensing',
            'astral_combat',
            'gymnastics',
            'perception',
            'ritual_spellcasting',
            'spellcasting',
        ],
    },
    detritus: {
        attributes: { body: 5, agility: -3, reaction: -1, strength: 4, logic: -1, charisma: -1 },
        initiative: { init: -1 },
        skills: ['assensing', 'astral_combat', 'exotic_ranged_weapon', 'perception', 'unarmed_combat'],
    },
    duende: {
        attributes: { reaction: 2, strength: 2 },
        initiative: { init: 2 },
        skills: ['assensing', 'astral_combat', 'con', 'gymnastics', 'perception'],
    },
    earth: {
        attributes: { body: 4, agility: -2, reaction: -1, strength: 4, logic: -1 },
        initiative: { init: -1 },
        skills: ['assensing', 'astral_combat', 'exotic_ranged_weapon', 'perception', 'unarmed_combat'],
    },
    ejerian: {
        skills: [
            'assensing',
            'astral_combat',
            'automatics',
            'blades',
            'clubs',
            'computer',
            'first_aid',
            'gymnastics',
            'intimidation',
            'locksmith',
            'longarms',
            'perception',
            'pilot_ground_craft',
            'pistols',
            'sneaking',
            'throwing_weapons',
            'unarmed_combat',
        ],
    },
    elvar: {
        attributes: { reaction: 2, strength: 2 },
        initiative: { init: 2 },
        skills: [
            'assensing',
            'astral_combat',
            'con',
            'counterspelling',
            'disenchanting',
            'gymnastics',
            'perception',
            'spellcasting',
        ],
    },
    energy: {
        attributes: { body: 1, agility: 2, reaction: 3, strength: -2, intuition: 1 },
        initiative: { init: 3 },
        skills: ['assensing', 'astral_combat', 'exotic_ranged_weapon', 'perception', 'unarmed_combat'],
    },
    erinyes: {
        attributes: { body: -1, agility: 3, reaction: 2 },
        initiative: { init: 2 },
        skills: ['assensing', 'astral_combat', 'flight', 'gymnastics', 'perception', 'sneaking', 'unarmed_combat'],
    },
    fire: {
        attributes: { body: 1, agility: 2, reaction: 3, strength: -2, intuition: 1 },
        initiative: { init: 3 },
        skills: ['assensing', 'astral_combat', 'exotic_ranged_weapon', 'flight', 'perception', 'unarmed_combat'],
    },
    ghasts: {
        attributes: { body: 2, reaction: 2 },
        initiative: { init: 2 },
        skills: ['assensing', 'astral_combat', 'flight', 'perception', 'spellcasting', 'unarmed_combat'],
    },
    green_man: {
        attributes: { body: 3, agility: -1, reaction: 2, strength: 4 },
        initiative: { init: 2 },
        skills: [
            'assensing',
            'astral_combat',
            'counterspelling',
            'gymnastics',
            'leadership',
            'perception',
            'unarmed_combat',
        ],
    },
    gremlin: {
        attributes: { reaction: 3 },
        initiative: { init: 3 },
        skills: [
            'assensing',
            'astral_combat',
            'con',
            'counterspelling',
            'intimidation',
            'perception',
            'spellcasting',
            'unarmed_combat',
        ],
    },
    guardian: {
        attributes: { body: 1, agility: 2, reaction: 3, strength: 2 },
        initiative: { init: 1 },
        skills: [
            'assensing',
            'astral_combat',
            'blades',
            'clubs',
            'counterspelling',
            'exotic_ranged_weapon',
            'perception',
            'unarmed_combat',
        ],
    },
    guidance: {
        attributes: { body: 3, agility: -1, reaction: 2, strength: 1 },
        skills: ['arcana', 'assensing', 'astral_combat', 'counterspelling', 'perception', 'unarmed_combat'],
    },
    gum_toad: {
        attributes: { body: 7, agility: -2, strength: 2, willpower: -1, charisma: 1 },
        skills: ['assensing', 'astral_combat', 'perception', 'unarmed_combat'],
    },
    homunculus: {
        attributes: { agility: -2, reaction: -2 },
        forceOff: ['body', 'willpower', 'logic', 'intuition', 'charisma'],
        initiative: { init: 1, init_mult: 1, astral_init_mult: 0, init_dice: 1, astral_init_dice: 0 },
        skills: ['assensing', 'astral_combat', 'perception', 'unarmed_combat'],
        halfValueSkill: true,
    },
    hopper: {
        attributes: { reaction: 4, intuition: 1 },
        initiative: { init: 6, init_dice: 1 },
        skills: [
            'assensing',
            'astral_combat',
            'blades',
            'gymnastics',
            'perception',
            'running',
            'sneaking',
            'throwing_weapons',
            'unarmed_combat',
        ],
    },
    horror_show: {
        attributes: { body: 1, agility: 3, reaction: 2, strength: 1 },
        initiative: { init: 2, init_dice: 1 },
        skills: [
            'assensing',
            'astral_combat',
            'blades',
            'con',
            'disguise',
            'gymnastics',
            'impersonation',
            'perception',
            'running',
            'sneaking',
            'unarmed_combat',
        ],
    },
    imp: {
        attributes: { reaction: 3 },
        initiative: { init: 3 },
        skills: [
            'alchemy',
            'assensing',
            'astral_combat',
            'con',
            'counterspelling',
            'disenchanting',
            'gymnastics',
            'intimidation',
            'perception',
            'spellcasting',
            'unarmed_combat',
        ],
    },
    jarl: {
        attributes: { body: 2, agility: -2, reaction: 3, strength: 2 },
        initiative: { init: 4 },
        skills: [
            'assensing',
            'astral_combat',
            'counterspelling',
            'gymnastics',
            'leadership',
            'perception',
            'unarmed_combat',
        ],
    },
    kappa: {
        attributes: { body: 5, reaction: -1, strength: 1, essence: -2 },
        initiative: { init: -1 },
        skills: ['assensing', 'astral_combat', 'exotic_ranged_weapon', 'gymnastics', 'perception', 'unarmed_combat'],
    },
    kokopelli: {
        attributes: { body: -1, agility: 2, reaction: 2 },
        initiative: { init: 2 },
        skills: ['artisan', 'assensing', 'astral_combat', 'leadership', 'perception', 'unarmed_combat'],
    },
    man: {
        attributes: { body: 1, reaction: 2, strength: -2, intuition: 1 },
        initiative: { init: 2 },
        skills: ['assensing', 'astral_combat', 'perception', 'spellcasting', 'unarmed_combat'],
    },
    master_shedim: {
        attributes: { reaction: 2, strength: 1, logic: 1, intuition: 1 },
        initiative: { init: 3, init_dice: 1 },
        skills: ['assensing', 'astral_combat', 'counterspelling', 'perception', 'spellcasting', 'unarmed_combat'],
    },
    metal: {
        attributes: { body: 4, agility: -2, reaction: -1, strength: 4, logic: -1 },
        initiative: { init: -1 },
        skills: ['assensing', 'astral_combat', 'exotic_ranged_weapon', 'perception', 'unarmed_combat'],
    },
    morbi: {
        attributes: { reaction: 1, strength: -2, intuition: 1, charisma: 2 },
        initiative: { init: 2 },
        skills: ['assensing', 'astral_combat', 'perception', 'ritual_spellcasting', 'sneaking', 'unarmed_combat'],
    },
    muse: {
        attributes: { agility: 3, reaction: 2, willpower: 1 },
        initiative: { init: 3 },
        skills: ['assensing', 'astral_combat', 'con', 'gymnastics', 'intimidation', 'perception', 'unarmed_combat'],
    },
    nightmare: {
        attributes: { agility: 3, reaction: 2, willpower: 1, intuition: 1, charisma: 2 },
        initiative: { init: 3 },
        skills: ['assensing', 'astral_combat', 'con', 'gymnastics', 'intimidation', 'perception', 'unarmed_combat'],
    },
    nocnitsa: {
        attributes: { body: -3, agility: 4, reaction: 5, strength: -2, willpower: -1 },
        initiative: { init: 5 },
        skills: ['assensing', 'astral_combat', 'perception', 'sneaking', 'unarmed_combat'],
    },
    noxious: {
        attributes: { body: -2, agility: 3, reaction: 4, strength: -3 },
        initiative: { init: 4 },
        skills: ['assensing', 'astral_combat', 'exotic_ranged_weapon', 'perception', 'running', 'unarmed_combat'],
    },
    nuclear: {
        attributes: { body: 1, agility: 2, reaction: 3, strength: -2, intuition: 1 },
        initiative: { init: 3 },
        skills: ['assensing', 'astral_combat', 'exotic_ranged_weapon', 'perception', 'flight', 'unarmed_combat'],
    },
    nymph: {
        attributes: { body: 1, reaction: 3, strength: 1 },
        initiative: { init: 3 },
        skills: ['assensing', 'astral_combat', 'perception', 'gymnastics', 'spellcasting', 'unarmed_combat'],
    },
    palefile: {
        attributes: { body: 2, agility: 1, reaction: 3, strength: -2, intuition: 1, charisma: -1 },
        initiative: { init: 3 },
        skills: ['assensing', 'astral_combat', 'exotic_ranged_weapon', 'flight', 'perception', 'unarmed_combat'],
    },
    phantom: {
        attributes: { body: 1, reaction: 2, strength: -2 },
        initiative: { init: 2 },
        skills: ['assensing', 'astral_combat', 'gymnastics', 'perception', 'unarmed_combat'],
    },
    plague: {
        attributes: { reaction: 2, strength: -2, intuition: 1 },
        initiative: { init: 2 },
        skills: ['assensing', 'astral_combat', 'perception', 'spellcasting', 'unarmed_combat'],
    },
    plant: {
        attributes: { body: 2, agility: -1, strength: 1, logic: -1 },
        skills: ['assensing', 'astral_combat', 'perception', 'exotic_ranged_weapon', 'unarmed_combat'],
    },
    preta: {
        attributes: { body: -1, agility: 1, reaction: 2, strength: -1 },
        initiative: { init: 2 },
        skills: [
            'assensing',
            'astral_combat',
            'intimidation',
            'negotiation',
            'perception',
            'sneaking',
            'unarmed_combat',
        ],
    },
    queen: {
        attributes: { body: 5, agility: 3, reaction: 4, strength: 5, willpower: 1, logic: 1, intuition: 1 },
        initiative: { init: 5 },
        skills: [
            'assensing',
            'astral_combat',
            'con',
            'counterspelling',
            'gymnastics',
            'leadership',
            'negotiation',
            'perception',
            'spellcasting',
            'unarmed_combat',
        ],
    },
    rot: {
        attributes: { body: 3, agility: -2, strength: 1, logic: -1, charisma: -1 },
        skills: [
            'assensing',
            'astral_combat',
            'counterspelling',
            'exotic_ranged_weapon',
            'perception',
            'unarmed_combat',
        ],
    },
    scout: {
        attributes: { agility: 2, reaction: 2 },
        initiative: { init: 2 },
        skills: ['assensing', 'astral_combat', 'perception', 'gymnastics', 'sneaking', 'unarmed_combat'],
    },
    shade: {
        attributes: { agility: 3, reaction: 2, willpower: 1, intuition: 1, charisma: 2 },
        initiative: { init: 3 },
        skills: ['assensing', 'astral_combat', 'con', 'gymnastics', 'intimidation', 'perception', 'unarmed_combat'],
    },
    shedim: {
        attributes: { reaction: 2, strength: 1 },
        initiative: { init: 2, init_dice: 1 },
        skills: ['assensing', 'astral_combat', 'perception', 'unarmed_combat'],
    },
    ship: {
        attributes: { body: 4, agility: -1, reaction: -1, strength: 2, logic: -2 },
        initiative: { init: -1 },
        skills: ['navigation', 'perception', 'pilot_watercraft', 'survival', 'swimming', 'unarmed_combat'],
    },
    sludge: {
        attributes: { body: 1, agility: 1, reaction: 2 },
        initiative: { init: 2 },
        skills: ['assensing', 'astral_combat', 'exotic_ranged_weapon', 'perception', 'unarmed_combat'],
    },
    soldier: {
        attributes: { body: 3, agility: 1, reaction: 1, strength: 3 },
        initiative: { init: 1 },
        skills: [
            'assensing',
            'astral_combat',
            'counterspelling',
            'exotic_ranged_weapon',
            'gymnastics',
            'perception',
            'unarmed_combat',
        ],
    },
    stabber: {
        attributes: { body: 1, agility: 4, reaction: 2, strength: 4 },
        initiative: { init: 2 },
        skills: ['assensing', 'astral_combat', 'gymnastics', 'perception', 'unarmed_combat'],
    },
    succubus: {
        attributes: { agility: 3, reaction: 2, willpower: 1, intuition: 1, charisma: 2 },
        initiative: { init: 3 },
        skills: ['assensing', 'astral_combat', 'con', 'gymnastics', 'intimidation', 'perception', 'unarmed_combat'],
    },
    task: {
        attributes: { reaction: 2, strength: 2 },
        initiative: { init: 2 },
        skills: ['artisan', 'assensing', 'astral_combat', 'perception', 'unarmed_combat'],
    },
    train: {
        attributes: { body: 3, agility: -1, reaction: -1, strength: 2, willpower: 1, logic: -2 },
        initiative: { init: -1 },
        skills: ['intimidation', 'navigation', 'perception', 'pilot_ground_craft', 'unarmed_combat'],
    },
    tsuchigumo_warrior: {
        attributes: { body: 2, agility: 2, reaction: 1, strength: 3 },
        initiative: { init: 1 },
        skills: ['assensing', 'astral_combat', 'counterspelling', 'perception', 'unarmed_combat'],
    },
    tungak: {
        attributes: { body: 1, reaction: 2, strength: -2 },
        initiative: { init: 2 },
        skills: ['assensing', 'astral_combat', 'gymnastics', 'perception', 'unarmed_combat'],
    },
    unbreakable: {
        attributes: { body: 3, agility: 1, reaction: 1, strength: 3, logic: -1 },
        initiative: { init: 1, init_dice: 1 },
        skills: ['assensing', 'astral_combat', 'clubs', 'perception', 'sneaking', 'throwing_weapons', 'unarmed_combat'],
    },
    vrygoths: {
        attributes: { body: 4, strength: 3, logic: 3 },
        skills: ['assensing', 'astral_combat', 'flight', 'perception', 'spellcasting', 'unarmed_combat'],
    },
    vucub_caquix: {
        attributes: { body: 3, agility: 4, reaction: 4, strength: 2, intuition: 2, charisma: 4 },
        initiative: { init: 5 },
        skills: ['assensing', 'flight', 'perception', 'unarmed_combat'],
    },
    watcher: {
        attributes: { willpower: -2, logic: -2, intuition: -2, charisma: -2 },
        forceOff: ['body', 'agility', 'reaction', 'strength'],
        initiative: { init_mult: 0, init_dice: 0, astral_init_dice: 1 },
        skills: ['assensing', 'astral_combat', 'perception'],
        halfValueSkill: true,
    },
    water: {
        attributes: { agility: 1, reaction: 2 },
        initiative: { init: 2 },
        skills: ['assensing', 'astral_combat', 'exotic_ranged_weapon', 'perception', 'unarmed_combat'],
    },
    worker: { attributes: { strength: 1 }, skills: ['assensing', 'astral_combat', 'perception', 'unarmed_combat'] },
    wraith: {
        attributes: { agility: 3, reaction: 2, willpower: 1, intuition: 1, charisma: 2 },
        initiative: { init: 3 },
        skills: ['assensing', 'astral_combat', 'con', 'gymnastics', 'intimidation', 'perception', 'unarmed_combat'],
    },
} as const;

const DEFAULT_FORCE_APPLIES: Record<SpiritAttributeId, boolean> = {
    body: true,
    agility: true,
    reaction: true,
    strength: true,
    willpower: true,
    logic: true,
    intuition: true,
    charisma: true,
    magic: true,
    essence: true,
} as const;

/**
 * Update attribute limits to their correct values.
 */
export class Version0_34_0 extends VersionMigration {
    readonly TargetVersion = '0.34.0';

    override migrateCombat(combat: any) {
        const initiativePass = combat.flags.shadowrun5e?.combatInitiativePass ?? SR.combat.FIRST_PASS;
        combat.system.pass = Math.max(initiativePass, SR.combat.FIRST_PASS);
    }

    override migrateCombatant(combatant: any): void {
        if (combatant.flags.shadowrun5e?.turnsSinceLastAttack) combatant.system.attackedLastTurn = true;
    }

    override migrateActor(actor: any): void {
        actor.system.initiative.blitz = actor.system.initiative.edge;

        if (actor.type === 'spirit')
            this.migrateSpirit(actor);
    }

    private migrateSpirit(actor: any) {
        const system = actor.system;
        if (!system || typeof system !== 'object') return;

        const spiritType = typeof system.spiritType === 'string' ? system.spiritType : '';
        const profile = LEGACY_SPIRIT_PROFILES[spiritType as keyof typeof LEGACY_SPIRIT_PROFILES];
        if (!profile) return;

        system.force_applies = this.buildForceApplies(profile.forceOff);

        const offsets = profile.attributes ?? {};
        for (const attributeId of SPIRIT_ATTRIBUTE_IDS) {
            if (!system.force_applies[attributeId]) continue;

            setProperty(system, `attributes.${attributeId}.base`, offsets[attributeId] ?? 0);
        }

        if (hasProperty(system, 'attributes.force.base'))
            system.attributes.force.base = Math.max(Number(system.attributes.force.base ?? 0),  1);

        system.half_value_skill = profile.halfValueSkill ?? false;
        this.migrateSpiritInitiative(system, profile.initiative);
        this.migrateSpiritSkills(actor, profile.skills ?? []);
    }

    private buildForceApplies(forceOff: SpiritAttributeId[] | undefined): Record<SpiritAttributeId, boolean> {
        const forceApplies = { ...DEFAULT_FORCE_APPLIES };
        if (!forceOff) return forceApplies;

        for (const attributeId of forceOff) forceApplies[attributeId] = false;

        return forceApplies;
    }

    private migrateSpiritInitiative(system: any, initiative: Partial<LegacySpiritInitiativeProfile> | undefined) {
        const profile: LegacySpiritInitiativeProfile = { ...LEGACY_INITIATIVE_DEFAULTS, ...initiative };

        system.initiative_formulae ??= {};
        system.initiative_formulae.meatspace = this.initFormulaBuild(profile.init_mult, profile.init, profile.init_dice);
        system.initiative_formulae.astral = this.initFormulaBuild(profile.astral_init_mult, profile.astral_init, profile.astral_init_dice);
    }

    private initFormulaBuild(multiplier: number, constant: number, dice: number): SpiritInitiativeFormula {
        if (multiplier >= 2) {
            return { attribute_a: 'force', attribute_b: 'force', constant, dice };
        } else if (multiplier === 1) {
            return { attribute_a: '', attribute_b: 'force', constant, dice };
        } else {
            return { attribute_a: '', attribute_b: '', constant, dice };
        }
    }

    private migrateSpiritSkills(actor: any, legacySkills: string[]) {
        const legacySkillKeys = new Set(
            legacySkills.map((skill) => this.normalizeSkillKey(skill)),
        );
        if (legacySkillKeys.size === 0) return;

        const items = Array.isArray(actor.items) ? actor.items : [];
        for (const item of items) {
            if (item?.type !== 'skill') continue;
            if (item.system?.type !== 'skill') continue;

            const itemSkillName = typeof item.name === 'string' ? item.name : '';
            const itemSkillKey = this.normalizeSkillKey(itemSkillName);
            if (!itemSkillKey) continue;

            const rating = legacySkillKeys.has(itemSkillKey) ? 1 : 0;
            setProperty(item, 'system.skill.rating', rating);
        }
    }

    private normalizeSkillKey(name: string) {
        if (typeof name !== 'string') return '';
        return name.trim().replace(/[\s-]+/g, '_').toLowerCase();
    }
}
