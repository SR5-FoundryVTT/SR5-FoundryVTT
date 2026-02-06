import {SkillRules} from "../rules/SkillRules";
import {FLAGS, SYSTEM_NAME} from "../constants";
import { SR5Item } from "../item/SR5Item";

export const registerSkillLineHelpers = () => {

    Handlebars.registerHelper('skillSpecializations', function (skill: SR5Item<'skill'>) {
        const span = document.createElement('span');

        console.error('TODO: tam - reuse older specialization rendering logic');
        // for (const spec of skill.system.skill.specializations) {
        //     const specSpan = document.createElement('a');
        //     specSpan.textContent = spec;
        //     specSpan.className = 'skill-specialization';
        //     specSpan.dataset.action = 'rollSkillSpecialization';
        //     specSpan.dataset.skill = skill.id as string;
        //     span.appendChild(specSpan);
        // }

        return new Handlebars.SafeString(span.outerHTML);
    })

    Handlebars.registerHelper('skillClass', function(skill: SR5Item<'skill'>) {
        const classes: string[] = [];

        // @PDF SR5#151 not defaultable skills should be shown as italic.
        console.error("TODO: reimplement skillClass helper for new skill structure");
        // if (game.settings.get(SYSTEM_NAME, FLAGS.ShowSkillsWithDetails) && !SkillRules.allowDefaultingRoll(skill)) {
        //     classes.push('skill-roll-not-defaultable');
        // }

        return new Handlebars.SafeString(classes.join(" "));
    })

};
