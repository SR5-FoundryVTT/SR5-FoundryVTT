import { parseDescription, getArray, createItemData, formatAsSlug, genImportFlags, setSubType } from "./BaseParserFunctions.js"
import { DataDefaults } from "../../data/DataDefaults";
import * as IconAssign from '../../apps/iconAssigner/iconAssign';

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
        const action = {};
        const system = {};
        let category = chummerSpell.category_english;
        system.action = action;
        system.category = category.toLowerCase().replace(/\s/g, '_');
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
        system.drain = parseInt(chummerSpell.dv.replace('F', ''));
        system.description = parseDescription(chummerSpell);

        let description = '';
        if (chummerSpell.descriptors) description = chummerSpell.descriptors;
        if (chummerSpell.description) description += `\n${chummerSpell.description}`;
        system.description.value = TextEditor.enrichHTML(description);

        if (chummerSpell.duration.toLowerCase() === 's') system.duration = 'sustained';
        else if (chummerSpell.duration.toLowerCase() === 'i')
            system.duration = 'instant';
        else if (chummerSpell.duration.toLowerCase() === 'p')
            system.duration = 'permanent';

        action.type = 'varies';
        action.skill = 'spellcasting';
        action.attribute = 'magic';
        action.damage = DataDefaults.damageData();
        action.damage.type.base = '';
        action.damage.type.value = '';

        if (chummerSpell.descriptors) {
            const desc = chummerSpell.descriptors.toLowerCase();
            if (category.toLowerCase() === 'combat') {
                system.combat = {};
                if (desc.includes('indirect')) {
                    system.combat.type = 'indirect';
                    action.opposed = {
                        type: 'defense',
                    };
                } else {
                    system.combat.type = 'direct';
                    if (system.type === 'mana') {
                        action.damage.type.base = 'stun';
                        action.damage.type.value = 'stun';
                        action.opposed = {
                            type: 'soak',
                            attribute: 'willpower',
                        };
                    } else if (system.type === 'physical') {
                        action.damage.type.base = 'physical';
                        action.damage.type.value = 'physical';
                        action.opposed = {
                            type: 'soak',
                            attribute: 'body',
                        };
                    }
                }
            }
            if (category.toLowerCase() === 'detection') {
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
                    action.opposed = {
                        type: 'custom',
                        attribute: 'willpower',
                        attribute2: 'logic',
                    };
                }
            }
            if (category.toLowerCase() === 'illusion') {
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
                    action.opposed = {
                        type: 'custom',
                        attribute: 'willpower',
                        attribute2: 'logic',
                    };
                } else {
                    action.opposed = {
                        type: 'custom',
                        attribute: 'intuition',
                        attribute2: 'logic',
                    };
                }
            }
            if (category.toLowerCase() === 'manipulation') {
                system.manipulation = {};
                if (desc.includes('environmental'))
                    system.manipulation.environmental = true;
                if (desc.includes('physical'))
                    system.manipulation.physical = true;
                if (desc.includes('mental'))
                    system.manipulation.mental = true;
                // TODO figure out how to parse damaging

                if (system.manipulation.mental) {
                    action.opposed = {
                        type: 'custom',
                        attribute: 'willpower',
                        attribute2: 'logic',
                    };
                }
                if (system.manipulation.physical) {
                    action.opposed = {
                        type: 'custom',
                        attribute: 'body',
                        attribute2: 'strength',
                    };
                }
            }
        }

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(chummerSpell.name_english), parserType);
        setSubType(system, parserType, formatAsSlug(chummerSpell.category_english));

        return createItemData(chummerSpell.name, parserType, system);
    }
}