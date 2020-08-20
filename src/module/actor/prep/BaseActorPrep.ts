import SR5ActorType = Shadowrun.SR5ActorType;
import { SR5ItemDataWrapper } from '../../item/SR5ItemDataWrapper';
import SR5ActorData = Shadowrun.SR5ActorData;
import { Helpers } from '../../helpers';
import { PartsList } from '../../parts/PartsList';

export class BaseActorPrep {
    data: SR5ActorData;
    items: SR5ItemDataWrapper[];

    constructor(data: SR5ActorType) {
        this.data = data.data;
        this.items = data.items.map((item) => new SR5ItemDataWrapper(item));
    }
    /**
     * Prepare Matrix data on the actor
     * - if an item is equipped, it will use that data
     * - if it isn't and player is technomancer, it will use that data
     */
    prepareMatrix() {
        const { matrix, attributes, limits } = this.data;

        const MatrixList = ['firewall', 'sleaze', 'data_processing', 'attack'];

        // clear matrix data to defaults
        MatrixList.forEach((key) => {
            const parts = new PartsList(matrix[key].mod);
            parts.addUniquePart('SR5.Temporary', matrix[key].temp);
            matrix[key].mod = parts.list;
            matrix[key].value = parts.total;
        });
        matrix.condition_monitor.max = 0;
        matrix.rating = 0;
        matrix.name = '';
        matrix.device = '';

        // get the first equipped device, we don't care if they have more equipped -- it shouldn't happen
        const device = this.items.find((item) => item.isEquipped() && item.isDevice());

        if (device) {
            const conditionMonitor = device.getConditionMonitor();
            matrix.device = device.getId();
            matrix.condition_monitor.max = conditionMonitor.max;
            matrix.condition_monitor.value = conditionMonitor.value;
            matrix.rating = device.getRating();
            matrix.is_cyberdeck = device.isCyberdeck();
            matrix.name = device.getName();
            matrix.item = device.getData();
            const deviceAtts = device.getASDF();
            if (deviceAtts) {
                // setup the actual matrix attributes for the actor
                for (const [key, value] of Object.entries(deviceAtts)) {
                    if (value && matrix[key]) {
                        matrix[key].value += value.value;
                        matrix[key].device_att = value.device_att;
                    }
                }
            }
        } // if we don't have a device, use living persona
        else if (this.data.special === 'resonance') {
            matrix.firewall.value += Helpers.calcTotal(attributes.willpower);
            matrix.data_processing.value += Helpers.calcTotal(attributes.logic);
            matrix.rating = Helpers.calcTotal(attributes.resonance);
            matrix.attack.value += Helpers.calcTotal(attributes.charisma);
            matrix.sleaze.value += Helpers.calcTotal(attributes.intuition);
            matrix.name = game.i18n.localize('SR5.LivingPersona');
        }

        // set matrix condition monitor to max if greater than
        if (matrix.condition_monitor.value > matrix.condition_monitor.max) {
            matrix.condition_monitor.value = matrix.condition_monitor.max;
        }

        // add matrix attributes to both limits and attributes as hidden entries
        MatrixList.forEach((key) => {
            if (matrix[key]) {
                const label = CONFIG.SR5.matrixAttributes[key];
                const { value, base, mod } = matrix[key];
                const hidden = true;

                limits[key] = {
                    value,
                    base,
                    mod,
                    label,
                    hidden,
                };
                attributes[key] = {
                    value,
                    base,
                    mod,
                    label,
                    hidden,
                };
            }
        });
    }

    /**
     * Prepare the armor data for the Item
     * - will only allow one "Base" armor item to be used
     * - all "accessories" will be added to the armor
     */
    prepareArmor() {
        const { armor } = this.data;
        armor.base = 0;
        armor.value = 0;
        armor.mod = [];
        for (const element of Object.keys(CONFIG.SR5.elementTypes)) {
            armor[element] = 0;
        }

        const equippedArmor = this.items.filter((item) => item.isArmor() && item.isEquipped());
        const armorModParts = new PartsList<number>(armor.mod);
        equippedArmor?.forEach((item) => {
            if (item.isArmorAccessory()) {
                armorModParts.addUniquePart(item.getName(), item.getArmorValue());
            } // if not a mod, set armor.value to the items value
            else {
                armor.base = item.getArmorValue();
                armor.label = item.getName();
                for (const element of Object.keys(CONFIG.SR5.elementTypes)) {
                    armor[element] = item.getArmorElements()[element];
                }
            }
        });

        if (this.data.modifiers['armor']) armorModParts.addUniquePart(game.i18n.localize('SR5.Bonus'), this.data.modifiers['armor']);
        // SET ARMOR
        armor.value = Helpers.calcTotal(armor);
    }

