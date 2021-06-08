import { parseDescription, getArray, createItemData } from "./BaseParserFunctions.js"
import { DefaultValues } from "../../data/DataDefaults";

export class SpellParser {
    parseSpells(chummerChar) {
        const spells = getArray(chummerChar.spells.spell);
        const parsedSpells = [];
        spells.forEach((chummerSpell) => {
            try {
                if (chummerSpell.alchemy.toLowerCase() !== 'true') {
                    const itemData = this.parseSpell(chummerSpell);
                    parsedSpells.push(itemData);
                }
            } catch (e) {
                console.error(e);
            }
        });

        return parsedSpells;
    }

    parseSpell(chummerSpell) {
        const action = {};
        const data = {};
        data.action = action;
        data.category = chummerSpell.category.toLowerCase().replace(/\s/g, '_');
        data.name = chummerSpell.name;
        data.type = chummerSpell.type === 'M' ? 'mana' : 'physical';
        data.range =
            chummerSpell.range === 'T'
                ? 'touch'
                : chummerSpell.range
                        .toLowerCase()
                        .replace(/\s/g, '_')
                        .replace('(', '')
                        .replace(')', '');
        data.drain = parseInt(chummerSpell.dv.replace('F', ''));
        data.description = parseDescription(chummerSpell);

        let description = '';
        if (chummerSpell.descriptors) description = chummerSpell.descriptors;
        if (chummerSpell.description) description += `\n${chummerSpell.description}`;
        data.description.value = TextEditor.enrichHTML(description);

        if (chummerSpell.duration.toLowerCase() === 's') data.duration = 'sustained';
        else if (chummerSpell.duration.toLowerCase() === 'i')
            data.duration = 'instant';
        else if (chummerSpell.duration.toLowerCase() === 'p')
            data.duration = 'permanent';

        action.type = 'varies';
        action.skill = 'spellcasting';
        action.attribute = 'magic';
        action.damage = DefaultValues.damageData();
        action.damage.type.base = '';
        action.damage.type.value = '';

        if (chummerSpell.descriptors) {
            const desc = chummerSpell.descriptors.toLowerCase();
            if (chummerSpell.category.toLowerCase() === 'combat') {
                data.combat = {};
                if (desc.includes('indirect')) {
                    data.combat.type = 'indirect';
                    action.opposed = {
                        type: 'defense',
                    };
                } else {
                    data.combat.type = 'direct';
                    if (data.type === 'mana') {
                        action.damage.type.base = 'stun';
                        action.damage.type.value = 'stun';
                        action.opposed = {
                            type: 'soak',
                            attribute: 'willpower',
                        };
                    } else if (data.type === 'physical') {
                        action.damage.type.base = 'physical';
                        action.damage.type.value = 'physical';
                        action.opposed = {
                            type: 'soak',
                            attribute: 'body',
                        };
                    }
                }
            }
            if (chummerSpell.category.toLowerCase() === 'detection') {
                data.detection = {};
                const split = desc.split(',');
                split.forEach((token) => {
                    token = token || '';
                    token = token.replace(' detection spell', '');
                    if (!token) return;
                    if (token.includes('area')) return;

                    if (token.includes('passive'))
                        data.detection.passive = true;
                    else if (token.includes('active'))
                        data.detection.passive = false;
                    else if (token)
                        data.detection.type = token.toLowerCase();
                });
                if (!data.detection.passive) {
                    action.opposed = {
                        type: 'custom',
                        attribute: 'willpower',
                        attribute2: 'logic',
                    };
                }
            }
            if (chummerSpell.category.toLowerCase() === 'illusion') {
                data.illusion = {};
                const split = desc.split(',');
                split.forEach((token) => {
                    token = token || '';
                    token = token.replace(' illusion spell', '');
                    if (!token) return;
                    if (token.includes('area')) return;

                    if (token.includes('sense'))
                        data.illusion.sense = token.toLowerCase();
                    else if (token)
                        data.illusion.type = token.toLowerCase();
                });
                if (data.type === 'mana') {
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
            if (chummerSpell.category.toLowerCase() === 'manipulation') {
                data.manipulation = {};
                if (desc.includes('environmental'))
                    data.manipulation.environmental = true;
                if (desc.includes('physical'))
                    data.manipulation.physical = true;
                if (desc.includes('mental'))
                    data.manipulation.mental = true;
                // TODO figure out how to parse damaging

                if (data.manipulation.mental) {
                    action.opposed = {
                        type: 'custom',
                        attribute: 'willpower',
                        attribute2: 'logic',
                    };
                }
                if (data.manipulation.physical) {
                    action.opposed = {
                        type: 'custom',
                        attribute: 'body',
                        attribute2: 'strength',
                    };
                }
            }
        }

        return createItemData(chummerSpell.name, 'spell', data);
    }
}