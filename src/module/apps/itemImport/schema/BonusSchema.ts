// AUTO‑GENERATED — DO NOT EDIT

import { Empty, Many, OneOrMany } from './Types';

export interface BonusSchema {
    $?: { unique?: string; useselected?: string; };
    accel?: { _TEXT: string; };
    actiondicepool?: { $: { category: string; }; };
    activeskillkarmacost?: Many<{
        condition: { _TEXT: string; };
        max?: { _TEXT: string; };
        min?: { _TEXT: string; };
        name: Empty;
        val: { _TEXT: string; };
    }>;
    activesoft?: {
        val: { _TEXT: string; };
    };
    adapsin?: Empty;
    addcontact?: {
        connection?: { _TEXT: string; };
        forcedloyalty: { _TEXT: string; };
        forcegroup?: Empty;
        free: Empty;
        group: Empty;
        loyalty?: { _TEXT: string; };
    };
    addecho?: { _TEXT: string; };
    addesstophysicalcmrecovery?: Empty;
    addesstostuncmrecovery?: Empty;
    addgear?: {
        category: { _TEXT: string; };
        children?: {
            child: Many<{
                category: { _TEXT: string; };
                name: { _TEXT: string; };
                rating: { _TEXT: string; };
            }>;
        };
        name: { _TEXT: string; };
        rating?: { _TEXT: string; };
    };
    addlimb?: {
        $?: { precedence: string; };
        limbslot: { _TEXT: string; };
        val: { _TEXT: string; };
    };
    addmetamagic?: OneOrMany<{ _TEXT: string; $: { forced: string; }; }>;
    addqualities?: {
        addquality: OneOrMany<{ _TEXT: string; $?: { forced?: string; select?: string; }; }>;
    };
    addskillspecializationoption?: {
        skills: {
            skill: { _TEXT: string; };
        };
        spec: { _TEXT: string; };
    };
    addspell?: { _TEXT: string; $: { alchemical: string; }; };
    addspirit?: Empty | OneOrMany<{
        addtoselected?: { _TEXT: string; };
        spirit?: OneOrMany<{ _TEXT: string; }>;
    }>;
    addware?: {
        grade: { _TEXT: string; };
        name: { _TEXT: string; };
        type: { _TEXT: string; };
    };
    addweapon?: {
        name: { _TEXT: string; };
    };
    adeptpowerpoints?: { _TEXT: string; };
    allowskilldefaulting?: Empty;
    allowspellcategory?: { _TEXT: string; };
    allowspellrange?: Many<{ _TEXT: string; }>;
    allowspritefettering?: Empty;
    ambidextrous?: Empty;
    armor?: { _TEXT: string; $?: { group: string; }; };
    astralreputation?: { _TEXT: string; };
    attributekarmacost?: {
        name: { _TEXT: string; };
        val: { _TEXT: string; };
    };
    biowareessmultiplier?: { _TEXT: string; };
    blackmarketdiscount?: Empty;
    blockskillcategorydefaulting?: Many<{ _TEXT: string; }>;
    blockspelldescriptor?: { _TEXT: string; };
    body?: { _TEXT: string; };
    burnoutsway?: Empty;
    coldarmor?: { _TEXT: string; };
    composure?: { _TEXT: string; };
    conditionmonitor?: {
        overflow?: { _TEXT: string; };
        physical?: { _TEXT: string; };
        sharedthresholdoffset?: { _TEXT: string; };
        stun?: { _TEXT: string; };
        threshold?: { _TEXT: string; };
        thresholdoffset?: { _TEXT: string; };
    };
    contactkarma?: { _TEXT: string; };
    contactkarmaminimum?: { _TEXT: string; };
    critterpowerlevels?: {
        power: OneOrMany<{
            name: { _TEXT: string; };
            val: { _TEXT: string; };
        }>;
    };
    critterpowers?: {
        power: OneOrMany<{ _TEXT: string; $?: { rating?: string; select?: string; }; }>;
    };
    cyberadeptdaemon?: Empty;
    cyberseeker?: OneOrMany<{ _TEXT: string; }>;
    cyberwareessmultiplier?: { _TEXT: string; };
    cyberwaretotalessmultiplier?: { _TEXT: string; };
    damageresistance?: { _TEXT: string; };
    dealerconnection?: {
        category: Many<{ _TEXT: string; }>;
    };
    decreaseagiresist?: { _TEXT: string; };
    decreasebodresist?: { _TEXT: string; };
    decreasecharesist?: { _TEXT: string; };
    decreaseintresist?: { _TEXT: string; };
    decreaselogresist?: { _TEXT: string; };
    decreaserearesist?: { _TEXT: string; };
    decreasestrresist?: { _TEXT: string; };
    decreasewilresist?: { _TEXT: string; };
    defensetest?: { _TEXT: string; };
    detectionspellresist?: { _TEXT: string; };
    devicerating?: { _TEXT: string; };
    directmanaspellresist?: { _TEXT: string; };
    disablebioware?: Empty;
    disablebiowaregrade?: Many<{ _TEXT: string; }>;
    disablecyberwaregrade?: Many<{ _TEXT: string; }>;
    disablequality?: OneOrMany<{ _TEXT: string; }>;
    dodge?: { _TEXT: string; };
    drainresist?: { _TEXT: string; };
    drainvalue?: { _TEXT: string; };
    electricityarmor?: { _TEXT: string; };
    enableattribute?: {
        name: { _TEXT: string; };
    };
    enabletab?: {
        name: OneOrMany<{ _TEXT: string; }>;
    };
    erased?: Empty;
    essencemax?: { _TEXT: string; };
    essencepenalty?: { _TEXT: string; };
    essencepenaltymagonlyt100?: { _TEXT: string; };
    essencepenaltyt100?: { _TEXT: string; };
    excon?: Empty;
    fadingresist?: { _TEXT: string; };
    fadingvalue?: OneOrMany<{ _TEXT: string; $?: { specific: string; }; }>;
    fame?: Empty;
    fatigueresist?: { _TEXT: string; };
    firearmor?: { _TEXT: string; };
    focusbindingkarmacost?: OneOrMany<{
        extracontains?: { _TEXT: string; };
        name: { _TEXT: string; };
        val: { _TEXT: string; };
    }>;
    freequality?: { _TEXT: string; };
    freespells?: { $: { attribute?: string; limit?: string; skill?: string; }; };
    friendsinhighplaces?: Empty;
    handling?: { _TEXT: string; };
    hardwires?: { _TEXT: string; $: { excludecategory?: string; knowledgeskill?: string; }; };
    initiative?: { _TEXT: string; $?: { precedence: string; }; };
    initiativedice?: { _TEXT: string; };
    initiativepass?: { _TEXT: string; $?: { precedence: string; }; };
    judgeintentions?: { _TEXT: string; };
    judgeintentionsdefense?: { _TEXT: string; };
    judgeintentionsoffense?: { _TEXT: string; };
    knowledgeskillkarmacost?: Many<{
        condition?: { _TEXT: string; };
        max?: { _TEXT: string; };
        min?: { _TEXT: string; };
        name: Empty;
        val: { _TEXT: string; };
    }>;
    knowledgeskillkarmacostmin?: {
        condition: { _TEXT: string; };
        max: { _TEXT: string; };
        name: Empty;
        val: { _TEXT: string; };
    };
    knowledgeskillpoints?: {
        val: { _TEXT: string; };
    };
    lifestylecost?: OneOrMany<{ _TEXT: string; $?: { lifestyle: string; }; }>;
    limitcritterpowercategory?: { _TEXT: string; };
    limitmodifier?: OneOrMany<{
        condition?: { _TEXT: string; };
        limit: { _TEXT: string; };
        value: { _TEXT: string; };
    }>;
    limitspellcategory?: Empty | { _TEXT?: string; $?: { exclude: string; }; };
    limitspiritcategory?: Empty | {
        spirit?: { _TEXT: string; };
    };
    livingpersona?: {
        attack?: { _TEXT: string; };
        dataprocessing?: { _TEXT: string; };
        firewall?: { _TEXT: string; };
        sleaze?: { _TEXT: string; };
    };
    mademan?: Empty;
    magicianswaydiscount?: Empty;
    manaillusionresist?: { _TEXT: string; };
    martialart?: { _TEXT: string; };
    matrixinitiativedice?: { _TEXT: string; $: { precedence: string; }; };
    matrixinitiativediceadd?: { _TEXT: string; };
    memory?: { _TEXT: string; };
    mentallimit?: { _TEXT: string; };
    mentalmanipulationresist?: { _TEXT: string; };
    metageniclimit?: { _TEXT: string; };
    movementreplace?: OneOrMany<{
        category: { _TEXT: string; };
        speed: { _TEXT: string; };
        val: { _TEXT: string; };
    }>;
    nativelanguagelimit?: { _TEXT: string; };
    naturalweapon?: {
        accuracy: { _TEXT: string; };
        ap?: { _TEXT: string; };
        damage: { _TEXT: string; };
        name: { _TEXT: string; };
        page: { _TEXT: string; };
        reach: { _TEXT: string; };
        source: { _TEXT: string; };
        useskill: { _TEXT: string; };
        useskillspec?: { _TEXT: string; };
    };
    newspellkarmacost?: { _TEXT: string; $: { type: string; }; };
    notoriety?: { _TEXT: string; };
    nuyenamt?: { _TEXT: string; $?: { condition: string; }; };
    nuyenmaxbp?: { _TEXT: string; };
    offroadaccel?: { _TEXT: string; };
    offroadhandling?: { _TEXT: string; };
    offroadspeed?: { _TEXT: string; };
    optionalpowers?: {
        optionalpower: Many<{ _TEXT: string; $?: { select: string; }; }>;
    };
    overclocker?: Empty;
    pathogencontactimmune?: Empty;
    pathogencontactresist?: { _TEXT: string; };
    pathogeningestionresist?: { _TEXT: string; };
    pathogeninhalationimmune?: Empty;
    pathogeninhalationresist?: { _TEXT: string; };
    pathogeninjectionresist?: { _TEXT: string; };
    penaltyfreesustain?: {
        count: { _TEXT: string; };
    };
    physicalcmrecovery?: { _TEXT: string; };
    physicalillusionresist?: { _TEXT: string; };
    physicallimit?: { _TEXT: string; };
    physiologicaladdictionalreadyaddicted?: { _TEXT: string; };
    physiologicaladdictionfirsttime?: { _TEXT: string; };
    pilot?: { _TEXT: string; };
    prototypetranshuman?: { _TEXT: string; };
    psychologicaladdictionalreadyaddicted?: { _TEXT: string; };
    psychologicaladdictionfirsttime?: { _TEXT: string; };
    publicawareness?: { _TEXT: string; };
    radiationresist?: { _TEXT: string; };
    reach?: { _TEXT: string; };
    reflexrecorderoptimization?: Empty;
    replaceattributes?: {
        replaceattribute: Many<{
            aug: { _TEXT: string; };
            max: { _TEXT: string; };
            min: { _TEXT: string; };
            name: { _TEXT: string; };
        }>;
    };
    restrictedgear?: {
        amount: { _TEXT: string; };
        availability: { _TEXT: string; };
    };
    runmultiplier?: {
        category: { _TEXT: string; };
        percent?: { _TEXT: string; };
        val?: { _TEXT: string; };
    };
    seats?: { _TEXT: string; };
    selectarmor?: Empty;
    selectattribute?: {
        attribute?: Many<{ _TEXT: string; }>;
        excludeattribute?: Many<{ _TEXT: string; }>;
        val?: { _TEXT: string; };
    };
    selectattributes?: {
        selectattribute: OneOrMany<{
            attribute?: Many<{ _TEXT: string; }>;
            excludeattribute?: OneOrMany<{ _TEXT: string; }>;
            max?: { _TEXT: string; };
            val?: { _TEXT: string; };
        }>;
    };
    selectcontact?: Empty;
    selectcyberware?: Empty | {
        category?: { _TEXT: string; };
    };
    selectexpertise?: { $: { limittoskill: string; }; };
    selectinherentaiprogram?: Empty;
    selectlimit?: {
        val: { _TEXT: string; };
    };
    selectmentorspirit?: Empty;
    selectparagon?: Empty;
    selectpowers?: {
        selectpower: {
            ignorerating: { _TEXT: string; };
            limit: { _TEXT: string; };
            pointsperlevel: { _TEXT: string; };
            val: { _TEXT: string; };
        };
    };
    selectquality?: {
        discountqualities?: {
            quality: Many<{ _TEXT: string; $: { discount: string; }; }>;
        };
        quality: Many<{ _TEXT: string; $?: { contributetobp: string; forced: string; }; }>;
    };
    selectrestricted?: Empty;
    selectside?: Empty;
    selectskill?: {
        $?: { knowledgeskills?: string; limittoattribute?: string; limittoskill?: string; maximumrating?: string; minimumrating?: string; skillcategory?: string; };
        applytorating?: { _TEXT: string; };
        disablespecializationeffects?: Empty;
        max?: { _TEXT: string; };
        skillcategories?: {
            category: Many<{ _TEXT: string; }>;
        };
        val?: { _TEXT: string; };
    };
    selectspell?: Empty | { $?: { ignorerequirements: string; }; };
    selectsprite?: Empty;
    selecttext?: Empty | { $?: { allowedit?: string; xml: string; xpath: string; }; };
    selecttradition?: Empty;
    selectweapon?: Empty | { $?: { weapondetails: string; }; };
    sensor?: { _TEXT: string; };
    skillattribute?: OneOrMany<{
        $?: { precedence: string; };
        bonus: { _TEXT: string; };
        condition?: { _TEXT: string; };
        name: { _TEXT: string; };
    }>;
    skillcategory?: OneOrMany<{
        bonus: { _TEXT: string; };
        condition?: { _TEXT: string; };
        exclude?: { _TEXT: string; };
        name: { _TEXT: string; };
    }>;
    skillcategorykarmacost?: {
        condition: { _TEXT: string; };
        min: { _TEXT: string; };
        name: { _TEXT: string; };
        val: { _TEXT: string; };
    };
    skillcategorykarmacostmultiplier?: OneOrMany<{
        condition?: { _TEXT: string; };
        name: { _TEXT: string; };
        val: { _TEXT: string; };
    }>;
    skillcategorypointcostmultiplier?: {
        name: { _TEXT: string; };
        val: { _TEXT: string; };
    };
    skillcategoryspecializationkarmacostmultiplier?: OneOrMany<{
        condition?: { _TEXT: string; };
        name: { _TEXT: string; };
        val: { _TEXT: string; };
    }>;
    skilldisable?: OneOrMany<{ _TEXT: string; }>;
    skillgroup?: OneOrMany<{
        bonus: { _TEXT: string; };
        condition?: { _TEXT: string; };
        exclude?: { _TEXT: string; };
        name: { _TEXT: string; };
    }>;
    skillgroupcategorydisable?: { _TEXT: string; };
    skillgroupcategorykarmacostmultiplier?: {
        name: { _TEXT: string; };
        val: { _TEXT: string; };
    };
    skillgroupdisable?: OneOrMany<{ _TEXT: string; }>;
    skillgroupdisablechoice?: Empty;
    skilllinkedattribute?: {
        bonus: { _TEXT: string; };
        name: { _TEXT: string; };
    };
    skillsoft?: {
        $: { excludecategory?: string; skillcategory?: string; };
        val: { _TEXT: string; };
    };
    skillsoftaccess?: { _TEXT: string; $: { precedence: string; }; };
    skillwire?: { _TEXT: string; $?: { precedence: string; }; };
    smartlink?: { _TEXT: string; };
    sociallimit?: { _TEXT: string; };
    sonicresist?: { _TEXT: string; };
    specialattburnmultiplier?: { _TEXT: string; };
    specialmodificationlimit?: { _TEXT: string; };
    specificattribute?: OneOrMany<{
        $?: { precedence: string; };
        max?: { _TEXT: string; };
        min?: { _TEXT: string; };
        name: { _TEXT: string; };
        val?: { _TEXT: string; };
    }>;
    specificskill?: OneOrMany<{
        applytorating?: { _TEXT: string; };
        bonus: { _TEXT: string; };
        condition?: { _TEXT: string; };
        name: { _TEXT: string; };
    }>;
    speed?: { _TEXT: string; };
    spellcategory?: {
        name: { _TEXT: string; };
        val: { _TEXT: string; };
    };
    spellcategorydamage?: {
        category: { _TEXT: string; };
        val: { _TEXT: string; };
    };
    spellcategorydrain?: {
        category?: { _TEXT: string; };
        val: { _TEXT: string; };
    };
    spelldescriptordamage?: {
        descriptor: { _TEXT: string; };
        val: { _TEXT: string; };
    };
    spelldescriptordrain?: {
        descriptor: { _TEXT: string; };
        val: { _TEXT: string; };
    };
    spelldicepool?: {
        name: { _TEXT: string; };
        val: { _TEXT: string; };
    };
    spellresistance?: { _TEXT: string; };
    sprintbonus?: {
        category: { _TEXT: string; };
        percent?: { _TEXT: string; };
        val?: { _TEXT: string; };
    };
    streetcredmultiplier?: { _TEXT: string; };
    stuncmrecovery?: { _TEXT: string; };
    surprise?: { _TEXT: string; };
    swapskillattribute?: {
        attribute: { _TEXT: string; };
        limittoskill: { _TEXT: string; };
    };
    swapskillspecattribute?: {
        attribute: { _TEXT: string; };
        limittoskill: { _TEXT: string; };
        spec: { _TEXT: string; };
    };
    throwrangestr?: { _TEXT: string; };
    throwstr?: { _TEXT: string; };
    toxincontactimmune?: Empty;
    toxincontactresist?: { _TEXT: string; };
    toxiningestionresist?: { _TEXT: string; };
    toxininhalationimmune?: Empty;
    toxininhalationresist?: { _TEXT: string; };
    toxininjectionresist?: { _TEXT: string; };
    trustfund?: { _TEXT: string; };
    unarmedap?: { _TEXT: string; };
    unarmeddv?: { _TEXT: string; };
    unarmeddvphysical?: Empty;
    unarmedreach?: { _TEXT: string; };
    uneducated?: Empty;
    unlockskills?: OneOrMany<{ _TEXT: string; $?: { name: string; }; }>;
    walkmultiplier?: OneOrMany<{
        category: { _TEXT: string; };
        percent?: { _TEXT: string; };
        val?: { _TEXT: string; };
    }>;
    weaponaccuracy?: {
        name: { _TEXT: string; };
        value: { _TEXT: string; };
    };
    weaponcategorydice?: {
        category: {
            name: { _TEXT: string; };
            value: { _TEXT: string; };
        };
    };
    weaponcategorydv?: {
        bonus: { _TEXT: string; };
        selectskill: { $: { limittoskill: string; }; };
    };
    weaponskillaccuracy?: {
        selectskill: { $: { excludecategory?: string; excludeskill?: string; knowledgeskills?: string; skillcategory?: string; }; };
        value: { _TEXT: string; };
    };
    weaponspecificdice?: { _TEXT: string; $: { type: string; }; };
    _TEXT?: string;
};
