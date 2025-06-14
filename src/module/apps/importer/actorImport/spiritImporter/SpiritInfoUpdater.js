/**
 * Parses all non-item character information from a chummer character object.
 */
export class SpiritInfoUpdater {

    /**
     * Parses the actor data from the chummer file and returns an updated clone of the actor data.
     * @param {*} actorSource The actor data (actor not actor.system) that is used as the basis for the import. Will not be changed.
     * @param {*} chummerChar The chummer character to parse.
     */
    async update(actorSource, chummerChar) {

        const clonedActorSource = foundry.utils.duplicate(actorSource);

        // Name is required, so we need to always set something (even if the chummer field is empty)
        if (chummerChar.alias) {
            clonedActorSource.name = chummerChar.alias;
        }
        else {
            clonedActorSource.name = chummerChar.name ? chummerChar.name : '[Name not found]';
        }
        clonedActorSource.prototypeToken.name = clonedActorSource.name;


        clonedActorSource.system.special = 'magic';
        const magic = (Number) (chummerChar.attributes[1]?.attribute.filter(att => att.name_english.toLowerCase() == 'mag')[0].total);
        clonedActorSource.system.force = magic;
        this.importSpiritType(clonedActorSource.system, chummerChar)

        return clonedActorSource;
    }

    importSpiritType(system, chummerChar) {
        let chummerType = chummerChar.metatype_english

        let spiritTypes = [
            'air',
            'aircraft',
            'airwave',
            'ally',
            'automotive',
            'beasts',
            'ceramic',
            'earth',
            'energy',
            'fire',
            'guardian',
            'guidance',
            'homunculus',
            'man',
            'metal',
            'plant',
            'ship',
            'task',
            'train',
            'water',
            'watcher',
            'toxic_air',
            'toxic_beasts',
            'toxic_earth',
            'toxic_fire',
            'toxic_man',
            'toxic_water',
            'blood',
            'muse',
            'nightmare',
            'shade',
            'succubus',
            'wraith',

            //shedim
            'shedim',
            'hopper',
            'blade_summoned',
            'horror_show',
            'unbreakable',
            'master_shedim',

            // insect
            'caretaker',
            'nymph',
            'scout',
            'soldier',
            'worker',
            'queen',

            "carcass",
            "corpse",
            "rot",
            "palefile",
            "detritus",

             // Howling Shadow
             "anarch",
             "arboreal",
             "blackjack",
             "boggle",
             "bugul",
             "chindi",
             "corpselight",
             "croki",
             "duende",
             "ejerian",
             "elvar",
             "erinyes",
             "green_man",
             "imp",
             "jarl",
             "kappa",
             "kokopelli",
             "morbi",
             "nocnitsa",
             "phantom",
             "preta",
             "stabber",
             "tungak",
             "vucub_caquix",
            
            // Aetherology
             'gum_toad',
             'crawler',
             'ghasts',
             'vryghots',
             'gremlin',
             'anansi',
             'tsuchigumo_warrior',

             // Horror Terrors
             'corps_cadavre',
        ]

        let specialMapping = new Map([
            ['Noxious Spirit', 'toxic_air'],
            ['Abomination Spirit', 'toxic_beasts'],
            ['Barren Spirit', 'toxic_earth'],
            ['Nuclear Spirit', 'toxic_fire'],
            ['Plague Spirit', 'toxic_man'],
            ['Sludge Spirit', 'toxic_water']
        ])

        const type = spiritTypes.find(v => chummerType?.toLowerCase().includes(v)) ?? specialMapping.get(chummerType);
       
        if(type == undefined) {
            ui.notifications?.error(game.i18n.format("SR5.Import.Spirit.SpiritTypeNotFound"))
            return;
        }

        system.spiritType = type;
    }
}