    /**
     * Prepare actor data for cyberware changes
     * - this calculates the actors essence
     */
    prepareCyberware() {
        const { attributes } = this.data;
        let totalEssence = 6;
        this.items
            .filter((item) => item.isCyberware() && item.isEquipped())
            .forEach((item) => {
                if (item.getEssenceLoss()) {
                    totalEssence -= Number(item.getEssenceLoss());
                }
            });
        attributes.essence.base = +(totalEssence + Number(this.data.modifiers['essence'] || 0)).toFixed(3);
    }

    /**
     * Prepare actor data for attributes
     */
    prepareAttributes() {
        const { attributes } = this.data;

        // hide attributes if we aren't special
        attributes.magic.hidden = !(this.data.special === 'magic');
        attributes.resonance.hidden = !(this.data.special === 'resonance');

        // set the value for the attributes
        for (let [key, attribute] of Object.entries(attributes)) {
            // this turns the Object model into the list mod
            if (typeof attribute.mod === 'object') {
                attribute.mod = new PartsList(attribute.mod).list;
            }
            PartsList.AddUniquePart(attribute.mod, 'SR5.Temporary', attribute.temp);
            Helpers.calcTotal(attribute);
            // add labels
            attribute.label = CONFIG.SR5.attributes[key];
        }

        // CALCULATE RECOIL
        this.data.recoil_compensation = 1 + Math.ceil(attributes.strength.value / 3);
    }

    /**
     * Prepare actor data for skills
     */
    prepareSkills() {
        const { language, active, knowledge } = this.data.skills;
        if (language) {
            if (!language.value) language.value = {};
            language.attribute = 'intuition';
        }

        // function that will set the total of a skill correctly
        const prepareSkill = (skill) => {
            skill.mod = [];
            if (!skill.base) skill.base = 0;
            if (skill.bonus?.length) {
                for (let bonus of skill.bonus) {
                    PartsList.AddUniquePart(skill.mod, bonus.key, bonus.value);
                }
            }
            Helpers.calcTotal(skill);
        };

        // setup active skills
        for (const skill of Object.values(active)) {
            if (!skill.hidden) {
                prepareSkill(skill);
            }
        }

        const entries = Object.entries(this.data.skills.language.value);
        // remove entries which are deleted TODO figure out how to delete these from the data
        entries.forEach(([key, val]: [string, { _delete?: boolean }]) => val._delete && delete this.data.skills.language.value[key]);

        for (let skill of Object.values(language.value)) {
            prepareSkill(skill);
            skill.attribute = 'intuition';
        }

        // setup knowledge skills
        for (let [, group] of Object.entries(knowledge)) {
            const entries = Object.entries(group.value);
            // remove entries which are deleted TODO figure out how to delete these from the data
            group.value = entries
                .filter(([, val]) => !val._delete)
                .reduce((acc, [id, skill]) => {
                    prepareSkill(skill);

                    // set the attribute on the skill
                    skill.attribute = group.attribute;
                    acc[id] = skill;
                    return acc;
                }, {});
        }

        // skill labels
        for (let [skillKey, skillValue] of Object.entries(active)) {
            skillValue.label = CONFIG.SR5.activeSkills[skillKey];
        }
    }

    /**
     * Prepare the actor data limits
     */
    prepareLimits() {
        const { limits, attributes, modifiers } = this.data;

        // SETUP LIMITS
        limits.physical.value =
            Math.ceil((2 * attributes.strength.value + attributes.body.value + attributes.reaction.value) / 3) + Number(modifiers['physical_limit']);
        limits.mental.value =
            Math.ceil((2 * attributes.logic.value + attributes.intuition.value + attributes.willpower.value) / 3) + Number(modifiers['mental_limit']);
        limits.social.value =
            Math.ceil((2 * attributes.charisma.value + attributes.willpower.value + attributes.essence.value) / 3) + Number(modifiers['social_limit']);

        // limit labels
        for (let [limitKey, limitValue] of Object.entries(limits)) {
            limitValue.label = CONFIG.SR5.limits[limitKey];
        }
    }

