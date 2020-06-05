import { DiceSR } from '../dice';
import { Helpers } from '../helpers';
import DeviceData = Shadowrun.DeviceData;
import { SR5Actor } from '../actor/SR5Actor';

export class SR5Item extends Item {
    labels: {};
    items: SR5Item[];
    actor: SR5Actor;

    async update(data, options?) {
        const ret = super.update(data, options);
        ret.then(() => {
            if (this.actor) {
                this.actor.render();
            }
        });
        return ret;
    }
    get hasOpposedRoll() {
        return !!(this.data.data.action && this.data.data.action.opposed.type);
    }

    get hasRoll() {
        return !!(this.data.data.action && this.data.data.action.type !== '');
    }

    prepareData() {
        super.prepareData();
        const labels = {};
        const item = this.data;

        if (item.type === 'sin') {
            if (typeof item.data.licenses === 'object') {
                item.data.licenses = Object.values(item.data.licenses);
            }
        }
        const equippedMods = this.getEquippedMods();
        const equippedAmmo = this.getEquippedAmmo();

        const { technology, range, action } = item.data;

        if (technology?.conceal) {
            technology.conceal.mod = {};
            equippedMods.forEach((mod) => {
                if (technology?.conceal && mod.data.data.technology.conceal.value) {
                    technology.conceal.mod[mod.name] = mod.data.data.technology.conceal.value;
                }
            });

            technology.conceal.value =
                technology.conceal.base + Helpers.totalMods(technology.conceal.mod);
        }

        if (action) {
            action.alt_mod = 0;
            action.limit.mod = {};
            action.damage.mod = {};
            action.damage.ap.mod = {};
            action.dice_pool_mod = {};
            // handle overrides from mods
            equippedMods.forEach((mod) => {
                if (mod.data.data.accuracy) action.limit.mod[mod.name] = mod.data.data.accuracy;
                if (mod.data.data.dice_pool)
                    action.dice_pool_mod[mod.name] = mod.data.data.dice_pool;
            });

            if (equippedAmmo) {
                // add mods to damage from ammo
                action.damage.mod[`SR5.Ammo ${equippedAmmo.name}`] = equippedAmmo.data.data.damage;
                // add mods to ap from ammo
                action.damage.ap.mod[`SR5.Ammo ${equippedAmmo.name}`] = equippedAmmo.data.data.ap;

                // override element
                if (equippedAmmo.data.data.element) {
                    action.damage.element.value = equippedAmmo.data.data.element;
                } else {
                    action.damage.element.value = action.damage.element.base;
                }

                // override damage type
                if (equippedAmmo.data.data.damageType) {
                    action.damage.type.value = equippedAmmo.data.data.damageType;
                } else {
                    action.damage.type.value = action.damage.type.base;
                }
            } else {
                // set value if we don't have item overrides
                action.damage.element.value = action.damage.element.base;
                action.damage.type.value = action.damage.type.base;
            }

            // once all damage mods have been accounted for, sum base and mod to value
            action.damage.value = action.damage.base + Helpers.totalMods(action.damage.mod);
            action.damage.ap.value =
                action.damage.ap.base + Helpers.totalMods(action.damage.ap.mod);

            action.limit.value = action.limit.base + Helpers.totalMods(action.limit.mod);

            if (this.actor) {
                if (action.damage.attribute) {
                    action.damage.value += this.actor.data.data.attributes[
                        action.damage.attribute
                    ].value;
                }
                if (action.limit.attribute) {
                    action.limit.value += this.actor.data.data.limits[action.limit.attribute].value;
                }
            }
        }

        if (range) {
            if (range.rc) {
                range.rc.mod = {};
                equippedMods.forEach((mod) => {
                    if (mod.data.data.rc) range.rc.mod[mod.name] = mod.data.data.rc;
                    // handle overrides from ammo
                });
                if (range.rc) range.rc.value = range.rc.base + Helpers.totalMods(range.rc.mod);
            }
        }

        if (item.data.condition_monitor) {
            item.data.condition_monitor.max = 8 + Math.ceil(item.data.technology.rating / 2);
        }

        this.labels = labels;
        item['properties'] = this.getChatData().properties;
    }

