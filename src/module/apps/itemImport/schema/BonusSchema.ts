// AUTO‑GENERATED — DO NOT EDIT - Check utils/generate_schemas.py for more info

import { Empty, Many, OneOrMany, IntegerString } from './Types';

export interface BonusSchema {
    $?: { unique?: string; useselected?: "False"; };
    accel?: { _TEXT: IntegerString | "+Rating" | "Rating"; };
    actiondicepool?: { $: { category: "Matrix"; }; };
    activeskillkarmacost?: Many<{
        condition: { _TEXT: "career"; };
        max?: { _TEXT: IntegerString; };
        min?: { _TEXT: IntegerString; };
        name: Empty;
        val: { _TEXT: IntegerString; };
    }>;
    activesoft?: {
        val: { _TEXT: "Rating"; };
    };
    adapsin?: Empty;
    addcontact?: {
        connection?: { _TEXT: IntegerString; };
        forcedloyalty: { _TEXT: IntegerString; };
        forcegroup?: Empty;
        free: Empty;
        group: Empty;
        loyalty?: { _TEXT: IntegerString; };
    };
    addecho?: { _TEXT: "Sourcerer Daemon"; };
    addesstophysicalcmrecovery?: Empty;
    addesstostuncmrecovery?: Empty;
    addgear?: {
        category: { _TEXT: "Commlinks" | "ID/Credsticks"; };
        children?: {
            child: Many<{
                category: { _TEXT: "ID/Credsticks"; };
                name: { _TEXT: "Fake License"; };
                rating: { _TEXT: IntegerString; };
            }>;
        };
        name: { _TEXT: "Fake SIN" | "Living Persona"; };
        rating?: { _TEXT: IntegerString; };
    };
    addlimb?: {
        $?: { precedence: IntegerString; };
        limbslot: { _TEXT: "arm" | "leg"; };
        val: { _TEXT: IntegerString; };
    };
    addmetamagic?: OneOrMany<{ _TEXT: "Psychometry" | "Reflection" | "Sensing"; $: { forced: "True"; }; }>;
    addqualities?: {
        addquality: OneOrMany<{ _TEXT: string; $?: { forced?: "True"; select?: "Black Forest: Street Politics" | "Black Forest: You Know a Guy"; }; }>;
    };
    addskillspecializationoption?: {
        skills: {
            skill: { _TEXT: "Perception"; };
        };
        spec: { _TEXT: "Electroception"; };
    };
    addspell?: { _TEXT: "Alter Ballistics"; $: { alchemical: "True"; }; };
    addspirit?: Empty | OneOrMany<{
        addtoselected?: { _TEXT: "False"; };
        spirit?: OneOrMany<{ _TEXT: string; }>;
    }>;
    addware?: {
        grade: { _TEXT: "None"; };
        name: { _TEXT: "Busted Ware"; };
        type: { _TEXT: "Cyberware"; };
    };
    addweapon?: {
        name: { _TEXT: "Elemental Body"; };
    };
    adeptpowerpoints?: { _TEXT: IntegerString; };
    allowskilldefaulting?: Empty;
    allowspellcategory?: { _TEXT: "Rituals"; };
    allowspellrange?: Many<{ _TEXT: "T" | "T (A)"; }>;
    allowspritefettering?: Empty;
    ambidextrous?: Empty;
    armor?: { _TEXT: IntegerString | "+Rating" | "Rating"; $?: { group: IntegerString; }; };
    astralreputation?: { _TEXT: IntegerString; };
    attributekarmacost?: {
        name: { _TEXT: "STR"; };
        val: { _TEXT: IntegerString; };
    };
    availability?: { _TEXT: IntegerString; $: { condition: "career"; }; };
    biowareessmultiplier?: { _TEXT: IntegerString; };
    blackmarketdiscount?: Empty;
    blockskillcategorydefaulting?: Many<{ _TEXT: "Academic" | "Professional" | "Technical Active"; }>;
    blockspelldescriptor?: { _TEXT: "Spell"; };
    body?: { _TEXT: IntegerString | "-Rating"; };
    burnoutsway?: Empty;
    coldarmor?: { _TEXT: IntegerString | "Rating"; };
    composure?: { _TEXT: IntegerString; };
    conditionmonitor?: {
        overflow?: { _TEXT: IntegerString; };
        physical?: { _TEXT: IntegerString | "-Rating" | "Rating"; };
        sharedthresholdoffset?: { _TEXT: "Rating"; };
        stun?: { _TEXT: IntegerString | "Rating"; };
        threshold?: { _TEXT: IntegerString; };
        thresholdoffset?: { _TEXT: IntegerString | "Rating"; };
    };
    contactkarma?: { _TEXT: IntegerString; };
    contactkarmaminimum?: { _TEXT: IntegerString; };
    critterpowerlevels?: {
        power: OneOrMany<{
            name: { _TEXT: "Hardened Armor" | "Hardened Mystic Armor"; };
            val: { _TEXT: IntegerString; };
        }>;
    };
    critterpowers?: {
        power: OneOrMany<{ _TEXT: string; $?: { rating?: IntegerString; select?: string; }; }>;
    };
    cyberadeptdaemon?: Empty;
    cyberseeker?: OneOrMany<{ _TEXT: "AGI" | "BOX" | "STR" | "WIL"; }>;
    cyberwareessmultiplier?: { _TEXT: IntegerString; };
    cyberwaretotalessmultiplier?: { _TEXT: IntegerString; };
    damageresistance?: { _TEXT: IntegerString | "Rating"; };
    dealerconnection?: {
        category: Many<{ _TEXT: "Aircraft" | "Drones" | "Groundcraft" | "Watercraft"; }>;
    };
    decreaseagiresist?: { _TEXT: IntegerString; };
    decreasebodresist?: { _TEXT: IntegerString; };
    decreasecharesist?: { _TEXT: IntegerString; };
    decreaseintresist?: { _TEXT: IntegerString | "-Rating"; };
    decreaselogresist?: { _TEXT: IntegerString | "-Rating"; };
    decreaserearesist?: { _TEXT: IntegerString; };
    decreasestrresist?: { _TEXT: IntegerString; };
    decreasewilresist?: { _TEXT: IntegerString; };
    defensetest?: { _TEXT: IntegerString; };
    detectionspellresist?: { _TEXT: IntegerString | "-Rating" | "Rating"; };
    devicerating?: { _TEXT: IntegerString; };
    directmanaspellresist?: { _TEXT: IntegerString; };
    disablebioware?: Empty;
    disablebiowaregrade?: Many<{ _TEXT: string; }>;
    disablecyberwaregrade?: Many<{ _TEXT: string; }>;
    disablequality?: OneOrMany<{ _TEXT: string; }>;
    dodge?: { _TEXT: IntegerString | "-Rating" | "Rating"; };
    drainresist?: { _TEXT: IntegerString; };
    drainvalue?: { _TEXT: IntegerString; };
    electricityarmor?: { _TEXT: IntegerString | "Rating"; };
    enableattribute?: {
        name: { _TEXT: "MAG" | "RES"; };
    };
    enabletab?: {
        name: OneOrMany<{ _TEXT: "adept" | "critter" | "magician" | "technomancer"; }>;
    };
    erased?: Empty;
    essencemax?: { _TEXT: IntegerString; };
    essencepenalty?: { _TEXT: IntegerString; };
    essencepenaltymagonlyt100?: { _TEXT: IntegerString; };
    essencepenaltyt100?: { _TEXT: IntegerString | "-10*Rating"; };
    excon?: Empty;
    fadingresist?: { _TEXT: IntegerString; };
    fadingvalue?: OneOrMany<{ _TEXT: IntegerString; $?: { specific: string; }; }>;
    fame?: Empty;
    fatigueresist?: { _TEXT: IntegerString | "Rating"; };
    firearmor?: { _TEXT: IntegerString | "Rating"; };
    focusbindingkarmacost?: OneOrMany<{
        extracontains?: { _TEXT: string; };
        name: { _TEXT: "Qi Focus" | "Weapon Focus"; };
        val: { _TEXT: IntegerString; };
    }>;
    freequality?: { _TEXT: "ced3fecf-2277-4b20-b1e0-894162ca9ae2"; };
    freespells?: { $: { attribute?: "MAG"; limit?: "half,touchonly"; skill?: "Spellcasting"; }; };
    friendsinhighplaces?: Empty;
    handling?: { _TEXT: IntegerString | "+Rating" | "Rating"; };
    hardwires?: { _TEXT: "Rating"; $: { excludecategory?: "Magical Active,Resonance Active"; knowledgeskill?: "True"; }; };
    initiative?: { _TEXT: IntegerString | "FixedValues(3,6,9)"; $?: { precedence: IntegerString; }; };
    initiativedice?: { _TEXT: IntegerString; };
    initiativepass?: { _TEXT: IntegerString | "FixedValues(0,1,1)" | "Rating"; $?: { precedence: IntegerString; }; };
    judgeintentions?: { _TEXT: "Rating"; };
    judgeintentionsdefense?: { _TEXT: IntegerString | "Rating"; };
    judgeintentionsoffense?: { _TEXT: "-Rating"; };
    knowledgeskillkarmacost?: Many<{
        condition?: { _TEXT: "career"; };
        max?: { _TEXT: IntegerString; };
        min?: { _TEXT: IntegerString; };
        name: Empty;
        val: { _TEXT: IntegerString | "-number(Rating >= 2)" | "-number(Rating >= 3)"; };
    }>;
    knowledgeskillkarmacostmin?: {
        condition: { _TEXT: "career"; };
        max: { _TEXT: IntegerString; };
        name: Empty;
        val: { _TEXT: IntegerString; };
    };
    knowledgeskillpoints?: {
        val: { _TEXT: IntegerString; };
    };
    lifestylecost?: OneOrMany<{ _TEXT: IntegerString; $?: { condition: "once"; lifestyle: "Low" | "Squatter"; }; }>;
    limitcritterpowercategory?: { _TEXT: "Drake" | "Infected"; };
    limitmodifier?: OneOrMany<{
        condition?: { _TEXT: string; };
        limit: { _TEXT: "Mental" | "Physical" | "Social"; };
        value: { _TEXT: IntegerString | "Rating"; };
    }>;
    limitspellcategory?: Empty | { _TEXT?: "Rituals"; $?: { exclude: "Rituals"; }; };
    limitspiritcategory?: Empty | {
        spirit?: { _TEXT: "Spirit of Air" | "Spirit of Earth" | "Spirit of Fire" | "Spirit of Water"; };
    };
    livingpersona?: {
        attack?: { _TEXT: IntegerString; };
        dataprocessing?: { _TEXT: IntegerString; };
        firewall?: { _TEXT: IntegerString; };
        sleaze?: { _TEXT: IntegerString; };
    };
    mademan?: Empty;
    magicianswaydiscount?: Empty;
    manaillusionresist?: { _TEXT: IntegerString | "-Rating" | "Rating"; };
    martialart?: { _TEXT: "One Trick Pony"; };
    matrixinitiativedice?: { _TEXT: IntegerString; $: { precedence: IntegerString; }; };
    matrixinitiativediceadd?: { _TEXT: IntegerString; };
    memory?: { _TEXT: IntegerString | "-Rating" | "Rating"; };
    mentallimit?: { _TEXT: IntegerString | "Rating"; };
    mentalmanipulationresist?: { _TEXT: IntegerString | "-Rating" | "Rating"; };
    metageniclimit?: { _TEXT: IntegerString; };
    movementreplace?: OneOrMany<{
        category: { _TEXT: "Fly" | "Ground"; };
        speed: { _TEXT: "run" | "sprint" | "walk"; };
        val: { _TEXT: IntegerString; };
    }>;
    nativelanguagelimit?: { _TEXT: IntegerString; };
    naturalweapon?: {
        accuracy: { _TEXT: "Physical"; };
        ap: { _TEXT: IntegerString; };
        damage: { _TEXT: "({STR}+1)P" | "({STR}+2)P" | "({STR}+3)P" | "({STR}-1)P" | "{BOD}S(e)"; };
        name: { _TEXT: string; };
        page?: { _TEXT: IntegerString; };
        reach: { _TEXT: IntegerString; };
        source?: { _TEXT: "DTR" | "HS"; };
        useskill: { _TEXT: "Exotic Melee Weapon" | "Unarmed Combat"; };
        useskillspec?: { _TEXT: "Quills" | "Trunk"; };
    };
    newspellkarmacost?: { _TEXT: IntegerString; $: { type: "Spells"; }; };
    notoriety?: { _TEXT: IntegerString; };
    nuyenamt?: { _TEXT: IntegerString; $?: { condition: "Stolen"; }; };
    nuyenmaxbp?: { _TEXT: IntegerString; };
    offroadaccel?: { _TEXT: IntegerString | "+Rating" | "Rating"; };
    offroadhandling?: { _TEXT: IntegerString | "+Rating" | "Rating"; };
    offroadspeed?: { _TEXT: IntegerString | "+Rating" | "Rating"; };
    optionalpowers?: {
        optionalpower: Many<{ _TEXT: "Armor" | "Enhanced Senses" | "Fear" | "Immunity"; $?: { select: string; }; }>;
    };
    overclocker?: Empty;
    pathogencontactimmune?: Empty;
    pathogencontactresist?: { _TEXT: IntegerString | "Rating"; };
    pathogeningestionresist?: { _TEXT: IntegerString | "Rating"; };
    pathogeninhalationimmune?: Empty;
    pathogeninhalationresist?: { _TEXT: IntegerString | "Rating"; };
    pathogeninjectionresist?: { _TEXT: IntegerString | "Rating"; };
    penaltyfreesustain?: {
        count: { _TEXT: "(Rating - 1) / 2"; };
    };
    physicalcmrecovery?: { _TEXT: IntegerString | "Rating"; };
    physicalillusionresist?: { _TEXT: "-Rating" | "Rating"; };
    physicallimit?: { _TEXT: IntegerString | "Rating"; };
    physiologicaladdictionalreadyaddicted?: { _TEXT: IntegerString | "-Rating" | "Rating"; };
    physiologicaladdictionfirsttime?: { _TEXT: IntegerString | "-Rating" | "Rating"; };
    pilot?: { _TEXT: "Rating"; };
    prototypetranshuman?: { _TEXT: IntegerString; };
    psychologicaladdictionalreadyaddicted?: { _TEXT: IntegerString | "Rating"; };
    psychologicaladdictionfirsttime?: { _TEXT: IntegerString | "Rating"; };
    publicawareness?: { _TEXT: IntegerString; };
    radiationresist?: { _TEXT: IntegerString | "Rating"; };
    reach?: { _TEXT: IntegerString; };
    reflexrecorderoptimization?: Empty;
    replaceattributes?: {
        replaceattribute: Many<{
            aug: { _TEXT: IntegerString; };
            max: { _TEXT: IntegerString; };
            min: { _TEXT: IntegerString; };
            name: { _TEXT: "AGI" | "BOD" | "CHA" | "INT" | "LOG" | "REA" | "STR" | "WIL"; };
        }>;
    };
    restrictedgear?: {
        amount: { _TEXT: IntegerString; };
        availability: { _TEXT: IntegerString; };
    };
    runmultiplier?: {
        category: { _TEXT: "Ground"; };
        percent?: { _TEXT: IntegerString; };
        val?: { _TEXT: IntegerString; };
    };
    seats?: { _TEXT: IntegerString | "+Seats * 0.5"; };
    selectarmor?: Empty;
    selectattribute?: {
        attribute?: Many<{ _TEXT: "AGI" | "BOD" | "REA" | "STR"; }>;
        excludeattribute?: Many<{ _TEXT: "DEP" | "EDG" | "INI" | "MAG" | "RES"; }>;
        val?: { _TEXT: "Rating"; };
    };
    selectattributes?: {
        selectattribute: OneOrMany<{
            attribute?: Many<{ _TEXT: "AGI" | "BOD" | "CHA" | "INT" | "LOG" | "REA" | "STR" | "WIL"; }>;
            excludeattribute?: OneOrMany<{ _TEXT: "AGI" | "BOD" | "DEP" | "EDG" | "MAG" | "REA" | "RES" | "STR"; }>;
            max?: { _TEXT: IntegerString; };
            val?: { _TEXT: IntegerString; };
        }>;
    };
    selectcontact?: Empty;
    selectcyberware?: Empty | {
        category?: { _TEXT: "Soft Nanoware"; };
    };
    selectexpertise?: { $: { limittoskill: "Artisan"; }; };
    selectinherentaiprogram?: Empty;
    selectlimit?: {
        val: { _TEXT: IntegerString; };
    };
    selectmentorspirit?: Empty;
    selectparagon?: Empty;
    selectpowers?: {
        selectpower: {
            ignorerating: { _TEXT: "True"; };
            limit: { _TEXT: "Rating"; };
            pointsperlevel: { _TEXT: IntegerString; };
            val: { _TEXT: "Rating"; };
        };
    };
    selectquality?: {
        discountqualities?: {
            quality: Many<{ _TEXT: string; $: { discount: IntegerString; }; }>;
        };
        quality: Many<{ _TEXT: string; $?: { contributetobp: "True"; forced: "True"; }; }>;
    };
    selectrestricted?: Empty;
    selectside?: Empty;
    selectskill?: Empty | {
        $?: { knowledgeskills?: "True"; limittoattribute?: "BOD,AGI,REA,STR"; limittoskill?: string; maximumrating?: IntegerString; minimumrating?: IntegerString; skillcategory?: string; };
        applytorating?: { _TEXT: "True"; };
        disablespecializationeffects?: Empty;
        max?: { _TEXT: IntegerString; };
        skillcategories?: {
            category: Many<{ _TEXT: string; }>;
        };
        val?: { _TEXT: IntegerString | "MAG" | "Rating"; };
    };
    selectspell?: Empty | { $?: { ignorerequirements: "True"; }; };
    selectsprite?: Empty;
    selecttext?: Empty | { $?: { allowedit?: "True"; xml: string; xpath: string; }; };
    selecttradition?: Empty;
    selectweapon?: Empty | { $?: { weapondetails: string; }; };
    sensor?: { _TEXT: IntegerString | "Rating"; };
    skillattribute?: OneOrMany<{
        $?: { precedence: IntegerString; };
        bonus: { _TEXT: IntegerString | "-Rating" | "Rating"; };
        condition?: { _TEXT: string; };
        name: { _TEXT: "INT" | "LOG" | "MAG" | "WIL"; };
    }>;
    skillcategory?: OneOrMany<{
        bonus: { _TEXT: IntegerString | "-Rating" | "Rating"; };
        condition?: { _TEXT: string; };
        exclude?: { _TEXT: "Gunnery" | "Intimidation" | "Perception"; };
        name: { _TEXT: string; };
    }>;
    skillcategorykarmacost?: {
        condition: { _TEXT: "career"; };
        min: { _TEXT: IntegerString; };
        name: { _TEXT: "Academic" | "Language" | "Professional" | "Street"; };
        val: { _TEXT: IntegerString; };
    };
    skillcategorykarmacostmultiplier?: OneOrMany<{
        condition?: { _TEXT: "create"; };
        name: { _TEXT: "Academic" | "Professional" | "Social Active" | "Technical Active"; };
        val: { _TEXT: IntegerString; };
    }>;
    skillcategorypointcostmultiplier?: {
        name: { _TEXT: "Academic" | "Language" | "Professional" | "Social Active" | "Street"; };
        val: { _TEXT: IntegerString; };
    };
    skillcategoryspecializationkarmacostmultiplier?: OneOrMany<{
        condition?: { _TEXT: "create"; };
        name: { _TEXT: "Academic" | "Professional" | "Technical Active"; };
        val: { _TEXT: IntegerString; };
    }>;
    skilldisable?: OneOrMany<{ _TEXT: string; }>;
    skillgroup?: OneOrMany<{
        bonus: { _TEXT: IntegerString | "Rating"; };
        condition?: { _TEXT: string; };
        exclude?: { _TEXT: "Survival"; };
        name: { _TEXT: string; };
    }>;
    skillgroupcategorydisable?: { _TEXT: "Social Active"; };
    skillgroupcategorykarmacostmultiplier?: {
        name: { _TEXT: "Technical Active"; };
        val: { _TEXT: IntegerString; };
    };
    skillgroupdisable?: OneOrMany<{ _TEXT: "Conjuring" | "Enchanting" | "Sorcery"; }>;
    skillgroupdisablechoice?: Empty;
    skilllinkedattribute?: {
        bonus: { _TEXT: IntegerString; };
        name: { _TEXT: "INT" | "LOG"; };
    };
    skillsoft?: {
        $: { excludecategory?: "Language"; skillcategory?: "Language"; };
        val: { _TEXT: "Rating"; };
    };
    skillsoftaccess?: { _TEXT: "Rating"; $: { precedence: IntegerString; }; };
    skillwire?: { _TEXT: "Rating" | "Rating * 2"; $?: { precedence: IntegerString; }; };
    smartlink?: { _TEXT: IntegerString; };
    sociallimit?: { _TEXT: IntegerString | "-Rating" | "Rating"; };
    sonicresist?: { _TEXT: IntegerString; };
    specialattburnmultiplier?: { _TEXT: IntegerString; };
    specialmodificationlimit?: { _TEXT: IntegerString; };
    specificattribute?: OneOrMany<{
        $?: { precedence: IntegerString; };
        max?: { _TEXT: IntegerString | "Rating"; };
        min?: { _TEXT: IntegerString; };
        name: { _TEXT: string; };
        val?: { _TEXT: IntegerString | "Rating"; };
    }>;
    specificskill?: OneOrMany<{
        applytorating?: { _TEXT: "True"; };
        bonus: { _TEXT: IntegerString | "Rating"; };
        condition?: { _TEXT: string; };
        name: { _TEXT: string; };
    }>;
    speed?: { _TEXT: IntegerString | "+Rating" | "Rating"; };
    spellcategory?: {
        name: { _TEXT: "Combat" | "Detection" | "Health" | "Illusion" | "Manipulation"; };
        val: { _TEXT: "Rating"; };
    };
    spellcategorydamage?: {
        category: { _TEXT: "Combat"; };
        val: { _TEXT: IntegerString; };
    };
    spellcategorydrain?: {
        category?: { _TEXT: "Combat"; };
        val: { _TEXT: IntegerString; };
    };
    spelldescriptordamage?: {
        descriptor: { _TEXT: "Direct,NOT(Area)"; };
        val: { _TEXT: IntegerString; };
    };
    spelldescriptordrain?: {
        descriptor: { _TEXT: "Direct,NOT(Area)"; };
        val: { _TEXT: IntegerString; };
    };
    spelldicepool?: {
        name: { _TEXT: "Heal"; };
        val: { _TEXT: IntegerString; };
    };
    spellresistance?: { _TEXT: IntegerString | "Rating"; };
    sprintbonus?: {
        category: { _TEXT: "Ground" | "Swim"; };
        percent?: { _TEXT: IntegerString; };
        val?: { _TEXT: IntegerString; };
    };
    streetcredmultiplier?: { _TEXT: IntegerString; };
    stuncmrecovery?: { _TEXT: IntegerString | "Rating"; };
    surprise?: { _TEXT: IntegerString | "-Rating" | "Rating"; };
    swapskillattribute?: {
        attribute: { _TEXT: "INT"; };
        limittoskill: { _TEXT: "Etiquette"; };
    };
    swapskillspecattribute?: {
        attribute: { _TEXT: "LOG"; };
        limittoskill: { _TEXT: "Negotiation"; };
        spec: { _TEXT: "Diplomacy"; };
    };
    throwrangestr?: { _TEXT: "Rating*2"; };
    throwstr?: { _TEXT: IntegerString; };
    toxincontactimmune?: Empty;
    toxincontactresist?: { _TEXT: IntegerString | "Rating"; };
    toxiningestionresist?: { _TEXT: IntegerString | "Rating"; };
    toxininhalationimmune?: Empty;
    toxininhalationresist?: { _TEXT: IntegerString | "Rating"; };
    toxininjectionresist?: { _TEXT: IntegerString | "Rating"; };
    trustfund?: { _TEXT: IntegerString; };
    unarmedap?: { _TEXT: "-Rating"; };
    unarmeddv?: { _TEXT: IntegerString | "Rating*0.5" | "Rating-1"; };
    unarmeddvphysical?: Empty;
    unarmedreach?: { _TEXT: IntegerString; };
    uneducated?: Empty;
    unlockskills?: OneOrMany<{ _TEXT: string; $?: { name: "Assensing" | "Astral Combat" | "Counterspelling" | "Spellcasting"; }; }>;
    walkmultiplier?: OneOrMany<{
        category: { _TEXT: "Ground" | "Swim"; };
        percent?: { _TEXT: IntegerString; };
        val?: { _TEXT: IntegerString; };
    }>;
    weaponaccuracy?: {
        name: { _TEXT: "[contains]Fangs"; };
        value: { _TEXT: IntegerString; };
    };
    weaponcategorydice?: {
        category: {
            name: { _TEXT: "Bows"; };
            value: { _TEXT: IntegerString; };
        };
    };
    weaponcategorydv?: {
        bonus: { _TEXT: IntegerString; };
        selectcategories?: {
            category: Many<{ _TEXT: "Astral Combat" | "Blades" | "Clubs" | "Exotic Melee Weapon" | "Unarmed Combat"; }>;
        };
        selectskill?: { $: { limittoskill: "Astral Combat,Blades,Clubs,Exotic Melee Weapon,Unarmed Combat"; }; };
    };
    weaponskillaccuracy?: {
        selectskill: { $: { excludecategory?: "Combat Active"; excludeskill?: "Unarmed Combat"; knowledgeskills?: "False"; skillcategory?: "Combat Active"; }; };
        value: { _TEXT: IntegerString; };
    };
    weaponspecificdice?: { _TEXT: "Rating"; $: { type: "Melee"; }; };
    _TEXT?: IntegerString | "-Rating" | "Rating";
};
