import { parseDescription, getArray, createItemData, formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions.js"
import { DataDefaults } from "../../../data/DataDefaults";
import * as IconAssign from '../../../apps/iconAssigner/iconAssign';

export class SpellParser {
    async parseSpells(chummerChar, assignIcons) {
        const spells = getArray(chummerChar.spells.spell);
        const parsedSpells = [];
        const iconList = await IconAssign.getIconFiles();

        spells.forEach(async (chummerSpell) => {
            try {
                if (chummerSpell.alchemy.toLowerCase() !== 'true') {
                    const itemData = this.parseSpell(chummerSpell);

                    // Assign the icon if enabled
                    if (assignIcons) {itemData.img = await IconAssign.iconAssign(itemData.system.importFlags, itemData.system, iconList)};

                    parsedSpells.push(itemData);
                }
            } catch (e) {
                console.error(e);
            }
        });

        return parsedSpells;
    }

    parseSpell(chummerSpell) {
        const parserType = 'spell';
        const system = {};

        this.prepareSystem(system, chummerSpell)

        let description = '';
        if (chummerSpell.descriptors) description = chummerSpell.descriptors;
        if (chummerSpell.description) description += `\n${chummerSpell.description}`;
        system.description.value = TextEditor.enrichHTML(description);

        this.parseDuration(chummerSpell, system)
        this.prepareAction(system)
        this.handleSpellTypeSpecifics(system, chummerSpell)

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(chummerSpell.name_english), parserType);
        setSubType(system, parserType, formatAsSlug(chummerSpell.category_english));

        return createItemData(chummerSpell.name, parserType, system);
    }

    prepareSystem(system, chummerSpell) {

        system.category = chummerSpell.category_english.toLowerCase().replace(/\s/g, '_');
        system.name = chummerSpell.name;
        system.type = chummerSpell.type === 'M' ? 'mana' : 'physical';
        system.range =
            chummerSpell.range === 'T'
                ? 'touch'
                : chummerSpell.range
                        .toLowerCase()
                        .replace(/\s/g, '_')
                        .replace('(', '')
                        .replace(')', '');
        system.drain = parseInt(chummerSpell.dv.replace(/[A-Z]*/g, ''));
        system.description = parseDescription(chummerSpell);
    }

    parseDuration(chummerSpell, system) {
        if (chummerSpell.duration.toLowerCase() === 's') {
            system.duration = 'sustained';
        }
        else if (chummerSpell.duration.toLowerCase() === 'i') {
            system.duration = 'instant';
        }
        else if (chummerSpell.duration.toLowerCase() === 'p') {
            system.duration = 'permanent';
        }
    }

    prepareAction(system) {
        system.action = {};
        system.action.type = 'varies';
        system.action.skill = 'spellcasting';
        system.action.attribute = 'magic';
        system.action.damage = DataDefaults.damageData();
        system.action.damage.type.base = '';
        system.action.damage.type.value = '';
    }

    handleSpellTypeSpecifics(system, chummerSpell) {
        let category = chummerSpell.category_english;
        if (chummerSpell.descriptors) {
            const desc = chummerSpell.descriptors.toLowerCase();
            if (category.toLowerCase() === 'combat') {
                this.handleCombatSpellSpecifics(system, desc)
            }
            if (category.toLowerCase() === 'detection') {
                this.handleDetectionSpellSpecifics(system, desc)
            }
            if (category.toLowerCase() === 'illusion') {
                this.handleIllusionSpellSpecifics(system, desc)
            }
            if (category.toLowerCase() === 'manipulation') {
                this.handleManipulationSpellSpecifics(system, desc)
            }
            if(category.toLowerCase() === 'rituals') {
                this.handleRitualSpellSpecifics(system, chummerSpell.descriptors)
            }
        }
    }

    handleCombatSpellSpecifics(system, desc) {
        system.combat = {};
        if (desc.includes('indire')) {
            system.combat.type = 'indirect';
            system.action.opposed = {
                type: 'defense',
            };
        } else {
            system.combat.type = 'direct';
            if (system.type === 'mana') {
                system.action.damage.type.base = 'stun';
                system.action.damage.type.value = 'stun';
                system.action.opposed = {
                    type: 'soak',
                    attribute: 'willpower',
                };
            } else if (system.type === 'physical') {
                system.action.damage.type.base = 'physical';
                system.action.damage.type.value = 'physical';
                system.action.opposed = {
                    type: 'soak',
                    attribute: 'body',
                };
            }
        }
    }

    handleDetectionSpellSpecifics(system, desc) {
        system.detection = {};
        const split = desc.split(',');
        split.forEach((token) => {
            token = token || '';
            token = token.replace(' detection spell', '');
            if (!token) return;
            if (token.includes('area')) return;

            if (token.includes('passive'))
                system.detection.passive = true;
            else if (token.includes('active'))
                system.detection.passive = false;
            else if (token)
                system.detection.type = token.toLowerCase();
        });
        if (!system.detection.passive) {
            system.action.opposed = {
                type: 'custom',
                attribute: 'willpower',
                attribute2: 'logic',
            };
        }
    }

    handleIllusionSpellSpecifics(system, desc) {
        system.illusion = {};
        const split = desc.split(',');
        split.forEach((token) => {
            token = token || '';
            token = token.replace(' illusion spell', '');
            if (!token) return;
            if (token.includes('area')) return;

            if (token.includes('sense'))
                system.illusion.sense = token.toLowerCase();
            else if (token)
                system.illusion.type = token.toLowerCase();
        });
        if (system.type === 'mana') {
            system.action.opposed = {
                type: 'custom',
                attribute: 'willpower',
                attribute2: 'logic',
            };
        } else {
            system.action.opposed = {
                type: 'custom',
                attribute: 'intuition',
                attribute2: 'logic',
            };
        }
    }

    handleManipulationSpellSpecifics(system, desc){
        system.manipulation = {};
        if (desc.includes('environmental'))
            system.manipulation.environmental = true;
        if (desc.includes('physical'))
            system.manipulation.physical = true;
        if (desc.includes('mental'))
            system.manipulation.mental = true;
        // TODO figure out how to parse damaging

        if (system.manipulation.mental) {
            system.action.opposed = {
                type: 'custom',
                attribute: 'willpower',
                attribute2: 'logic',
            };
        }
        if (system.manipulation.physical) {
            system.action.opposed = {
                type: 'custom',
                attribute: 'body',
                attribute2: 'strength',
            };
        }
    }

    handleRitualSpellSpecifics(system, desc) {
        system.ritual = {};
        system.ritual.type = desc
        system.action.opposed = {
            type: 'custom',
            attribute: 'force',
            attribute2: 'force',
        };
    }
}