    async roll(event) {
        if (Helpers.hasModifiers(event)) {
            return this.rollTest(event);
        }
        // we won't work if we don't have an actor
        if (!this.actor) return;
        const { token } = this.actor;
        const templateData = {
            actor: this.actor,
            tokenId: token ? `${token.scene._id}.${token.id}` : null,
            item: this.data,
            type: this.data.type,
            data: this.getChatData(),
            hasRoll: this.hasRoll,
            hasOpposedRoll: this.hasOpposedRoll,
            labels: this.labels,
        };

        const templateType = 'item';
        const template = `systems/shadowrun5e/templates/rolls/${templateType}-card.html`;
        const html = await renderTemplate(template, templateData);

        const chatData = {
            user: game.user._id,
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            content: html,
            speaker: {
                actor: this.actor._id,
                token: this.actor.token,
                alias: this.actor.name,
            },
        };

        const rollMode = game.settings.get('core', 'rollMode');
        if (['gmroll', 'blindroll'].includes(rollMode))
            chatData['whisper'] = ChatMessage.getWhisperIDs('GM');
        if (rollMode === 'blindroll') chatData['blind'] = true;

        return ChatMessage.create(chatData, { displaySheet: false });
    }

    getChatData(htmlOptions?) {
        const data = duplicate(this.data.data);
        const { labels } = this;
        if (!data.description) data.description = {};

        data.description.value = TextEditor.enrichHTML(data.description.value, htmlOptions);

        const props = [];
        this[`_${this.data.type}ChatData`](data, labels, props);

        data.properties = props.filter((p) => !!p);

        return data;
    }

    _ammoChatData(data, labels, props) {}

    _modificationChatData(data, labels, props) {}

    _actionChatData(data, labels, props) {
        if (data.action) {
            if (data.action.limit.value) props.push(`Limit ${data.action.limit.value}`);
            if (data.action.type) props.push(`${Helpers.label(data.action.type)} Action`);
            if (data.action.skill) {
                labels.roll = `${Helpers.label(data.action.skill)}+${Helpers.label(
                    data.action.attribute
                )}`;
            } else if (data.action.attribute2) {
                labels.roll = `${Helpers.label(data.action.attribute)}+${Helpers.label(
                    data.action.attribute2
                )}`;
            }
            if (data.action.damage.type.value) {
                const { damage } = data.action;
                if (damage.value)
                    props.push(
                        `DV ${damage.value}${
                            damage.type.value ? damage.type.value.toUpperCase().charAt(0) : ''
                        }`
                    );
                if (damage.ap && damage.ap.value) props.push(`AP ${damage.ap.value}`);
                if (damage.element.value) props.push(Helpers.label(damage.element.value));
            }
            if (data.action.opposed.type) {
                const { opposed } = data.action;
                if (opposed.type !== 'custom')
                    labels.opposedRoll = `vs. ${Helpers.label(opposed.type)}`;
                else if (opposed.skill)
                    labels.opposedRoll = `vs. ${Helpers.label(opposed.skill)}+${Helpers.label(
                        opposed.attribute
                    )}`;
                else if (opposed.attribute2)
                    labels.opposedRoll = `vs. ${Helpers.label(opposed.attribute)}+${Helpers.label(
                        opposed.attribute2
                    )}`;
                else if (opposed.attribute)
                    labels.opposedRoll = `vs. ${Helpers.label(opposed.attribute)}`;
                if (opposed.description) props.push(`Opposed Desc: ${opposed.desc}`);
            }
        }
    }

    _sinChatData(data, labels, props) {
        props.push(`Rating ${data.technology.rating}`);
        data.licenses.forEach((license) => {
            props.push(`${license.name} R${license.rtg}`);
        });
    }

