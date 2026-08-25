import {Helpers} from "../helpers";
import {SafeString} from "handlebars";
import { DamageType } from '../types/item/Action';
import { SR5Die } from '../rolls/SR5Die';
type Result = Parameters<foundry.dice.terms.Die['getResultCSS']>[0];

export const registerRollAndLabelHelpers = () => {
    Handlebars.registerHelper('damageAbbreviation', function (damage) {
        if (damage === 'physical') return 'P';
        if (damage === 'stun') return 'S';
        if (damage === 'matrix') return 'M';
        return '';
    });

    Handlebars.registerHelper('damageCode', function(damage: DamageType): SafeString {
        const typeCode = Handlebars.helpers.damageAbbreviation(damage.type.value);
        const code = `${damage.value}${typeCode}`;
        return new Handlebars.SafeString(code);
    });

    Handlebars.registerHelper('spellDrainCode', function (drain: number) {
        const value = Number(drain) || 0;
        const operator = value >= 0 ? '+' : '-';
        return `F ${operator} ${Math.abs(value)}`;
    });

    Handlebars.registerHelper('dieResultCssClasses', function (result: Result) {
        return SR5Die.getResultCSS(result).filter(cssClass => cssClass).join(' ');
    });

    Handlebars.registerHelper('elementIcon', function (element) {
        let icon = '';
        if (element === 'acid') {
            icon = 'fas fa-vials';
        } else if (element === 'cold') {
            icon = 'fas fa-snowflake';
        } else if (element === 'electricity') {
            icon = 'fas fa-bolt';
        } else if (element === 'fire') {
            icon = 'fas fa-fire';
        } else if (element === 'pollutant') {
            icon = 'fas fa-smog';
        } else if (element === 'radiation') {
            icon = 'fas fa-radiation-alt';
        } else if (element === 'water') {
            icon = 'fas fa-droplet';
        }
        return icon;
    });

    Handlebars.registerHelper('spellDescriptorLine', function (system, config) {
        if (!system?.category) return '';

        const descriptors: string[] = [];
        const localizeConfig = (value: string | undefined, map: Record<string, string> | undefined) => {
            if (!value || !map?.[value]) return '';
            return game.i18n.localize(map[value] as string);
        };
        const addDescriptor = (value: string) => {
            if (value && !descriptors.includes(value)) descriptors.push(value);
        };

        if (system.category === 'combat') {
            addDescriptor(localizeConfig(system.combat?.type, config?.combatSpellTypes));
            if (system.action?.damage?.element?.value) addDescriptor(game.i18n.localize('SR5.Spell.Elemental'));
        } else if (system.category === 'detection') {
            addDescriptor(system.detection?.passive ? game.i18n.localize('SR5.Passive') : game.i18n.localize('SR5.Active'));
            addDescriptor(localizeConfig(system.detection?.type, config?.detectionSpellTypes));
            if (system.detection?.extended) addDescriptor(game.i18n.localize('SR5.DetectionSpellExtended'));
        } else if (system.category === 'health') {
            if (system.range === 'touch') addDescriptor(game.i18n.localize('SR5.Spell.HealthEssence'));
        } else if (system.category === 'illusion') {
            addDescriptor(localizeConfig(system.illusion?.type, config?.illusionSpellTypes));
            addDescriptor(localizeConfig(system.illusion?.sense, config?.illusionSpellSenses));
            if (system.range === 'los_a') addDescriptor(game.i18n.localize('SR5.Spell.DetectionArea'));
        } else if (system.category === 'manipulation') {
            if (system.manipulation?.mental) addDescriptor(game.i18n.localize('SR5.Spell.ManipulationMental'));
            if (system.manipulation?.physical) addDescriptor(game.i18n.localize('SR5.Spell.ManipulationPhysical'));
            if (system.manipulation?.environmental) addDescriptor(game.i18n.localize('SR5.Spell.ManipulationEnvironmental'));
            if (system.manipulation?.damaging) addDescriptor(game.i18n.localize('SR5.Spell.ManipulationDamaging'));
            if (system.range === 'los_a') addDescriptor(game.i18n.localize('SR5.Spell.DetectionArea'));
        }

        if (!descriptors.length) return '';
        return `(${descriptors.map(descriptor => descriptor.toLocaleUpperCase(game.i18n.lang)).join(', ')})`;
    });

    Handlebars.registerHelper('signedValue', function (value: number) {
        return value >= 0 ?  `+${value}`: `${value}`;
    });

    Handlebars.registerHelper('speakerName', Helpers.getChatSpeakerName.bind(Helpers));
    Handlebars.registerHelper('speakerImg', Helpers.getChatSpeakerImg.bind(Helpers));
};