    /**
     * Prepare actor data condition monitors (aka Tracks)
     */
    prepareConditionMonitors() {
        const { track, attributes, modifiers } = this.data;

        // TODO we will have grunts eventually that only have one track
        track.physical.max = 8 + Math.ceil(attributes.body.value / 2) + Number(modifiers['physical_track']);
        track.physical.overflow.max = attributes.body.value;
        track.stun.max = 8 + Math.ceil(attributes.willpower.value / 2) + Number(modifiers['stun_track']);

        // tracks
        for (let [trackKey, trackValue] of Object.entries(track)) {
            trackValue.label = CONFIG.SR5.damageTypes[trackKey];
        }
    }

    /**
     * Prepare actor data movement
     */
    prepareMovement() {
        const { attributes, modifiers } = this.data;
        const movement = this.data.movement;
        // default movement: WALK = AGI * 2, RUN = AGI * 4
        movement.walk.value = attributes.agility.value * (2 + Number(modifiers['walk']));
        movement.run.value = attributes.agility.value * (4 + Number(modifiers['run']));
    }

    /**
     * Prepare the modifiers that are displayed in the Misc. tab
     */
    prepareModifiers() {
        if (!this.data.modifiers) this.data.modifiers = {};
        const modifiers = {};
        let miscTabModifiers = [
            'soak',
            'drain',
            'armor',
            'physical_limit',
            'social_limit',
            'mental_limit',
            'stun_track',
            'physical_track',
            'meat_initiative',
            'meat_initiative_dice',
            'astral_initiative',
            'astral_initiative_dice',
            'matrix_initiative',
            'matrix_initiative_dice',
            'composure',
            'lift_carry',
            'judge_intentions',
            'memory',
            'walk',
            'run',
            'defense',
            'wound_tolerance',
            'essence',
            'fade',
        ];
        miscTabModifiers.sort();
        // force global to the top
        miscTabModifiers.unshift('global');

        for (let item of miscTabModifiers) {
            modifiers[item] = Number(this.data.modifiers[item]) || 0;
        }

        this.data.modifiers = modifiers;
    }

    /**
     * Prepare actor data for initiative
     */
    prepareInitiative() {
        const { initiative, attributes, modifiers, matrix } = this.data;
        initiative.meatspace.base.base = attributes.intuition.value + attributes.reaction.value + Number(modifiers['meat_initiative']);
        initiative.meatspace.dice.base = 1 + Number(modifiers['meat_initiative_dice']);
        initiative.astral.base.base = attributes.intuition.value * 2 + Number(modifiers['astral_initiative']);
        initiative.astral.dice.base = 2 + Number(modifiers['astral_initiative_dice']);
        initiative.matrix.base.base = attributes.intuition.value + this.data.matrix.data_processing.value + Number(modifiers['matrix_initiative']);
        initiative.matrix.dice.base = matrix.hot_sim ? 4 : 3 + Number(modifiers['matrix_initiative_dice']);
        if (initiative.perception === 'matrix') initiative.current = initiative.matrix;
        else if (initiative.perception === 'astral') initiative.current = initiative.astral;
        else {
            initiative.current = initiative.meatspace;
            initiative.perception = 'meatspace';
        }
        initiative.current.dice.value = initiative.current.dice.base;
        if (initiative.edge) initiative.current.dice.value = 5;
        initiative.current.dice.value = Math.min(5, initiative.current.dice.value); // maximum of 5d6 for initiative
        initiative.current.dice.text = `${initiative.current.dice.value}d6`;
        initiative.current.base.value = initiative.current.base.base;
    }

    /**
     * Prepare actor data for wounds
     */
    prepareWounds() {
        const { modifiers, track } = this.data;
        const count = 3 + Number(modifiers['wound_tolerance']);
        const stunWounds = Math.floor(this.data.track.stun.value / count);
        const physicalWounds = Math.floor(this.data.track.physical.value / count);

        track.stun.wounds = stunWounds;
        track.physical.wounds = physicalWounds;

        this.data.wounds = {
            value: stunWounds + physicalWounds,
        };
    }
}