    _contactChatData(data, labels, props) {
        props.push(data.type);
        props.push(`Connection ${data.connection}`);
        props.push(`Loyalty ${data.loyalty}`);
    }

    _lifestyleChatData(data, labels, props) {
        props.push(Helpers.label(data.type));
        if (data.cost) props.push(`¥${data.cost}`);
        if (data.comforts) props.push(`Comforts ${data.comforts}`);
        if (data.security) props.push(`Security ${data.security}`);
        if (data.neighborhood) props.push(`Neighborhood ${data.neighborhood}`);
        if (data.guests) props.push(`Guests ${data.guests}`);
    }

    _adept_powerChatData(data, labels, props) {
        this._actionChatData(data, labels, props);
        props.push(`PP ${data.pp}`);
        props.push(Helpers.label(data.type));
        if (data.type === 'active') {
            props.push(`${Helpers.label(data.action.type)} Action`);
        }
    }

    _armorChatData(data, labels, props) {
        if (data.armor) {
            if (data.armor.value)
                props.push(`Armor ${data.armor.mod ? '+' : ''}${data.armor.value}`);
            if (data.armor.acid) props.push(`Acid ${data.armor.acid}`);
            if (data.armor.cold) props.push(`Cold ${data.armor.cold}`);
            if (data.armor.fire) props.push(`Fire ${data.armor.fire}`);
            if (data.armor.electricity) props.push(`Electricity ${data.armor.electricity}`);
            if (data.armor.radiation) props.push(`Radiation ${data.armor.radiation}`);
        }
    }

    _complex_formChatData(data, labels, props) {
        this._actionChatData(data, labels, props);
        props.push(Helpers.label(data.target), Helpers.label(data.duration));
        const { fade } = data;
        if (fade > 0) props.push(`Fade L+${fade}`);
        else if (fade < 0) props.push(`Fade L${fade}`);
        else props.push('Fade L');
    }

    _cyberwareChatData(data, labels, props) {
        this._actionChatData(data, labels, props);
        this._armorChatData(data, labels, props);
        if (data.essence) props.push(`Ess ${data.essence}`);
    }

    _deviceChatData(data: DeviceData, labels, props) {
        if (data.technology && data.technology.rating)
            props.push(`Rating ${data.technology.rating}`);
        if (data.category === 'cyberdeck') {
            for (const attN of Object.values(data.atts)) {
                props.push(`${Helpers.label(attN.att)} ${attN.value}`);
            }
        }
    }

    _equipmentChatData(data, labels, props) {
        if (data.technology && data.technology.rating)
            props.push(`Rating ${data.technology.rating}`);
    }

    _qualityChatData(data, labels, props) {
        this._actionChatData(data, labels, props);
        props.push(Helpers.label(data.type));
    }

    _spellChatData(data, labels, props) {
        this._actionChatData(data, labels, props);
        props.push(
            Helpers.label(data.range),
            Helpers.label(data.duration),
            Helpers.label(data.type),
            Helpers.label(data.category)
        );
        const { drain } = data;
        if (drain > 0) props.push(`Drain F+${drain}`);
        else if (drain < 0) props.push(`Drain F${drain}`);
        else props.push('Drain F');

        if (data.category === 'combat') {
            props.push(Helpers.label(data.combat.type));
        } else if (data.category === 'health') {
        } else if (data.category === 'illusion') {
            props.push(data.illusion.type);
            props.push(data.illusion.sense);
        } else if (data.category === 'manipulation') {
            if (data.manipulation.damaging) props.push('Damaging');
            if (data.manipulation.mental) props.push('Mental');
            if (data.manipulation.environmental) props.push('Environmental');
            if (data.manipulation.physical) props.push('Physical');
        } else if (data.category === 'detection') {
            props.push(data.illusion.passive ? 'Passive' : 'Active');
            props.push(data.illusion.type);
            if (data.illusion.extended) props.push('Extended');
        }
        labels.roll = 'Cast';
    }

