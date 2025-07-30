import SkillField = Shadowrun.SkillField;
import { Helpers } from '../helpers';
import SR5SheetFilters = Shadowrun.SR5SheetFilters;
import SkillCategories = Shadowrun.SkillCategories;
import {SkillRules} from "../rules/SkillRules";
import {FLAGS, SYSTEM_NAME} from "../constants";

export const registerSkillLineHelpers = () => {
    Handlebars.registerHelper('SkillHeaderIcons', function (category: SkillCategories) {
        const addIcon = {
            icon: 'fas fa-plus',
            title: game.i18n.localize('SR5.AddSkill'),
            text: game.i18n.localize('SR5.Add'),
            cssClass: '',
        };
        switch (category) {
            case 'active':
                addIcon.cssClass = 'add-active';
                return [addIcon];
            case 'language':
                addIcon.cssClass = 'add-language';
                return [addIcon];
            case 'knowledge':
                addIcon.cssClass = 'add-knowledge';
                return [addIcon];
            default:
                return [];
        }
    });

    /**
     * Handle the right side of the skill header.
     * 
     * Main feature necessary is to indicate the list being filtered or not.
     * 
     * @param id The skill category of this skill header.
     * @param filters As soon as the sheet uses some kind of filter this will provide an object that is 'truey'.
     */
    Handlebars.registerHelper('SkillHeaderRightSide', function (id: string, filters?: SR5SheetFilters) {
        const specs = {
            text: {
                text: game.i18n.localize('SR5.Specialization'),
                cssClass: 'skill-spec-item',
            },
        };

        // Display filters for active skills. See issue #871.
        // when not given, filters won't be undefined, but will contain a handlebar object.
        const activeSkillFilter = id === 'active' &&
            filters && filters.hasOwnProperty('showUntrainedSkills') &&
            !filters.showUntrainedSkills;

        const rtg = {
            text: {
                text: activeSkillFilter ?
                    game.i18n.localize('SR5.RtgAboveZero') :
                    game.i18n.localize('SR5.Rtg'),
                cssClass: 'rtg',
            },
        };

        switch (id) {
            case 'active':
            case 'knowledge':
            case 'language':
                return [specs, rtg];
            default:
                return [];
        }
    });
    Handlebars.registerHelper('SkillRightSide', function (skillType: string, skill: SkillField) {
        const specs = Array.isArray(skill.specs) ? skill.specs : [skill.specs];
        return [
            {
                html: {
                    text: specs.map(spec => `<span class="roll skill-spec-roll">${spec}</span>`).join(', '),
                    cssClass: 'skill-spec-item',
                }
            },
            {
                text: {
                    text: Helpers.calcTotal(skill),
                    cssClass: 'rtg',
                },
            },
        ];
    });

    Handlebars.registerHelper('SkillAdditionCssClass', function(skill: SkillField): string[] {
        const classes: string[] = [];

        // @PDF SR5#151 not defaultable skills should be shown as italic.
        if (game.settings.get(SYSTEM_NAME, FLAGS.ShowSkillsWithDetails) && !SkillRules.allowDefaultingRoll(skill)) {
            classes.push('skill-roll-not-defaultable');
        }

        return classes;
    })

    Handlebars.registerHelper('SkillIcons', function (skillType: string, skill: SkillField) {
        const editIcon = {
            icon: 'fas fa-edit',
            title: game.i18n.localize('SR5.EditSkill'),
            cssClass: '',
        };
        const openSourceIcon = { 
            icon: 'fas fa-file',
            title: game.i18n.localize('SR5.OpenSource'),
            cssClass: '',
        }
        const removeIcon = {
            icon: 'fas fa-trash',
            title: game.i18n.localize('SR5.DeleteSkill'),
            cssClass: '',
        };
        const teamworkIcon = {
            icon: 'fas fa-users',
            title: game.i18n.localize('SR5.Skill.Teamwork.Start'),
            cssClass: '',
        };
        switch (skillType) {
            case 'active':
                teamworkIcon.cssClass = 'start-teamwork';
                editIcon.cssClass = 'skill-edit';
                removeIcon.cssClass = 'remove-active'
                openSourceIcon.cssClass = 'skill-opensource'
                return [teamworkIcon, openSourceIcon, editIcon, removeIcon];
            case 'language':
                teamworkIcon.cssClass = 'start-teamwork';
                editIcon.cssClass = 'language-skill-edit';
                removeIcon.cssClass = 'remove-language';
                openSourceIcon.cssClass = 'language-skill-opensource'
                return [teamworkIcon, openSourceIcon, editIcon, removeIcon];
            case 'knowledge':
                teamworkIcon.cssClass = 'start-teamwork';
                editIcon.cssClass = 'knowledge-skill-edit';
                removeIcon.cssClass = 'remove-knowledge';
                openSourceIcon.cssClass = 'knowledge-skill-opensource'
                return [teamworkIcon, openSourceIcon, editIcon, removeIcon];
            default:
                return [editIcon];
        }
    });

};
