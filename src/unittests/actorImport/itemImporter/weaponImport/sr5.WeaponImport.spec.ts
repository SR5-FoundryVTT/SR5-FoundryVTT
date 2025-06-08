import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { WeaponParser } from '../../../../module/apps/importer/actorImport/itemImporter/weaponImport/WeaponParser';

export const weaponParserTesting = (context: QuenchBatchContext) => {
    const { describe, it, assert } = context;

    let chummerCharacter;
    const chummerRangedWeapon = {
        guid: '8a88eb37-cf7b-4c0b-bb73-74f950e33fc8',
        sourceid: '61c59a89-3c51-46b7-880a-933b29394315',
        name: 'Ruger Super Warhawk',
        fullname: 'Ruger Super Warhawk',
        name_english: 'Ruger Super Warhawk',
        category: 'Heavy Pistols',
        category_english: 'Heavy Pistols',
        type: 'Ranged',
        reach: '0',
        accuracy: '5 (8)',
        accuracy_noammo: '5 (8)',
        rawaccuracy: '5',
        damage: '11S',
        damage_noammo: '9P',
        damage_english: '11S',
        damage_noammo_english: '9P',
        rawdamage: '9P',
        ap: '-2',
        ap_noammo: '-3',
        rawap: '-2',
        mode: 'SS',
        mode_noammo: 'SS',
        rc: '2',
        rc_noammo: '2',
        rawrc: '0',
        ammo: '6(cy)',
        ammo_english: '6(cy)',
        maxammo: '6(cy)',
        conceal: '-5',
        avail: '6R',
        cost: '4,775',
        owncost: '400',
        weight: '0',
        ownweight: '0',
        source: 'SR5',
        page: '427',
        weaponname: null,
        location: null,
        attack: '0',
        sleaze: '0',
        dataprocessing: '2',
        firewall: '2',
        devicerating: '2',
        programlimit: '0',
        iscommlink: 'False',
        isprogram: 'False',
        active: 'False',
        homenode: 'False',
        conditionmonitor: '9',
        matrixcmfilled: '0',
        accessories: {
            accessory: [
                {
                    guid: 'f15e3860-c3c1-4eca-95ab-67c2b7eacfef',
                    sourceid: '85b01b5c-c788-4b43-8190-9e0c18391436',
                    name: 'Personalized Grip',
                    name_english: 'Personalized Grip',
                    mount: 'None',
                    extramount: 'None',
                    rc: null,
                    conceal: '0',
                    avail: '2',
                    ratinglabel: 'String_Rating',
                    cost: '100',
                    owncost: '100',
                    weight: '0',
                    ownweight: '0',
                    included: 'False',
                    source: 'HT',
                    page: '182',
                    accuracy: '+1',
                    notes: 'ANGEPASSTER GRIFF\nDurch diese Modikation kann der Besitzer einer Waffe diese exakt an Größe und Form seiner Hand anpassen. Das ist besonders für Metamenschen am oberen und unteren Ende der Größenskala der Metamenschheit nützlich. Die Modikation steigert die Präzision der Waffe für ihren Besitzer um 1.',
                },
                {
                    guid: '6e3b7028-299e-46cc-b140-6da3fb2d6ecd',
                    sourceid: 'ea64527d-0e1e-4248-957b-7c02d79dad30',
                    name: 'Concealed Quick-Draw Holster',
                    name_english: 'Concealed Quick-Draw Holster',
                    mount: 'None',
                    extramount: 'None',
                    rc: null,
                    conceal: '-1',
                    avail: '6',
                    ratinglabel: 'String_Rating',
                    cost: '275',
                    owncost: '275',
                    weight: '0',
                    ownweight: '0',
                    included: 'False',
                    source: 'RG',
                    page: '51',
                    accuracy: '0',
                    notes: null,
                },
                {
                    guid: '715bb07c-fbc4-4c2e-ae43-3dd5ca066eb7',
                    sourceid: 'd57d2c64-1f61-4f5f-a465-8ce0dfacec6a',
                    name: 'Smartgun System, Internal',
                    name_english: 'Smartgun System, Internal',
                    mount: 'None',
                    extramount: 'None',
                    rc: null,
                    conceal: '0',
                    avail: '+2R',
                    ratinglabel: 'String_Rating',
                    cost: '400',
                    owncost: '400',
                    weight: '0',
                    ownweight: '0',
                    included: 'False',
                    source: 'SR5',
                    page: '433',
                    accuracy: '+2',
                    gears: {
                        gear: [
                            {
                                guid: 'cf17ef4c-1535-4663-b64c-e1aedb53a996',
                                sourceid: '3a79e046-8106-4089-a1ab-895eee956b86',
                                name: 'Laser Range Finder',
                                name_english: 'Laser Range Finder',
                                category: 'Sensor Functions',
                                category_english: 'Sensor Functions',
                                ispersona: 'False',
                                isammo: 'False',
                                issin: 'False',
                                capacity: '[1]',
                                armorcapacity: '[1]',
                                maxrating: null,
                                rating: '0',
                                qty: '1',
                                avail: '0',
                                avail_english: '0',
                                cost: '0',
                                owncost: '1',
                                weight: '0',
                                ownweight: '0',
                                extra: null,
                                bonded: 'False',
                                equipped: 'True',
                                wirelesson: 'False',
                                location: null,
                                gearname: null,
                                source: 'SR5',
                                page: '446',
                                attack: '0',
                                sleaze: '0',
                                dataprocessing: '0',
                                firewall: '0',
                                devicerating: '0',
                                programlimit: '0',
                                iscommlink: 'False',
                                isprogram: 'False',
                                active: 'False',
                                homenode: 'False',
                                conditionmonitor: '8',
                                matrixcmfilled: '0',
                                children: null,
                                weaponbonusdamage: '+0',
                                weaponbonusdamage_english: '+0',
                                weaponbonusap: '+0',
                                weaponbonusacc: '+0',
                                weaponbonusrange: '0',
                                flechetteweaponbonusdamage: '+0',
                                flechetteweaponbonusdamage_english: '+0',
                                flechetteweaponbonusap: '+0',
                                flechetteweaponbonusacc: '+0',
                                flechetteweaponbonusrange: '0',
                                notes: 'Laser-Entfernungsmesser: Dieser einfache Sensor sendet einen Laserstrahl aus, der von der Oberfi äche eines Ziels re- fi ektiert und von einem Detektor erfasst wird, um die genaue Entfernung zum Ziel zu berechnen.',
                            },
                            {
                                guid: '77b8308d-40b6-4b3a-aa48-5244be279863',
                                sourceid: 'fa6fa434-107b-4f36-a138-f98b044dae76',
                                name: 'Camera, Micro',
                                name_english: 'Camera, Micro',
                                category: 'Vision Devices',
                                category_english: 'Vision Devices',
                                ispersona: 'False',
                                isammo: 'False',
                                issin: 'False',
                                capacity: '1',
                                armorcapacity: '[1]',
                                maxrating: null,
                                rating: '0',
                                qty: '1',
                                avail: '0',
                                avail_english: '0',
                                cost: '0',
                                owncost: '1',
                                weight: '0',
                                ownweight: '0',
                                extra: null,
                                bonded: 'False',
                                equipped: 'True',
                                wirelesson: 'False',
                                location: null,
                                gearname: null,
                                source: 'SR5',
                                page: '443',
                                attack: '0',
                                sleaze: '0',
                                dataprocessing: '0',
                                firewall: '0',
                                devicerating: '0',
                                programlimit: '0',
                                iscommlink: 'False',
                                isprogram: 'False',
                                active: 'False',
                                homenode: 'False',
                                conditionmonitor: '8',
                                matrixcmfilled: '0',
                                children: null,
                                weaponbonusdamage: '+0',
                                weaponbonusdamage_english: '+0',
                                weaponbonusap: '+0',
                                weaponbonusacc: '+0',
                                weaponbonusrange: '0',
                                flechetteweaponbonusdamage: '+0',
                                flechetteweaponbonusdamage_english: '+0',
                                flechetteweaponbonusap: '+0',
                                flechetteweaponbonusacc: '+0',
                                flechetteweaponbonusrange: '0',
                                notes: null,
                            },
                        ],
                    },
                    notes: null,
                },
                {
                    guid: 'b5e5dd9f-7b96-4254-b78c-c7beb6002ae3',
                    sourceid: '03243dcd-fe82-441c-bee7-971949e80a33',
                    name: 'Slumratte',
                    name_english: 'Slumratte',
                    mount: 'None',
                    extramount: 'None',
                    rc: null,
                    conceal: '-1',
                    avail: '0',
                    ratinglabel: 'String_Rating',
                    cost: '0',
                    owncost: '0',
                    weight: '0',
                    ownweight: '0',
                    included: 'False',
                    source: 'HT',
                    page: '184',
                    accuracy: '0',
                    notes: 'SLUMRATTE\n(KOSTEN: 5 KARMA)\nDer Charakter ist auf der Straße aufgewachsen und hat schnell gelernt, dass er das Wenige, das er besaß, gut verbergen musste. Und dass er nach Möglichkeit auch eine verborgene Waffe tragen sollte. Wenn der Charakter einen Gegenstand am eigenen Körper oder unter der Kleidung versteckt, wird dessen Tarnmodikator zusätzlich um 1 gesenkt. Der Charakter kann gleichzeitig höchstens eine Anzahl von [Geschicklichkeit ÷ 2] Gegenständen (aufgerundet) verstecken, damit diese die Senkung ihres Tarnmodikators erhalten.',
                },
                {
                    guid: 'e83a9839-6ee9-4e69-a207-795b250f3b14',
                    sourceid: 'a0d3e552-a575-42b0-a532-340a4d079ea5',
                    name: 'Markentreue',
                    name_english: 'Markentreue',
                    mount: 'None',
                    extramount: 'None',
                    rc: null,
                    conceal: '0',
                    avail: '0',
                    ratinglabel: 'String_Rating',
                    cost: '0',
                    owncost: '0',
                    weight: '0',
                    ownweight: '0',
                    included: 'False',
                    source: 'RG',
                    page: '127',
                    accuracy: '0',
                    notes: 'MARKENTREUE\nKOSTEN: 3 KARMA\nMarkentreue wird in der Sechsten Welt ins Extreme übersteigert.\nPersonen werden von ihren Konzernherren gehirngewaschen, und das kommt besonders bei Feuerwaffen zum Tragen. Manchmal kann Markentreue aber auch von Vorteil sein. Charaktere, die markentreu sind, kennen die Produkte ihrer Lieblingsmarke in- und auswendig. Diesen Vorteil gibt es auf zwei Ebenen: Hersteller und Produkt. Auf der Hersteller-Ebene wählt der Charakter einen Hersteller wie zum Beispiel Ares, Saeder-Krupp, Krime, H&K oder Novatech aus und erhält einen Würfelpoolbonus von +1 für jede Probe mit Geräten dieses Herstellers. Auf der Produkt-Ebene erhält er den Bonus nur für ein bestimmtes Gerät, wie zum Beispiel eine Ares Predator V, einen S-K-Bentley Concordat, eine Krime Kannon, eine HK227 oder ein Novatech Airware. Der Nachteil ist, dass ein Charakter, der so sehr von einer Marke abhängt, einen Würfelpoolmalus von -1 erhält, wenn er Geräte anderer Hersteller benutzt. Auf der Produkt-Ebene erhält er einen Würfelpoolmalus von -1 für alle Geräte desselben Typs anderer Hersteller, wie zum Beispiel schwere Pistolen, Autos, Maschinenpistolen, Sturmkanonen oder Kommlinks.',
                },
                {
                    guid: 'ac1e4eeb-2158-4f7e-a4d2-9d96a01ad759',
                    sourceid: '5cc39a55-3973-4368-81ee-c7a5c0432323',
                    name: 'Chameleon Coating (Pistol)',
                    name_english: 'Chameleon Coating (Pistol)',
                    mount: 'Side',
                    extramount: 'None',
                    rc: null,
                    conceal: '-2',
                    avail: '10R',
                    ratinglabel: 'String_Rating',
                    cost: '1,000',
                    owncost: '1,000',
                    weight: '0',
                    ownweight: '0',
                    included: 'False',
                    source: 'HT',
                    page: '180',
                    accuracy: '0',
                    notes: null,
                },
                {
                    guid: '5c74273b-5d82-48b1-bf14-ba385733a31e',
                    sourceid: '21bc8b85-3fd7-4bde-ac8d-35e1fa099f21',
                    name: 'Improved Range Finder',
                    name_english: 'Improved Range Finder',
                    mount: 'Barrel',
                    extramount: 'None',
                    rc: null,
                    conceal: '0',
                    avail: '6',
                    ratinglabel: 'String_Rating',
                    cost: '2,000',
                    owncost: '2,000',
                    weight: '0',
                    ownweight: '0',
                    included: 'False',
                    source: 'RG',
                    page: '52',
                    accuracy: '0',
                    notes: null,
                },
                {
                    guid: '4026928a-e7e8-4e95-ad9e-65657716744f',
                    sourceid: '93be91c1-3f77-4e7b-9ac2-eb349b76d017',
                    name: 'Special Modification: Improved Concealment',
                    name_english: 'Special Modification: Improved Concealment',
                    mount: 'None',
                    extramount: 'None',
                    rc: null,
                    conceal: '-1',
                    avail: '0',
                    ratinglabel: 'String_Rating',
                    cost: '0',
                    owncost: '0',
                    weight: '0',
                    ownweight: '0',
                    included: 'False',
                    source: 'BTB',
                    page: '161',
                    accuracy: '0',
                    notes: null,
                },
                {
                    guid: '23e5f9b6-2038-4f50-92aa-09ad6d7c4b39',
                    sourceid: 'b741b729-106e-46f2-9143-0f745fd48789',
                    name: 'Special Modification: Improved AP',
                    name_english: 'Special Modification: Improved AP',
                    mount: 'None',
                    extramount: 'None',
                    rc: null,
                    conceal: '0',
                    avail: '0',
                    ratinglabel: 'String_Rating',
                    cost: '0',
                    owncost: '0',
                    weight: '0',
                    ownweight: '0',
                    included: 'False',
                    source: 'BTB',
                    page: '161',
                    accuracy: '0',
                    notes: null,
                },
                {
                    guid: '43ced279-1a49-427b-8ea8-1aa2eec0a78c',
                    sourceid: '4c47baf0-6b34-4e00-8627-a0f605f84ba0',
                    name: 'Speed Loader',
                    name_english: 'Speed Loader',
                    mount: 'None',
                    extramount: 'None',
                    rc: null,
                    conceal: '0',
                    avail: '2',
                    ratinglabel: 'String_Rating',
                    cost: '25',
                    owncost: '25',
                    weight: '0',
                    ownweight: '0',
                    included: 'False',
                    source: 'SR5',
                    page: '433',
                    accuracy: '0',
                    notes: 'Schnelllader: Der Schnelllader ist eine einfache Vorrich- tung, die einen Ring von Kugeln hält, die dadurch schneller in die Trommel eines Revolvers geladen werden können. Je- der Schnelllader ist speziell für die Waffe angepasst, für die er entwickelt wurde. Mit einem Schnelllader kann man einen Re- volver mittels einer Komplexen Handlung vollständig laden, statt eine Kugel nach der anderen reinschieben zu müssen (s. Tabelle Waffen Nachladen, S. 165).',
                },
                {
                    guid: '277204e1-5a44-4d0f-af2a-94e6f6280b71',
                    sourceid: '4c47baf0-6b34-4e00-8627-a0f605f84ba0',
                    name: 'Speed Loader',
                    name_english: 'Speed Loader',
                    mount: 'None',
                    extramount: 'None',
                    rc: null,
                    conceal: '0',
                    avail: '2',
                    ratinglabel: 'String_Rating',
                    cost: '25',
                    owncost: '25',
                    weight: '0',
                    ownweight: '0',
                    included: 'False',
                    source: 'SR5',
                    page: '433',
                    accuracy: '0',
                    notes: 'Schnelllader: Der Schnelllader ist eine einfache Vorrich- tung, die einen Ring von Kugeln hält, die dadurch schneller in die Trommel eines Revolvers geladen werden können. Je- der Schnelllader ist speziell für die Waffe angepasst, für die er entwickelt wurde. Mit einem Schnelllader kann man einen Re- volver mittels einer Komplexen Handlung vollständig laden, statt eine Kugel nach der anderen reinschieben zu müssen (s. Tabelle Waffen Nachladen, S. 165).',
                },
                {
                    guid: '2c78e5bd-2921-4605-b88f-130838ecd8d5',
                    sourceid: '4c47baf0-6b34-4e00-8627-a0f605f84ba0',
                    name: 'Speed Loader',
                    name_english: 'Speed Loader',
                    mount: 'None',
                    extramount: 'None',
                    rc: null,
                    conceal: '0',
                    avail: '2',
                    ratinglabel: 'String_Rating',
                    cost: '25',
                    owncost: '25',
                    weight: '0',
                    ownweight: '0',
                    included: 'False',
                    source: 'SR5',
                    page: '433',
                    accuracy: '0',
                    notes: 'Schnelllader: Der Schnelllader ist eine einfache Vorrich- tung, die einen Ring von Kugeln hält, die dadurch schneller in die Trommel eines Revolvers geladen werden können. Je- der Schnelllader ist speziell für die Waffe angepasst, für die er entwickelt wurde. Mit einem Schnelllader kann man einen Re- volver mittels einer Komplexen Handlung vollständig laden, statt eine Kugel nach der anderen reinschieben zu müssen (s. Tabelle Waffen Nachladen, S. 165).',
                },
                {
                    guid: '8f08edfb-1465-4338-a73e-3600b2a3cbde',
                    sourceid: '4c47baf0-6b34-4e00-8627-a0f605f84ba0',
                    name: 'Speed Loader',
                    name_english: 'Speed Loader',
                    mount: 'None',
                    extramount: 'None',
                    rc: null,
                    conceal: '0',
                    avail: '2',
                    ratinglabel: 'String_Rating',
                    cost: '25',
                    owncost: '25',
                    weight: '0',
                    ownweight: '0',
                    included: 'False',
                    source: 'SR5',
                    page: '433',
                    accuracy: '0',
                    notes: 'Schnelllader: Der Schnelllader ist eine einfache Vorrich- tung, die einen Ring von Kugeln hält, die dadurch schneller in die Trommel eines Revolvers geladen werden können. Je- der Schnelllader ist speziell für die Waffe angepasst, für die er entwickelt wurde. Mit einem Schnelllader kann man einen Re- volver mittels einer Komplexen Handlung vollständig laden, statt eine Kugel nach der anderen reinschieben zu müssen (s. Tabelle Waffen Nachladen, S. 165).',
                },
                {
                    guid: '84eb2269-929f-4d20-a31e-1c82b932fe54',
                    sourceid: '806bfacc-095e-448d-a5b2-c271c569ae51',
                    name: 'Melee Hardening',
                    name_english: 'Melee Hardening',
                    mount: 'None',
                    extramount: 'None',
                    rc: null,
                    conceal: '0',
                    avail: '6',
                    ratinglabel: 'String_Rating',
                    cost: '500',
                    owncost: '500',
                    weight: '0',
                    ownweight: '0',
                    included: 'False',
                    source: 'HT',
                    page: '181',
                    accuracy: '0',
                    notes: null,
                },
            ],
        },
        ranges: [
            {
                name: 'Heavy Pistols',
                short: '0-5',
                medium: '6-20',
                long: '21-40',
                extreme: '41-60',
            },
            {
                name: 'Heavy Pistols',
                short: '0-5',
                medium: '6-20',
                long: '21-40',
                extreme: '41-60',
            },
        ],
        alternateranges: [
            {
                name: null,
                short: null,
                medium: null,
                long: null,
                extreme: null,
            },
            {
                name: null,
                short: null,
                medium: null,
                long: null,
                extreme: null,
            },
        ],
        availableammo: '140',
        currentammo: 'Ammo +DV: Gel Rounds',
        clips: {
            clip: [
                {
                    name: 'Ammo +DV: Gel Rounds',
                    count: '6',
                    location: 'loaded',
                    id: 'b1b49412-d21c-4bbe-87fc-667f9f963422',
                    ammotype: {
                        weaponbonusdamage: '+2S',
                        weaponbonusdamage_english: '+2S',
                        weaponbonusap: '+1',
                        weaponbonusacc: '+0',
                        weaponbonusrange: '0',
                        flechetteweaponbonusdamage: '+0',
                        flechetteweaponbonusdamage_english: '+0',
                        flechetteweaponbonusap: '+0',
                        flechetteweaponbonusacc: '+0',
                        flechetteweaponbonusrange: '0',
                        DV: '+2S',
                        BonusRange: '0',
                    },
                },
                {
                    name: 'Ammo +DV: APDS',
                    count: '6',
                    location: 'loaded',
                    id: '7f937f11-bcdd-4472-a840-c645143ddfa8',
                    ammotype: {
                        weaponbonusdamage: '+1',
                        weaponbonusdamage_english: '+1',
                        weaponbonusap: '-4',
                        weaponbonusacc: '+0',
                        weaponbonusrange: '0',
                        flechetteweaponbonusdamage: '+0',
                        flechetteweaponbonusdamage_english: '+0',
                        flechetteweaponbonusap: '+0',
                        flechetteweaponbonusacc: '+0',
                        flechetteweaponbonusrange: '0',
                        DV: '+1',
                        BonusRange: '0',
                    },
                },
                {
                    name: 'Ammo: APDS',
                    count: '6',
                    location: 'loaded',
                    id: '2e466af5-71c9-4051-8c87-3059c5c9605c',
                    ammotype: {
                        weaponbonusdamage: '+0',
                        weaponbonusdamage_english: '+0',
                        weaponbonusap: '-4',
                        weaponbonusacc: '+0',
                        weaponbonusrange: '0',
                        flechetteweaponbonusdamage: '+0',
                        flechetteweaponbonusdamage_english: '+0',
                        flechetteweaponbonusap: '+0',
                        flechetteweaponbonusacc: '+0',
                        flechetteweaponbonusrange: '0',
                        DV: '+0',
                        BonusRange: '0',
                    },
                },
                {
                    name: 'Ammo +DV: Explosive Rounds',
                    count: '6',
                    location: 'loaded',
                    id: '172fa39f-ce43-4533-86a9-4a6ebf304b1c',
                    ammotype: {
                        weaponbonusdamage: '+2',
                        weaponbonusdamage_english: '+2',
                        weaponbonusap: '-1',
                        weaponbonusacc: '+0',
                        weaponbonusrange: '0',
                        flechetteweaponbonusdamage: '+0',
                        flechetteweaponbonusdamage_english: '+0',
                        flechetteweaponbonusap: '+0',
                        flechetteweaponbonusacc: '+0',
                        flechetteweaponbonusrange: '0',
                        DV: '+2',
                        BonusRange: '0',
                    },
                },
                {
                    name: 'Ammo: Tracker Rounds, Stealth Tag',
                    count: '6',
                    location: 'loaded',
                    id: '95deb6d2-db28-4d0c-bdae-39312468b184',
                    ammotype: {
                        weaponbonusdamage: '+0',
                        weaponbonusdamage_english: '+0',
                        weaponbonusap: '+0',
                        weaponbonusacc: '+0',
                        weaponbonusrange: '0',
                        flechetteweaponbonusdamage: '+0',
                        flechetteweaponbonusdamage_english: '+0',
                        flechetteweaponbonusap: '+0',
                        flechetteweaponbonusacc: '+0',
                        flechetteweaponbonusrange: '0',
                        DV: '+0',
                        BonusRange: '0',
                    },
                },
            ],
        },
        dicepool: '23',
        dicepool_noammo: '23',
        skill: 'Pistols',
        wirelesson: 'True',
        notes: null,
    };

    const weaponParser = new WeaponParser();

    beforeEach(async () => {
        chummerCharacter = {};
    });

    describe('Weapon Parser can handle inputs', () => {
        it('has null in character', async () => {
            chummerCharacter = {
                weapons: null,
            };

            const weapons = await weaponParser.parseWeapons(chummerCharacter);

            assert.lengthOf(weapons, 0);
        });

        it('has empty array in character', async () => {
            chummerCharacter = {
                weapons: [],
            };

            const weapons = await weaponParser.parseWeapons(chummerCharacter);

            assert.lengthOf(weapons, 0);
        });

        it('is missing weapons in character', async () => {
            const weapons = await weaponParser.parseWeapons(chummerCharacter);

            assert.lengthOf(weapons, 0);
        });

        it('has weapon in character', async () => {
            chummerCharacter = {
                weapons: {
                    weapon: chummerRangedWeapon,
                },
            };
            const weapons = await weaponParser.parseWeapons(chummerCharacter);

            assert.lengthOf(weapons, 1);
        });

        it('weaponArray with empty array', async () => {
            const weapons = await weaponParser.parseWeaponArray([]);

            assert.lengthOf(weapons, 0);
        });

        it('weaponArray with one weapon', async () => {
            const chummerWeapons = [chummerRangedWeapon];
            const weapons = await weaponParser.parseWeaponArray(chummerWeapons);

            assert.lengthOf(weapons, 1);
        });
    });

    describe('Weapon Parser imports weapon', () => {
        it('weapon with values - english', async () => {
            chummerCharacter = {
                weapons: {
                    weapon: chummerRangedWeapon,
                },
            };
            const weapons = await weaponParser.parseWeapons(chummerCharacter);

            assert.lengthOf(weapons, 1);
            const weapon = weapons[0];

            //general info
            assert.strictEqual(weapon.name, 'Ruger Super Warhawk');
            assert.strictEqual(weapon.type, 'weapon');

            //action
            assert.strictEqual(weapon.system.action.attribute, 'agility');
            assert.strictEqual(weapon.system.action.damage.base, 9);
            assert.strictEqual(weapon.system.action.damage.ap.base, -2);
            assert.strictEqual(weapon.system.action.damage.type.base, 'physical');
            assert.strictEqual(weapon.system.action.limit.base, 5);
            assert.strictEqual(weapon.system.action.type, 'varies');

            //category
            assert.strictEqual(weapon.system.category, 'range');

            //description
            assert.strictEqual(weapon.system.description.source, 'SR5 427');

            //import flags
            assert.strictEqual(weapon.system.importFlags.isFreshImport, true);

            //range
            assert.strictEqual(weapon.system.range.ranges.extreme, 60);
            assert.strictEqual(weapon.system.range.ranges.long, 40);
            assert.strictEqual(weapon.system.range.ranges.medium, 20);
            assert.strictEqual(weapon.system.range.ranges.short, 5);
            assert.strictEqual(weapon.system.range.modes.single_shot, true);

            //technology
        });
    });
};
