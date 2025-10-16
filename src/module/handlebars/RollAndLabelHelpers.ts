import { PartsList } from '../parts/PartsList';
import ModList = Shadowrun.ModList;
import {Helpers} from "../helpers";
import {SafeString} from "handlebars";
import { DamageType } from '../types/item/Action';
import { SR5Die } from '../rolls/SR5Die';

const sr5Die = new SR5Die();

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

    Handlebars.registerHelper('dieResultCssClasses', function (result: foundry.dice.terms.Die.TermData['results'][number]) {
        return sr5Die.getResultCSS(result).filter(cssClass => cssClass).join(' ');
    });

    Handlebars.registerHelper('elementIcon', function (element) {
        let icon = '';
        if (element === 'electricity') {
            icon = 'fas fa-bolt';
        } else if (element === 'radiation') {
            icon = 'fas fa-radiation-alt';
        } else if (element === 'fire') {
            icon = 'fas fa-fire';
        } else if (element === 'acid') {
            icon = 'fas fa-vials';
        } else if (element === 'cold') {
            icon = 'fas fa-snowflake';
        }
        return icon;
    });

    Handlebars.registerHelper('partsTotal', function (partsList: ModList<number>) {
        const parts = new PartsList(partsList);
        return parts.total;
    });

    Handlebars.registerHelper('signedValue', function (value: number) {
        return value > 0 ?  `+${value}`: `${value}`;
    });

    Handlebars.registerHelper('speakerName', Helpers.getChatSpeakerName.bind(Helpers));
    Handlebars.registerHelper('speakerImg', Helpers.getChatSpeakerImg.bind(Helpers));
};
