import { PartsList } from '../parts/PartsList';
import ModList = Shadowrun.ModList;
import {Helpers} from "../helpers";
import {SafeString} from "handlebars";
import DamageData = Shadowrun.DamageData;
import ModListEntry = Shadowrun.ModListEntry;

export const registerRollAndLabelHelpers = () => {
    Handlebars.registerHelper('damageAbbreviation', function (damage) {
        if (damage === 'physical') return 'P';
        if (damage === 'stun') return 'S';
        if (damage === 'matrix') return 'M';
        return '';
    });

    Handlebars.registerHelper('damageCode', function(damage: DamageData): SafeString {
        const typeCode = Handlebars.helpers.damageAbbreviation(damage.type.value);
        let code = `${damage.value}${typeCode}`;
        return new Handlebars.SafeString(code);
    });

    Handlebars.registerHelper('diceIcon', function (side) {
        if (side) {
            switch (side) {
                case 1:
                    return 'red';
                case 2:
                    return 'grey';
                case 3:
                    return 'grey';
                case 4:
                    return 'grey';
                case 5:
                    return 'green';
                case 6:
                    return 'green';
            }
        }
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

    Handlebars.registerHelper('modifierValue', function (modifier: ModListEntry<number>) {
        if (isNaN(modifier.value)) return modifier.value;
        const signed = modifier.value > 0 ?  `+${modifier.value}`: `${modifier.value}`;
        return modifier.override ? `= ${signed}` : signed;
    });

    Handlebars.registerHelper('speakerName', Helpers.getChatSpeakerName);
};
