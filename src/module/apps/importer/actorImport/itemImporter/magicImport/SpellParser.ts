import { parseDescription, getArray, createItemData, formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions"
import * as IconAssign from '../../../../iconAssigner/iconAssign';
import { DataDefaults } from "../../../../../data/DataDefaults";
import { ActorSchema } from "../../ActorSchema";
import { Unwrap } from "../ItemsParser";

export class SpellParser {
    async parseSpells(chummerChar: ActorSchema, assignIcons: boolean) {
        const spells = getArray(chummerChar.spells?.spell).filter(chummerSpell => !chummerSpell.category_english.includes("Rituals"));
        const parsedSpells: Shadowrun.SpellItemData[] = [];
        const iconList = await IconAssign.getIconFiles();

        for (const spell of spells) {
            try {
                if (spell.alchemy !== 'True') {
                    const itemData = await this.parseSpell(spell);

                    // Assign the icon if enabled
                    if (assignIcons)
                        itemData.img = IconAssign.iconAssign(itemData.system.importFlags, iconList, itemData.system);

                    parsedSpells.push(itemData);
                }
            } catch (e) {
                console.error(e);
            }
        };

        return parsedSpells;
    }

    async parseSpell(chummerSpell: Unwrap<NonNullable<ActorSchema['spells']>['spell']>) {
        const parserType = 'spell';
        const system = {} as Shadowrun.SpellData;

        this.prepareSystem(system, chummerSpell)

        let description = '';
        if (chummerSpell.descriptors) description = chummerSpell.descriptors;
        if (chummerSpell.description) description += `\n${chummerSpell.description}`;
        system.description.value = await TextEditor.enrichHTML(description);

        this.parseDuration(chummerSpell, system)
        this.prepareAction(system)
        this.handleSpellTypeSpecifics(system, chummerSpell)

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(chummerSpell.name_english), parserType);
        setSubType(system, parserType, formatAsSlug(chummerSpell.category_english));

        return createItemData(chummerSpell.name, parserType, system);
    }

    prepareSystem(system: Shadowrun.SpellData, chummerSpell: Unwrap<NonNullable<ActorSchema['spells']>['spell']>) {

        system.category = chummerSpell.category_english.toLowerCase().replace(/\s/g, '_') as any;
        system.type = chummerSpell.type === 'M' ? 'mana' : 'physical';
        system.range =
            chummerSpell.range === 'T'
                ? 'touch'
                : chummerSpell.range
                        .toLowerCase()
                        .replace(/\s/g, '_')
                        .replace('(', '')
                        .replace(')', '') as any;
        system.drain = parseInt(chummerSpell.dv.replace(/[A-Z]*/g, ''));
        system.description = parseDescription(chummerSpell);
    }

    parseDuration(chummerSpell: Unwrap<NonNullable<ActorSchema['spells']>['spell']>, system: Shadowrun.SpellData) {
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

    prepareAction(system: Shadowrun.SpellData) {
        system.action = {} as Shadowrun.SpellData['action'];
        system.action.type = 'varies';
        system.action.skill = 'spellcasting';
        system.action.attribute = 'magic';
        system.action.damage = DataDefaults.damageData();
        system.action.damage.type.base = '';
        system.action.damage.type.value = '';
    }

    handleSpellTypeSpecifics(system: Shadowrun.SpellData, chummerSpell: Unwrap<NonNullable<ActorSchema['spells']>['spell']>) {
        const category = chummerSpell.category_english;
        if (chummerSpell.descriptors) {
            const desc = chummerSpell.descriptors.toLowerCase();
            if (category.toLowerCase() === 'combat') {
                this.handleCombatSpellSpecifics(system, desc, chummerSpell.damage)
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
        }
    }

    handleCombatSpellSpecifics(system: Shadowrun.SpellData, desc: string, damage: string) {
        system.combat = {} as Shadowrun.SpellData['combat'];
        if (desc.includes('indire')) {
            system.combat.type = 'indirect';
            system.action.opposed.test = 'defense';
        } else {
            system.combat.type = 'direct';
            if (system.type === 'mana') {
                system.action.opposed.test = 'soak';
                system.action.opposed.attribute = 'willpower';
            } else if (system.type === 'physical') {
                system.action.opposed.test = 'soak';
                system.action.opposed.attribute = 'body';
            }
        }

        if(damage.includes("0")) {
            system.action.damage.type.base = damage.match(/[SG]/) !== null  ? 'stun' : 'physical' ;
            system.action.damage.type.value = system.action.damage.type.base;
        }
    }

    handleDetectionSpellSpecifics(system: Shadowrun.SpellData, desc: string) {
        system.detection = {} as Shadowrun.SpellData['detection'];
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
                system.detection.type = token.toLowerCase() as any;
        });
        if (!system.detection.passive) {
            system.action.opposed.type = 'custom';
            system.action.opposed.attribute = 'willpower';
            system.action.opposed.attribute2 = 'logic';
        }
    }

    handleIllusionSpellSpecifics(system: Shadowrun.SpellData, desc: string) {
        system.illusion = {} as Shadowrun.SpellData['illusion'];
        const split = desc.split(',');
        split.forEach((token) => {
            token = token || '';
            token = token.replace(' illusion spell', '');
            if (!token) return;
            if (token.includes('area')) return;

            if (token.includes('sense'))
                system.illusion.sense = token.toLowerCase() as any;
            else if (token)
                system.illusion.type = token.toLowerCase() as any;
        });
        if (system.type === 'mana') {
            system.action.opposed.type = 'custom';
            system.action.opposed.attribute = 'willpower';
            system.action.opposed.attribute2 = 'logic';
        } else {
            system.action.opposed.type = 'custom';
            system.action.opposed.attribute = 'intuition';
            system.action.opposed.attribute2 = 'logic';
        }
    }

    handleManipulationSpellSpecifics(system: Shadowrun.SpellData, desc: string){
        system.manipulation = {} as Shadowrun.SpellData['manipulation'];
        if (desc.includes('environmental'))
            system.manipulation.environmental = true;
        if (desc.includes('physical'))
            system.manipulation.physical = true;
        if (desc.includes('mental'))
            system.manipulation.mental = true;
        // TODO figure out how to parse damaging

        if (system.manipulation.mental) {
            system.action.opposed.type = 'custom';
            system.action.opposed.attribute = 'willpower';
            system.action.opposed.attribute2 = 'logic';
        }
        if (system.manipulation.physical) {
            system.action.opposed.type = 'custom';
            system.action.opposed.attribute = 'body';
            system.action.opposed.attribute2 = 'strength';
        }
    }
}
