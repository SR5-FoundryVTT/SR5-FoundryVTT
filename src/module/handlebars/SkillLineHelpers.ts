import {SkillRules} from "../rules/SkillRules";
import {FLAGS, SYSTEM_NAME} from "../constants";
import { SkillFieldType } from '../types/template/Skills';

export const registerSkillLineHelpers = () => {

    Handlebars.registerHelper('skillSpecializations', function (skill: SkillFieldType) {
        const span = document.createElement('span');

        for (const spec of skill.specs) {
            const specSpan = document.createElement('a');
            specSpan.textContent = spec;
            specSpan.className = 'skill-specialization';
            specSpan.dataset.action = 'skillSpecRoll';
            specSpan.dataset.skill = skill.id
            span.appendChild(specSpan);
        }

        return new Handlebars.SafeString(span.outerHTML);
    })

    Handlebars.registerHelper('skillClass', function(skill: SkillFieldType) {
        const classes: string[] = [];

        // @PDF SR5#151 not defaultable skills should be shown as italic.
        if (game.settings.get(SYSTEM_NAME, FLAGS.ShowSkillsWithDetails) && !SkillRules.allowDefaultingRoll(skill)) {
            classes.push('skill-roll-not-defaultable');
        }

        return new Handlebars.SafeString(classes.join(" "));
    })

};