    _weaponChatData(data, labels, props) {
        this._actionChatData(data, labels, props);

        const equippedAmmo = this.getEquippedAmmo();
        if (equippedAmmo && data.ammo && data.ammo.current?.max) {
            if (equippedAmmo) {
                const { current, spare_clips } = data.ammo;
                if (equippedAmmo.name)
                    props.push(`${equippedAmmo.name} (${current.value}/${current.max})`);
                if (equippedAmmo.data.data.blast.radius)
                    props.push(
                        `${game.i18n.localize('SR5.BlastRadius')} ${
                            equippedAmmo.data.data.blast.radius
                        }m`
                    );
                if (equippedAmmo.data.data.blast.dropoff)
                    props.push(
                        `${game.i18n.localize('SR5.DropOff')} ${
                            equippedAmmo.data.data.blast.dropoff
                        }/m`
                    );
                if (spare_clips && spare_clips.max)
                    props.push(
                        `${game.i18n.localize('SR5.SpareClips')} (${spare_clips.value}/${
                            spare_clips.max
                        })`
                    );
            }
        }

        if (data.technology?.conceal?.value) {
            props.push(`${game.i18n.localize('SR5.Conceal')} ${data.technology.conceal.value}`);
        }

        if (data.category === 'range') {
            if (data.range.rc) props.push(`RC ${data.range.rc.value}`);
            if (data.range.modes)
                props.push(
                    Array.from(Object.entries(data.range.modes))
                        .filter(([key, val]) => val && !key.includes('-'))
                        .map(([key]) => Helpers.label(key))
                        .join('/')
                );
            if (data.range.ranges)
                props.push(Array.from(Object.values(data.range.ranges)).join('/'));
        } else if (data.category === 'melee') {
            if (data.melee.reach)
                props.push(`${game.i18n.localize('SR5.Reach')} ${data.melee.reach}`);
        } else if (data.category === 'thrown') {
            if (data.thrown.ranges) {
                const mult =
                    data.thrown.ranges.attribute && this.actor
                        ? this.actor.data.data.attributes[data.thrown.ranges.attribute].value
                        : 1;
                const ranges = [
                    data.thrown.ranges.short,
                    data.thrown.ranges.medium,
                    data.thrown.ranges.long,
                    data.thrown.ranges.extreme,
                ];
                props.push(ranges.map((v) => v * mult).join('/'));
            }
            const { blast } = data.thrown;
            if (blast.value)
                props.push(`${game.i18n.localize('SR5.BlastRadius')} ${blast.radius}m`);
            if (blast.dropoff)
                props.push(`${game.i18n.localize('SR5.DropOff')} ${blast.dropoff}/m`);
        }
    }

    getEquippedAmmo() {
        return (this.items || []).filter(
            (item) => item.type === 'ammo' && item.data.data?.technology?.equipped
        )[0];
    }

    getEquippedMods() {
        return (this.items || []).filter(
            (item) =>
                item.type === 'modification' &&
                item.data.data.type === 'weapon' &&
                item.data.data?.technology?.equipped
        );
    }

    async equipWeaponMod(iid) {
        const mod = this.getOwnedItem(iid);
        if (mod) {
            const dupData = duplicate(mod.data);
            dupData.data.technology.equipped = !dupData.data.technology.equipped;
            await this.updateOwnedItem(dupData);
        }
    }

    async useAmmo(fireMode) {
        const dupData = duplicate(this.data);
        const { ammo } = dupData.data;
        if (ammo) {
            ammo.current.value = Math.max(0, ammo.current.value - fireMode);
            return this.update(dupData);
        }
    }

