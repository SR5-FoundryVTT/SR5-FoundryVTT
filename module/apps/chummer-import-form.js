export class ChummerImportForm extends FormApplication {
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = 'chummer-import';
    options.classes = ['shadowrun5e'];
    options.title = 'Chummer/Hero Lab Import';
    options.template = 'systems/shadowrun5e/templates/apps/import.html';
    options.width = 600;
    options.height = "auto";
    return options;
  }

  getData() {
    return {

    };
  }

  activateListeners(html) {
    html.find('.submit-chummer-import').click(async event => {
      event.preventDefault();
      let chummerfile = JSON.parse($('.chummer-text').val());
      console.log(chummerfile);

      const parseAtt = (att) => {
        if (att.toLowerCase() === "bod") {
          return 'body';
        } else if (att.toLowerCase() === "agi") {
          return 'agility';
        } else if (att.toLowerCase() === "rea") {
          return 'reaction';
        } else if (att.toLowerCase() === "str") {
          return 'strength';
        } else if (att.toLowerCase() === "cha") {
          return 'charisma';
        } else if (att.toLowerCase() === "int") {
          return 'intuition';
        } else if (att.toLowerCase() === "log") {
          return 'logic';
        } else if (att.toLowerCase() === "wil") {
          return 'willpower';
        } else if (att.toLowerCase() === "edg") {
          return 'edge';
        } else if (att.toLowerCase() === "mag") {
          return 'magic';
        } else if (att.toLowerCase() === "res") {
          return 'resonance';
        }
      }

      const parseDamage = (val) => {
        const damage = {
          damage: 0,
          type: 'physical',
          radius: 0,
          dropoff: 0
        };
        let split = val.split(',');
        if (split.length > 0) {
          let l = split[0].match(/(\d+)(\w+)/);
          console.log(l);
          if (l && l[0]) damage.damage = parseInt(l[0]);
          if (l && l[1]) damage.type = l[1].toLowerCase().includes('p') ? 'physical' : 'stun';
        }
        for (let i = 1; i < split.length; i++) {
          let l = split[i].match(/(-?\d+)(.*)/);
          if (l && l[2]) {
            if (l[2].toLowerCase().includes('/m')) damage.dropoff = parseInt(l[1]);
            else damage.radius = parseInt(l[1]);
          }
        }
        console.log(damage);
        return damage;
      };

      const getValues = (val) => {
		let l = val.match(/([0-9]+)(?:([0-9]+))*/g);
        return l || ['0'];
      }

	  const getValInParen = (value) => {
		// regex to capture value inside () or single number
		let l = value.match(/([0-9]+)(?:([0-9]+))*/g);
		if (l != null) {
		  return (l.length > 1 ? l[1] : l[0])
		} else {
		  return value;
		}
	  };
	  const getArray = (value) => {
        return Array.isArray(value) ? value : [value];
      }
      const updateData = duplicate(this.object.data);
      const update = updateData.data;
      const items = [];
      let error = "";
      // character info stuff, also techno/magic and essence
      if (chummerfile.characters
          && chummerfile.characters.character) {
        let c = chummerfile.characters.character;
        try {
          if (c.playername != null) {
            update.player_name = c.playername;
          }
          if (c.alias != null) {
            update.name = c.alias;
            updateData.name = c.alias;
          }
          if (c.metatype != null) {
            update.metatype = c.metatype;
          }
          if (c.sex != null) {
            update.sex = c.sex;
          }
          if (c.age != null) {
            update.age = c.age;
          }
          if (c.height != null) {
            update.height = c.height;
          }
          if (c.weight != null) {
            update.weight = c.weight;
          }
          if (c.calculatedstreetcred != null) {
            update.street_cred = c.calculatedstreetcred;
          }
          if (c.calculatednotoriety != null) {
            update.notoriety = c.calculatednotoriety;
          }
          if (c.calculatedpublicawareness != null) {
            update.public_awareness = c.calculatedpublicawareness;
          }
          if (c.karma != null) {
            update.karma.value = c.karma;
          }
          if (c.totalkarma != null) {
            update.karma.max = c.totalkarma;
          }
          if (c.technomancer != null && c.technomancer.toLowerCase() === "true") {
            update.special = "resonance";
          }
          if ((c.magician && c.magician.toLowerCase() === "true")
            || (c.adept && c.adept.toLowerCase() === 'true')) {
            update.special = "magic";
            let attr = [];
            if (c.tradition && c.tradition.drainattribute
                      && c.tradition.drainattribute.attr) {
              attr = c.tradition.drainattribute.attr;
            } else if (c.tradition && c.tradition.drainattributes) {
              attr = c.tradition.drainattributes.split('+').map(item => item.trim());
            }
            attr.forEach(att => {
              att = parseAtt(att);
              if (att !== 'willpower') update.magic.attribute = att;
            });
          }
          if (c.totaless != null) {
            update.attributes.essence.value = c.totaless;
          }
          if (c.nuyen != null) {
            update.nuyen = c.nuyen;
          }
        } catch (e) {
            error += "Error with character info: " + e + ". ";
        }
        // update attributes
        let atts = chummerfile.characters.character.attributes[1].attribute;
        atts.forEach(att => {
          try {
            const newAtt = parseAtt(att.name);
            if (newAtt) update.attributes[newAtt].base = parseInt(att.total);

          } catch (e) {
              error += "Error with attributes: " + e + ". ";
          }
        });
        // initiative stuff
        try {
          if (c.initbonus != null) {
            // not sure if this one is correct
            update.mods.initiative = c.initbonus;
          }
          if (c.initdice != null) {
            update.mods.initiative_dice = c.initdice - 1;
          }
        } catch (e) {
            error += "Error with initiative: " + e + ". ";
        }
        // skills... ugh
        let skills = c.skills.skill;
        for (let i = 0; i < skills.length; i++) {
          try {
            let s = skills[i];
            if (s.rating > 0 && s.islanguage) {
              let group = "active";
              let skill = null;
              if (s.islanguage && s.islanguage.toLowerCase() === "true") {
                skill = {};
                update.skills.language.value.push(skill);
                group = "language";
              } else if (s.knowledge && s.knowledge.toLowerCase() === "true") {
                skill = {};
                if (s.attribute.toLowerCase() === "int") {
                  update.skills.knowledge.street.value.push(skill);
                }
                if (s.attribute.toLowerCase() === "log") {
                  update.skills.knowledge.professional.value.push(skill);
                }
                group = "knowledge";
              } else {
                let name = s.name.toLowerCase().trim().replace(/\s/g, '_');
                if (name.includes('exotic') && name.includes('_weapon')) name = name.replace('_weapon', '');
                skill = update.skills.active[name];
              }
              if (!skill) console.error("Couldn't parse skill " + s.name);
              if (skill) {
                if (group !== 'active') skill.name = s.name;
                skill.base = parseInt(s.rating);
                if (s.skillspecializations) {
                  let spec = getArray(s.skillspecializations.skillspecialization.name);
                  skill.specs = spec.join('/');
                }
              }
            }
          } catch (e) {
            console.error(e);
          }
        }
        // qualities
        if (c.qualities && c.qualities.quality) {
            let qualities = getArray(c.qualities.quality);
            qualities.forEach(q => {
              try {
                const data = {};
                data.type = q.qualitytype.toLowerCase();
                if (q.description) data.description = {
                  value: TextEditor.enrichHTML(q.description)
                };

                const itemData = { name: q.name, type: 'quality', data: data };
                items.push(itemData);
              } catch (e) {
                console.error(e);
              }
            });
        }
        // weapons
        if (c.weapons != null && c.weapons.weapon != null) {
          let weapons = getArray(c.weapons.weapon);
          weapons.forEach(w => {
            try {
              const data = {};
              const action = {};
              const damage = {};
              action.damage = damage;
              data.action = action;

              if (w.description) {
                data.description = {
                  value: TextEditor.enrichHTML(w.description)
                };
              }

              damage.ap = {
                base: parseInt(getValues(w.ap)[0])
              };
              action.type = 'varies';
              action.skill = w.skill.toLowerCase().replace(/\s/g, "_");
              if (action.skill.includes('exotic')) action.skill = action.skill.replace('_weapon', '');
              action.attribute = 'agility';
              action.limit = {
                base: parseInt(getValues(w.accuracy)[0])
              };
              action.opposed = {
                type: 'defense'
              };

              if (w.type.toLowerCase() === "melee") {
                action.type = 'complex';
                data.category = 'melee';
                const melee = {};
                data.melee = melee;
                melee.reach = parseInt(w.reach);
              } else if (w.type.toLowerCase() === "ranged") {
                data.category = 'range';
                if (w.skill.toLowerCase().includes('throw')) data.category = 'thrown'; // TODO clean this up
                const range = {};
                data.range = range;
                range.rc = {
                  base: parseInt(getValues(w.rc)[0])
                };
                if (w.mode) { // HeroLab export doesn't have mode
                  let lower = w.mode.toLowerCase();
                  range.modes = {
                    single_shot: lower.includes('ss'),
                    semi_auto: lower.includes('sa'),
                    burst_fire: lower.includes('bf'),
                    full_auto: lower.includes('fa')
                  }
                }
                if (w.clips != null && w.clips.clip != null) { // HeroLab export doesn't have clips
                  let clips = Array.isArray(w.clips.clip) ? w.clips.clip : [ w.clips.clip ];
                  clips.forEach(clip => {
                    console.log(clip);
                  });
                }
                if (w.ranges
                  && w.ranges.short
                  && w.ranges.medium
                  && w.ranges.long
                  && w.ranges.extreme) {
                  console.log(w.ranges);
                  range.ranges = {
                    short: parseInt(w.ranges.short.split('-')[1]),
                    medium: parseInt(w.ranges.medium.split("-")[1]),
                    long: parseInt(w.ranges.long.split("-")[1]),
                    extreme: parseInt(w.ranges.extreme.split("-")[1])
                  };
                }
                if (w.accessories && w.accessories.accessory) {
                  range.mods = [];
                  let accessories = getArray(w.accessories.accessory);
                  accessories.forEach(a => {
                    if (a) {
                      range.mods.push({
                        name: a.name
                      });
                    }
                  });
                }
              } else if (w.type.toLowerCase() === 'thrown') {
                data.category = 'thrown';
              }
              {
                let d = parseDamage(w.damage_english);
                damage.base = d.damage;
                damage.type = d.type;
                if (d.dropoff || d.radius) {
                  const thrown = {};
                  data.thrown = thrown;
                  thrown.blast = {
                    radius: d.radius,
                    dropoff: d.dropoff
                  };
                }
              }

              const itemData = { name: w.name, type: 'weapon', data: data };
              items.push(itemData);
            } catch (e) {
                console.error(e);
            }
          });
        }
        // armors
        if (c.armors && c.armors.armor) {
          let armors = getArray(c.armors.armor);
          armors.forEach(a => {
            try {
              const data = {};
              const armor = {};
              data.armor = armor;

              let desc = "";
              armor.mod = a.armor.includes("+");
              armor.value = parseInt(a.armor.replace("+", ""));
              if (a.description) desc = a.description;

              console.log(a);
              if (a.armormods && a.armormods.armormod) {
                armor.fire = 0;
                armor.electricity = 0;
                armor.cold = 0;
                armor.acid = 0;
                armor.radiation = 0;

                let modDesc = [];
                let mods = getArray(a.armormods.armormod);
                mods.forEach(mod => {
                  if (mod.name.toLowerCase().includes("fire resistance")) {
                    armor.fire += parseInt(mod.rating);
                  } else if (mod.name.toLowerCase().includes("nonconductivity")) {
                    armor.electricity += parseInt(mod.rating);
                  } else if (mod.name.toLowerCase().includes("insulation")) {
                    armor.cold += parseInt(mod.rating);
                  } else if (mod.name.toLowerCase().includes("radiation shielding")) {
                    armor.radiation += parseInt(mod.rating);
                  }
                  if (mod.rating != "") {
                    modDesc.push(mod.name + " R" + mod.rating);
                  } else {
                    modDesc.push(mod.name);
                  }
                });
                if (modDesc.length > 0) {
                  // add desc to beginning
                  desc = modDesc.join(",") + "\n\n" + desc;
                }
              }
              if (a.equipped.toLowerCase() === "true") {
                data.technology = {
                  equipped: true
                };
              }
              data.description = {
                value: TextEditor.enrichHTML(desc)
              };

              const itemData = { name: a.name, type: 'armor', data: data };
              items.push(itemData);
            } catch (e) {
              console.error(e);
            }
          });
        }
        // cyberware
		if (c.cyberwares && c.cyberwares.cyberware) {
		  let cyberwares = getArray(c.cyberwares.cyberware);
          cyberwares.forEach(cy => {
            try {
              const data = {};
              data.description = {
                rating: cy.rating,
                value: cy.description
              };
              data.technology = {
                equipped: true
              };
              data.essence = cy.ess;
              data.grade = cy.grade;
              const itemData = { name: cy.name, type: 'cyberware', data: data };
              items.push(itemData);
            } catch (e) {
              console.error(e);
            }
		  });
		}
        // powers
        if (c.powers && c.powers.power) {
          let powers = getArray(c.powers.power);
          powers.forEach(p => {
            const data = {};
            if (p.description) data.description = {
              value: TextEditor.enrichHTML(p.description)
            }
            data.level = parseInt(p.rating);
            p.pp = parseInt(p.totalpoints);

            const itemData = { name: p.name, type: 'adept_power', data: data };
            items.push(itemData);
          });
        }
        // gear
        if (c.gears && c.gears.gear) {
          let gears = getArray(c.gears.gear);
          let licenses = [];
          gears.forEach(g => {
            try {
              const data = {};
              let name = g.name;
              if (g.extra) name += ` (${g.extra})`;
              data.technology = {
                rating: g.rating,
                quantity: g.qty
              };
              data.description = {
                value: g.description
              };
              const itemData = { name: name, type: 'equipment', data: data };
              items.push(itemData);
            } catch (e) {
              console.error(e);
            }
          });
        }
        // spells
        if (c.spells && c.spells.spell) {
          let spells = getArray(c.spells.spell);
          spells.forEach(s => {
            try {
              if (s.alchemy.toLowerCase() !== "true") {
                const action = {};
                const data = {};
                data.action = action;
                data.category = s.category.toLowerCase().replace(/\s/g, '_');
                data.name = s.name;
                data.type = s.type === 'M' ? 'mana' : 'physical';
                data.range = s.range === 'T' ? 'touch' : s.range.toLowerCase().replace(/\s/g, '_').replace('(','').replace(')','');
                data.drain = parseInt(s.dv.replace("F", ""));
                let description = "";
                if (s.descriptors) description = s.descriptors;
                if (s.description) description += '\n' + s.description;
                data.description = {};
                data.description.value = TextEditor.enrichHTML(description);

                if (s.duration.toLowerCase() === "s") data.duration = "sustained";
                else if (s.duration.toLowerCase() === "i") data.duration = "instant";
                else if (s.duration.toLowerCase() === "p") data.duration = "permanent";

                action.type = 'varies';
                action.skill = 'spellcasting';
                action.attribute = 'magic';

                if (s.descriptors) {
                  let desc = s.descriptors.toLowerCase();
                  if (s.category.toLowerCase() === "combat") {
                    data.combat = {};
                    if (desc.includes('direct')) {
                      data.combat.type = 'direct';
                      if (data.type === 'mana') {
                        action.opposed = {
                          type: 'custom',
                          attribute: 'willpower'
                        };
                      } else if (data.type === 'physical') {
                        action.opposed = {
                          type: 'custom',
                          attribute: 'body'
                        };
                      }
                    } else {
                      data.combat.type = 'indirect';
                      action.opposed = {
                        type: 'defense'
                      };
                    }
                  }
                  if (s.category.toLowerCase() === 'detection') {
                    data.detection = {};
                    let split = desc.split(',');
                    split.forEach(token => {
                      token = token || '';
                      token = token.replace(' detection spell', '');
                      if (!token) return;
                      if (token.includes('area')) return;

                      if (token.includes('passive')) data.detection.passive = true;
                      else if (token.includes('active')) data.detection.passive = false;
                      else if (token) data.detection.type = token.toLowerCase();
                    });
                    if (!data.detection.passive) {
                      action.opposed = {
                        type: 'custom',
                        attribute: 'willpower',
                        attribute2: 'logic'
                      }
                    }
                  }
                  if (s.category.toLowerCase() === 'illusion') {
                    data.illusion = {};
                    let split = desc.split(',');
                    split.forEach(token => {
                      token = token || '';
                      token = token.replace(' illusion spell', '');
                      if (!token) return;
                      if (token.includes('area')) return;

                      if (token.includes('sense')) data.illusion.sense = token.toLowerCase();
                      else if (token) data.illusion.type = token.toLowerCase();
                    });
                    
                    if (data.type === 'mana') {
                      action.opposed = {
                        type: 'custom',
                        attribute: 'willpower',
                        attribute2: 'logic'
                      };
                    } else {
                      action.opposed = {
                        type: 'custom',
                        attribute: 'intuition',
                        attribute2: 'logic'
                      }
                    }
                  }
                  if (s.category.toLowerCase() === "manipulation") {
                    data.manipulation = {};
                    if (desc.includes('environmental')) data.manipulation.environmental = true;
                    if (desc.includes('physical')) data.manipulation.physical = true;
                    if (desc.includes('mental')) data.manipulation.mental = true;
                    // TODO figure out how to parse damaging

                    if (data.manipulation.mental) {
                      action.opposed = {
                        type: 'custom',
                        attribute: 'willpower',
                        attribute2: 'logic'
                      };
                    }
                    if (data.manipulation.physical) {
                      action.opposed = {
                        type: 'custom',
                        attribute: 'body',
                        attribute2: 'strength'
                      };
                    }
                  }
                }
                const itemData = { name: s.name, type: 'spell', data: data };
                items.push(itemData);
              }
            } catch (e) {
              console.error(e);
            }
          });
        }
      };

      console.log(update);
      await this.object.update(updateData);
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        await this.object.createOwnedItem(item);
      }
    });
  }
};
