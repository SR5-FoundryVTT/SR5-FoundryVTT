import { formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions"
import { BlankItem, ExtractItemType, Parser } from "../Parser";

export class SpellParser extends Parser<'spell'> {
    protected readonly parseType = 'spell';
    protected readonly compKey = 'Spell';

    protected parseItem(item: BlankItem<'spell'>, itemData: ExtractItemType<'spells', 'spell'>) {
        const system = item.system;

        this.prepareSystem(system, itemData);

        this.parseDuration(system, itemData);
        this.prepareAction(system);
        this.handleSpellTypeSpecifics(system, itemData);

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(itemData.name_english), this.parseType);
        setSubType(system, this.parseType, formatAsSlug(itemData.category_english));
    }

    private prepareSystem(system: BlankItem<'spell'>['system'], itemData: ExtractItemType<'spells', 'spell'>) {
        system.category = itemData.category_english.toLowerCase().replace(/\s/g, '_') as any;
        system.type = itemData.type_english === 'M' ? 'mana' : 'physical';
        system.range =
            itemData.range_english === 'T'
                ? 'touch'
                : itemData.range_english
                        .toLowerCase()
                        .replace(/\s/g, '_')
                        .replace('(', '')
                        .replace(')', '') as any;
        system.drain = parseInt(itemData.dv_english.replace(/[A-Z]*/g, ''));
    }

    private parseDuration(system: BlankItem<'spell'>['system'], itemData: ExtractItemType<'spells', 'spell'>) {
        const duration = itemData.duration_english.toLowerCase();
        if (duration === 's')
            system.duration = 'sustained';
        else if (duration === 'i')
            system.duration = 'instant';
        else if (duration === 'p')
            system.duration = 'permanent';
    }

    private prepareAction(system: BlankItem<'spell'>['system']) {
        system.action.type = 'varies';
        system.action.skill = 'spellcasting';
        system.action.attribute = 'magic';
    }

    private handleSpellTypeSpecifics(system: BlankItem<'spell'>['system'], itemData: ExtractItemType<'spells', 'spell'>) {
        const category = itemData.category_english.toLowerCase();
        if (itemData.descriptors_english) {
            const desc = itemData.descriptors_english.toLowerCase();
            if (category === 'combat') {
                this.handleCombatSpellSpecifics(system, desc, itemData.damage_english)
            }
            if (category === 'detection') {
                this.handleDetectionSpellSpecifics(system, desc)
            }
            if (category === 'illusion') {
                this.handleIllusionSpellSpecifics(system, desc)
            }
            if (category === 'manipulation') {
                this.handleManipulationSpellSpecifics(system, desc)
            }
        }
    }

    private handleCombatSpellSpecifics(system: BlankItem<'spell'>['system'], desc: string, damage: string) {
        if (desc.includes('indirect')) {
            system.combat.type = 'indirect';
            system.action.opposed.type= 'defense';
        } else {
            system.combat.type = 'direct';
            if (system.type === 'mana') {
                system.action.opposed.type = 'soak';
                system.action.opposed.attribute = 'willpower'
            } else if (system.type === 'physical') {
                system.action.opposed.type = 'soak';
                system.action.opposed.attribute = 'body';
            }
        }

        if(damage.includes("0")) {
            system.action.damage.type.base = damage.match(/[SG]/) !== null  ? 'stun' : 'physical' ;
            system.action.damage.type.value = system.action.damage.type.base;
        }
    }

    private handleDetectionSpellSpecifics(system: BlankItem<'spell'>['system'], desc: string) {
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

    private handleIllusionSpellSpecifics(system: BlankItem<'spell'>['system'], desc: string) {
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

    private handleManipulationSpellSpecifics(system: BlankItem<'spell'>['system'], desc: string){
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