    async reloadAmmo() {
        const data = duplicate(this.data);
        const { ammo } = data.data;
        const diff = ammo.current.max - ammo.current.value;
        ammo.current.value = ammo.current.max;

        if (ammo.spare_clips) {
            ammo.spare_clips.value = Math.max(0, ammo.spare_clips.value - 1);
        }
        await this.update(data);

        const newAmmunition = (this.items || [])
            .filter((i) => i.data.type === 'ammo')
            .reduce((acc: BaseEntityData[], item) => {
                const { technology } = item.data.data;
                if (technology.equipped) {
                    const qty = technology.quantity;
                    technology.quantity = Math.max(0, qty - diff);
                    acc.push(item.data);
                }
                return acc;
            }, []);
        if (newAmmunition.length) await this.updateOwnedItem(newAmmunition);
    }

    async equipAmmo(iid) {
        // only allow ammo that was just clicked to be equipped
        const ammo = this.items
            ?.filter((item) => item.type === 'ammo')
            .map((item) => {
                const i = this.getOwnedItem(item._id);
                if (i) {
                    i.data.data.technology.equipped = iid === item._id;
                    return i.data;
                }
            });
        await this.updateOwnedItem(ammo);
    }

    addNewLicense() {
        const data = duplicate(this.data);
        const { licenses } = data.data;
        if (typeof licenses === 'object') {
            data.data.licenses = Object.values(licenses);
        }
        data.data.licenses.push({
            name: '',
            rtg: '',
            description: '',
        });
        this.update(data);
    }

    removeLicense(index) {
        const data = duplicate(this.data);
        const { licenses } = data.data;
        licenses.splice(index, 1);
        this.update(data);
    }

    rollOpposedTest(target, ev) {
        const itemData = this.data.data;
        const options = {
            event: ev,
            incomingAttack: { fireMode: 0 },
            fireModeDefense: 0,
            cover: false,
            incomingAction: {},
        };

        if (this.getFlag('shadowrun5e', 'attack')) {
            options.incomingAttack = this.getFlag('shadowrun5e', 'attack');
            if (options.incomingAttack.fireMode)
                options.fireModeDefense = Helpers.mapRoundsToDefenseMod(
                    options.incomingAttack.fireMode
                );
            options.cover = true;
        }

        options.incomingAction = this.getFlag('shadowrun5e', 'action');

        const { opposed } = itemData.action;
        if (opposed.type === 'defense') target.rollDefense(options);
        else if (opposed.type === 'soak') target.rollSoak(options);
        else if (opposed.type === 'armor') target.rollSoak(options);
        else {
            if (opposed.skill && opposed.attribute)
                target.rollSkill(opposed.skill, {
                    ...options,
                    attribute: opposed.attribute,
                });
            if (opposed.attribute && opposed.attribute2)
                target.rollTwoAttributes([opposed.attribute, opposed.attribute2], options);
            else if (opposed.attribute) target.rollSingleAttribute(opposed.attribute, options);
        }
    }

