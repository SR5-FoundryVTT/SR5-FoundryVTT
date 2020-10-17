import { SR5ItemDataWrapper } from '../../../item/SR5ItemDataWrapper';
import { ItemPrep } from './ItemPrep';
import SR5ActorData = Shadowrun.SR5ActorData;
import SR5ItemType = Shadowrun.SR5ItemType;
import ActorArmor = Shadowrun.ActorArmor;
import KnowledgeSkillList = Shadowrun.KnowledgeSkillList;
import KnowledgeSkills = Shadowrun.KnowledgeSkills;
import Magic = Shadowrun.Magic;
import Movement = Shadowrun.Movement;
import NPCActorData = Shadowrun.NPCActorData;
import ActorMatrix = Shadowrun.ActorMatrix;
import SpecialTrait = Shadowrun.SpecialTrait;
import Tracks = Shadowrun.Tracks;
import WoundType = Shadowrun.WoundType;

function makeDefaultActor(): SR5ActorData {
    let tracks: Tracks = {
        physical: {
            base: 0,
            value: 0,
            max: 0,
            mod: [],
            label: "",
            disabled: false,
            wounds: 0,
            overflow: {
                value: 0,
                max: 0,
            },
        },
        stun: {
            base: 0,
            value: 0,
            max: 0,
            mod: [],
            label: "",
            disabled: false,
            wounds: 0,
        },
    }
    let armor: ActorArmor = {
        base: 0,
        value: 0,
        mod: [],
        fire: 0,
        electric: 0,
        cold: 0,
        acid: 0,
        label: "",
    }
    let magic: Magic = {
        attribute: "logic",
        projecting: false,
        drain: {
            base: 0,
            value: 0,
            mod: [],
        }
    }
    let wounds: WoundType = {
        value: 0,
    }
    let matrix: ActorMatrix = {
        dice: {
            base: 0,
            value: 0,
            mod: [],
        },
        base: {
            base: 0,
            value: 0,
            mod: [],
        },
        attack: {
            base: 0,
            value: 0,
            mod: [],
            device_att: "",
            hidden: false,
            label: "",
            limit: "",
            temp: 0,
        },
        sleaze: {
            base: 0,
            value: 0,
            mod: [],
            device_att: "",
            hidden: false,
            label: "",
            limit: "",
            temp: 0,
        },
        data_processing: {
            base: 0,
            value: 0,
            mod: [],
            device_att: "",
            hidden: false,
            label: "",
            limit: "",
            temp: 0,
        },
        firewall: {
            base: 0,
            value: 0,
            mod: [],
            device_att: "",
            hidden: false,
            label: "",
            limit: "",
            temp: 0,
        },
        condition_monitor: {
            value: 0,
            max: 0,
            label: "",
        },
        rating: 0,
        name: "",
        device: "",
        is_cyberdeck: false,
        hot_sim: false,
        item: "",
    }
    let movement: Movement = {
        walk: {
            value: 0,
            mult: 0,
            base: 0,
        },
        run: {
            value: 0,
            mult: 0,
            base: 0,
        },
        sprint: 0,
        swimming: 0,
    }
    let npcActorData: NPCActorData = {
        is_npc: false,
        npc: {
            is_grunt: false,
            professional_rating: 0,
        }
    }
    let languages: KnowledgeSkillList = {
        attribute: 'logic',
        value: {
            "athletics": {
                name: "",
                base: 0,
                value: 0,
                hidden: false,
                mod: [],
                label: "",
                bonus: [{
                    key: "",
                    value: 0,
                }],
                attribute: "logic",
                specs: [],
            }
        },
    }
    let knowledges: KnowledgeSkills = {
        street: {
            attribute: 'logic',
            value: {
                "athletics": {
                    name: "",
                    base: 0,
                    value: 0,
                    hidden: false,
                    mod: [],
                    label: "",
                    bonus: [{
                        key: "",
                        value: 0,
                    }],
                    attribute: "logic",
                    specs: [],
                }
            },
        },
        academic: {
            attribute: 'logic',
            value: {
                "athletics": {
                    name: "",
                    base: 0,
                    value: 0,
                    hidden: false,
                    mod: [],
                    label: "",
                    bonus: [{
                        key: "",
                        value: 0,
                    }],
                    attribute: "logic",
                    specs: [],
                }
            },
        },
        professional: {
            attribute: 'logic',
            value: {
                "athletics": {
                    name: "",
                    base: 0,
                    value: 0,
                    hidden: false,
                    mod: [],
                    label: "",
                    bonus: [{
                        key: "",
                        value: 0,
                    }],
                    attribute: "logic",
                    specs: [],
                }
            },
        },
        interests: {
            attribute: 'logic',
            value: {
                "athletics": {
                    name: "",
                    base: 0,
                    value: 0,
                    hidden: false,
                    mod: [],
                    label: "",
                    bonus: [{
                        key: "",
                        value: 0,
                    }],
                    attribute: "logic",
                    specs: [],
                }
            },
        },
    }
    let special: SpecialTrait = "mundane";
    let other = {
        attributes: {
            edge: {
                base: 0,
                value: 0,
                max: 0,
                mod: [],
                hidden: false,
                label: "",
                uses: 0,
            },
            essence: {
                base: 0,
                value: 0,
                max: 0,
                mod: [],
                hidden: false,
                label: "",
            },
        },
        limits: {},
        skills: {
            active: {},
            language: languages,
            knowledge: knowledges,
        },
        modifiers: {},
        special: special,
        initiative: {
            perception: "",
            meatspace: {
                base: {
                    base: 0,
                    value: 0,
                    mod: [],
                },
                dice: {
                    base: 0,
                    value: 0,
                    mod: [],
                    text: "",
                },
            },
            matrix: {
                base: {
                    base: 0,
                    value: 0,
                    mod: [],
                },
                dice: {
                    base: 0,
                    value: 0,
                    mod: [],
                    text: "",
                },
            },
            astral: {
                base: {
                    base: 0,
                    value: 0,
                    mod: [],
                },
                dice: {
                    base: 0,
                    value: 0,
                    mod: [],
                    text: "",
                },
            },
            current: {
                base: {
                    base: 0,
                    value: 0,
                    mod: [],
                },
                dice: {
                    base: 0,
                    value: 0,
                    mod: [],
                    text: "",
                },
            },
            edge: false,
        },
        recoil_compensation: 0,
        metatype: "troll",
    }
    let sr5ActorData: SR5ActorData = {
        track: tracks,
        armor: armor,
        magic: magic,
        wounds: wounds,
        matrix: matrix,
        movement: movement,
        ...npcActorData,
        ...other
    };
    return sr5ActorData;
}

test('Essence without Cyberware is 6', () => {
    let actor = makeDefaultActor()
    ItemPrep.prepareCyberware(actor, []);
    expect(actor.attributes.essence.value).toBe(6);
});

test('Essence with 2 points of cyberware is 4', () => {
    let actor = makeDefaultActor()
    let itemData = {
        name: "Wired Reflexes",
        _id: "1",
        folder: null,
        type: "cyberware",
        data: {
            description: {
                value: "Wired Reflexes",
                chat: "",
                source: ""
            },
            technology: {
                rating: 2,
                availability: "",
                quantity: 1,
                cost: 0,
                conceal: {
                    base: 0,
                    value: 0,
                    mod: [],
                },
                equipped: true,
            },
            essence: 2.0,
        },
        flags: {},
        permission: { default: 0 },
    }
    let wiredReflexes = new SR5ItemDataWrapper(itemData);
    ItemPrep.prepareCyberware(actor, [wiredReflexes]);
    expect(actor.attributes.essence.value).toBe(4);
})