    rollTest(ev) {
        const itemData = this.data.data;
        if (!this.actor) return console.error('COULD NOT FIND ACTOR');
        const actorData = this.actor.data.data;

        const skill = actorData.skills.active[itemData.action.skill];
        const attribute = actorData.attributes[itemData.action.attribute];
        const attribute2 = actorData.attributes[itemData.action.attribute2];
        let limit = itemData.action.limit.value;
        // TODO remove these (by making them not used, not just delete)
        const mod = parseInt(itemData.action.mod || 0) + parseInt(itemData.action.alt_mod || 0);

        // only check if attribute2 is set if skill is not set
        const parts = duplicate(itemData.action.dice_pool_mod);
        if (attribute) parts[attribute.label] = attribute.value;
        if (skill) parts[skill.label] = skill.value;
        else if (attribute2) parts[attribute2.label] = attribute2.value;

        // TODO change item to allow selecting specialization type
        if (itemData.action.spec) parts['SR5.Specialization'] = 2;
        if (mod) parts['SR5.ItemMod'] = mod;

        let title = this.data.name;

        if (this.data.type === 'weapon' && itemData.category === 'range') {
            const fireModes = {};
            {
                const { modes } = itemData.range;
                if (modes.single_shot) {
                    fireModes['1'] = 'SS';
                }
                if (modes.semi_auto) {
                    fireModes['1'] = 'SA';
                    fireModes['3'] = 'SB';
                }
                if (modes.burst_fire) {
                    fireModes['3'] = `${modes.semi_auto ? 'SB/' : ''}BF`;
                    fireModes['6'] = 'LB';
                }
                if (modes.full_auto) {
                    fireModes['6'] = `${modes.burst_fire ? 'LB/' : ''}FA(s)`;
                    fireModes['10'] = 'FA(c)';
                    fireModes['20'] = game.i18n.localize('SR5.Suppressing');
                }
            }

            const attack = this.getFlag('shadowrun5e', 'attack') || {
                fireMode: 0,
            };
            const { fireMode } = attack;
            const rc = parseInt(itemData.range.rc.value) + parseInt(actorData.recoil_compensation);
            const dialogData = {
                fireModes,
                fireMode,
                rc,
                ammo: itemData.range.ammo,
            };
            return renderTemplate(
                'systems/shadowrun5e/templates/rolls/range-weapon-roll.html',
                dialogData
            ).then((dlg) => {
                const buttons = {};
                const { ranges } = itemData.range;
                let environmental: boolean | number = true;
                let cancel = true;
                buttons['short'] = {
                    label: `Short (${ranges.short})`,
                    callback: () => (cancel = false),
                };
                buttons['medium'] = {
                    label: `Medium (${ranges.medium})`,
                    callback: () => {
                        environmental = 1;
                        cancel = false;
                    },
                };
                buttons['long'] = {
                    label: `Long (${ranges.long})`,
                    callback: () => {
                        environmental = 3;
                        cancel = false;
                    },
                };
                buttons['extreme'] = {
                    label: `Extreme (${ranges.extreme})`,
                    callback: () => {
                        environmental = 6;
                        cancel = false;
                    },
                };
                new Dialog({
                    title,
                    content: dlg,
                    buttons,
                    close: (html) => {
                        if (cancel) return;

                        const fireMode = Helpers.parseInputToNumber(
                            $(html).find('[name="fireMode"]').val()
                        );
                        if (fireMode) {
                            title += ` - Defender (${Helpers.mapRoundsToDefenseDesc(fireMode)})`;
                        }
                        // suppressing fire doesn't cause recoil
                        if (fireMode > rc && fireMode !== 20) {
                            parts['SR5.Recoil'] = rc - fireMode;
                        }
                        DiceSR.rollTest({
                            event: ev,
                            parts,
                            actor: this.actor || undefined,
                            limit,
                            title,
                            dialogOptions: {
                                environmental,
                            },
                        }).then((roll: Roll | undefined) => {
                            if (roll) {
                                this.useAmmo(fireMode).then(() => {
                                    this.setFlag('shadowrun5e', 'attack', {
                                        hits: roll.total,
                                        fireMode,
                                        damageType: this.data.data.action.damage.type.value,
                                        element: this.data.data.action.damage.element.value,
                                        damage: this.data.data.action.damage.value,
                                        ap: this.data.data.action.damage.ap.value,
                                    });
                                });
                            }
                        });
                    },
                }).render(true);
            });
        }
        if (this.data.type === 'spell') {
            const dialogData = {
                drain: itemData.drain >= 0 ? `+${itemData.drain}` : itemData.drain,
                force: 2 - itemData.drain,
            };
            let reckless = false;
            let cancel = true;
            renderTemplate('systems/shadowrun5e/templates/rolls/roll-spell.html', dialogData).then(
                (dlg) => {
                    new Dialog({
                        title: `${Helpers.label(this.data.name)} Force`,
                        content: dlg,
                        buttons: {
                            roll: {
                                label: 'Normal',
                                callback: () => (cancel = false),
                            },
                            spec: {
                                label: 'Reckless',
                                callback: () => {
                                    reckless = true;
                                    cancel = false;
                                },
                            },
                        },
                        close: (html) => {
                            if (cancel) return;
                            const force = Helpers.parseInputToNumber(
                                $(html).find('[name=force]').val()
                            );
                            limit = force;
                            DiceSR.rollTest({
                                event: ev,
                                dialogOptions: {
                                    environmental: true,
                                },
                                parts,
                                actor: this.actor || undefined,
                                limit,
                                title,
                            }).then(async (roll: Roll | undefined) => {
                                if (this.data.data.category === 'combat' && roll) {
                                    const damage = force;
                                    const ap = -force;
                                    this.setFlag('shadowrun5e', 'attack', {
                                        hits: roll.total,
                                        damageType: this.data.data.action.damage.type,
                                        element: this.data.data.action.damage.element,
                                        damage,
                                        ap,
                                    });
                                }
                                const drain = Math.max(
                                    itemData.drain + force + (reckless ? 3 : 0),
                                    2
                                );
                                this.actor?.rollDrain({ event: ev }, drain);
                            });
                        },
                    }).render(true);
                }
            );
        } else if (this.data.type === 'complex_form') {
            const dialogData = {
                fade: itemData.fade >= 0 ? `+${itemData.fade}` : itemData.fade,
                level: 2 - itemData.fade,
            };
            let cancel = true;
            renderTemplate(
                'systems/shadowrun5e/templates/rolls/roll-complex-form.html',
                dialogData
            ).then((dlg) => {
                new Dialog({
                    title: `${Helpers.label(this.data.name)} Level`,
                    content: dlg,
                    buttons: {
                        roll: {
                            label: 'Continue',
                            icon: '<i class="fas fa-dice-six"></i>',
                            callback: () => (cancel = false),
                        },
                    },
                    close: (html) => {
                        if (cancel) return;
                        const level = Helpers.parseInputToNumber(
                            $(html).find('[name=level]').val()
                        );
                        limit = level;
                        DiceSR.rollTest({
                            event: ev,
                            dialogOptions: {
                                environmental: false,
                            },
                            parts,
                            actor: this.actor,
                            limit,
                            title,
                        }).then(() => {
                            const fade = Math.max(itemData.fade + level, 2);
                            this.actor.rollFade({ event: ev }, fade);
                        });
                    },
                }).render(true);
            });
        } else {
            return DiceSR.rollTest({
                event: ev,
                parts,
                dialogOptions: {
                    environmental: true,
                },
                actor: this.actor,
                limit,
                title,
            }).then((roll: Roll | undefined) => {
                if (roll) {
                    this.useAmmo(1).then(() => {
                        this.setFlag('shadowrun5e', 'action', {
                            hits: roll.total,
                        });
                    });
                }
            });
        }
    }

    static chatListeners(html) {
        html.on('click', '.card-buttons button', (ev) => {
            ev.preventDefault();
            const button = $(ev.currentTarget);
            const messageId = button.parents('.message').data('messageId');
            const senderId = game.messages.get(messageId).user._id;
            const card = button.parents('.chat-card');
            const action = button.data('action');

            const opposedRoll = action === 'opposed-roll';
            if (!opposedRoll && !game.user.isGM && game.user._id !== senderId) return;

            let actor;
            const tokenKey = card.data('tokenId');
            if (tokenKey) {
                const [sceneId, tokenId] = tokenKey.split('.');
                let token;
                if (sceneId === canvas.scene._id) token = canvas.tokens.get(tokenId);
                else {
                    const scene: Scene = game.scenes.get(sceneId);
                    if (!scene) return;
                    // @ts-ignore
                    const tokenData = scene.data.tokens.find((t) => t.id === Number(tokenId));
                    if (tokenData) token = new Token(tokenData);
                }
                if (!token) return;
                actor = Actor.fromToken(token);
            } else actor = game.actors.get(card.data('actorId'));

            if (!actor) return;
            const itemId = card.data('itemId');
            const item = actor.getOwnedItem(itemId);

            if (action === 'roll') item.rollTest(ev);
            if (opposedRoll) {
                const targets = this._getChatCardTargets();
                for (const t of targets) {
                    item.rollOpposedTest(t, ev);
                }
            }
        });
        html.on('click', '.card-header', (ev) => {
            ev.preventDefault();
            $(ev.currentTarget).siblings('.card-content').toggle();
        });
        $(html).find('.card-content').hide();
    }

    static _getChatCardTargets() {
        const { character } = game.user;
        const { controlled } = canvas.tokens;
        const targets = controlled.reduce((arr, t) => (t.actor ? arr.concat([t.actor]) : arr), []);
        if (character && controlled.length === 0) targets.push(character);
        if (!targets.length)
            throw new Error(`You must designate a specific Token as the roll target`);
        return targets;
    }

    /**
     * Create an item in this item
     * @param itemData
     * @param options
     */
    async createOwnedItem(itemData, options = {}) {
        if (!Array.isArray(itemData)) itemData = [itemData];
        // weapons accept items
        if (this.type === 'weapon') {
            const currentItems = duplicate(this.getFlag('shadowrun5e', 'embeddedItems') || []);

            itemData.forEach((item) => {
                item._id = randomID(16);
                if (item.type === 'ammo' || item.type === 'modification') {
                    currentItems.push(item);
                }
            });

            await this.setFlag('shadowrun5e', 'embeddedItems', currentItems);
        }
        await this.prepareEmbeddedEntities();
        await this.prepareData();
        await this.render(false);
        return true;
    }

    /**
     * Prepare embeddedItems
     */
    prepareEmbeddedEntities() {
        super.prepareEmbeddedEntities();
        const items = this.getFlag('shadowrun5e', 'embeddedItems');
        if (items) {
            const existing = (this.items || []).reduce((object, i) => {
                object[i.id] = i;
                return object;
            }, {});
            this.items = items.map((i) => {
                if (i._id in existing) {
                    const a = existing[i._id];
                    a.data = i;
                    a.prepareData();
                    return a;
                } else {
                    // dirty things done here
                    // @ts-ignore
                    return Item.createOwned(i, this);
                }
            });
        }
    }

    getOwnedItem(itemId) {
        const items = this.items;
        if (!items) return;
        return items.find((i) => i._id === itemId);
    }

    async updateOwnedItem(changes) {
        const items = duplicate(this.getFlag('shadowrun5e', 'embeddedItems'));
        if (!items) return;
        changes = Array.isArray(changes) ? changes : [changes];
        if (!changes || changes.length === 0) return;
        changes.forEach((itemChanges) => {
            const index = items.findIndex((i) => i._id === itemChanges._id);
            if (index === -1) return;
            const item = items[index];
            if (item) {
                itemChanges = expandObject(itemChanges);
                mergeObject(item, itemChanges);
                items[index] = item;
                // this.items[index].data = items[index];
            }
        });

        await this.setFlag('shadowrun5e', 'embeddedItems', items);
        await this.prepareEmbeddedEntities();
        await this.prepareData();
        await this.render(false);
        return true;
    }

    async updateEmbeddedEntity(
        embeddedName: string,
        updateData: object | object[],
        options?: object
    ) {
        this.updateOwnedItem(updateData);
        return this;
    }

    /**
     * Remove an owned item
     * @param deleted
     * @returns {Promise<boolean>}
     */
    async deleteOwnedItem(deleted) {
        const items = duplicate(this.getFlag('shadowrun5e', 'embeddedItems'));
        if (!items) return;

        const idx = items.findIndex((i) => i._id === deleted || Number(i._id) === deleted);
        if (idx === -1) throw new Error(`Shadowrun5e | Couldn't find owned item ${deleted}`);
        items.splice(idx, 1);
        await this.setFlag('shadowrun5e', 'embeddedItems', items);
        await this.prepareEmbeddedEntities();
        await this.prepareData();
        await this.render(false);
        return true;
    }
}
