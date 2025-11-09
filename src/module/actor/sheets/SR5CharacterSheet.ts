import { Helpers } from '../../helpers';
import { MatrixActorSheetData, SR5MatrixActorSheet } from '@/module/actor/sheets/SR5MatrixActorSheet';
import { SheetFlow } from '@/module/flows/SheetFlow';
import { NuyenManager } from '@/module/apps/actor/NuyenManager';
import { KarmaManager } from '@/module/apps/actor/KarmaManager';
import { ReputationManager } from '@/module/apps/actor/ReputationManager';


export interface CharacterSheetData extends MatrixActorSheetData {
    isCharacter: boolean;
}

export class SR5CharacterSheet extends SR5MatrixActorSheet<CharacterSheetData> {
    /**
     * Character actors will handle these item types specifically.
     *
     * All others will be collected within the gear tab.
     *
     * @returns An array of item types from the template.json Item section.
     */
    override getHandledItemTypes(): Item.ConfiguredSubType[] {
        const itemTypes = super.getHandledItemTypes();

        return [
            ...itemTypes,
            'program',
            'sin',
            'lifestyle',
            'contact',
            'spell',
            'adept_power',
            'complex_form',
            'quality',
            'echo',
            'metamagic',
            'critter_power',
            'call_in_action',
            'sprite_power',
            'ritual'
        ];
    }

    static override TABS = {
        ...super.TABS,
        primary: {
            initial: 'skills',
            tabs: [
                { id: 'actions', label: 'SR5.Tabs.Actor.Actions', cssClass: '' },
                { id: 'skills', label: 'SR5.Tabs.Actor.Character', cssClass: '' },
                { id: 'inventory', label: 'SR5.Tabs.Actor.Inventory', cssClass: '' },
                { id: 'critterPowers', label: 'SR5.Tabs.Actor.CritterPowers', cssClass: '' },
                { id: 'magic', label: 'SR5.Tabs.Actor.Magic', cssClass: '' },
                { id: 'matrix', label: 'SR5.Tabs.Actor.Matrix', cssClass: '' },
                { id: 'social', label: 'SR5.Tabs.Actor.Social', cssClass: '' },
                { id: 'bio', label: 'SR5.Tabs.Actor.Bio', cssClass: '' },
                { id: 'effects', label: 'SR5.Tabs.Actor.Effects', cssClass: '' },
                { id: 'description', label: '', icon: 'far fa-info', tooltip: 'SR5.Tooltips.Actor.Description', cssClass: 'skinny' },
                { id: 'misc', label: '', icon: 'fas fa-gear', tooltip: 'SR5.Tooltips.Actor.MiscConfig', cssClass: 'skinny' },
            ]
        },
    }

    static override DEFAULT_OPTIONS = {
        actions: {
            openNuyenManager: SR5CharacterSheet.#openNuyenManager,
            openKarmaManager: SR5CharacterSheet.#openKarmaManager,
            openReputationManager: SR5CharacterSheet.#openReputationManager,
        }
    }

    static override PARTS = {
        ...super.PARTS,
        skills: {
            template: SheetFlow.templateBase('actor/tabs/character-skills'),
            templates: [
                ...SheetFlow.templateActorSystemParts('active-skills', 'language-and-knowledge-skills', 'attributes', 'special-attributes' ),
                ...SheetFlow.templateListItem('skill')
            ],
            scrollable: ['#active-skills-scroll', '#knowledge-skills-scroll']
        },
        magic: {
            template: SheetFlow.templateBase('actor/tabs/magic'),
            templates: [
                ...SheetFlow.templateActorSystemParts( 'spells', 'rituals', 'summonings', 'adept-powers'),
                ],
            scrollable: ['.scrollable']
        },
        critterPowers: {
            template: SheetFlow.templateBase('actor/tabs/critter-powers'),
            scrollable: ['.scrollable']
        },
        inventory: {
            template: SheetFlow.templateBase('actor/tabs/inventory'),
            scrollable: ['.scrollable']
        },
        social: {
            template: SheetFlow.templateBase('actor/tabs/social'),
            scrollable: ['.scrollable']
        },
        bio: {
            template: SheetFlow.templateBase('actor/tabs/bio'),
            scrollable: ['#metamagics-scroll-list', '#quality-scroll-list', '#echoes-scroll-list'],
        },
    }

    /**
     * Character actors will always show these item types.
     *
     * For more info see into super.getInventoryItemTypes jsdoc.
     *
     * @returns An array of item types from the template.json Item section.
     */
    override getInventoryItemTypes(): Item.ConfiguredSubType[] {
        const itemTypes = super.getInventoryItemTypes();

        return [
            ...itemTypes,
            'weapon',
            'ammo',
            'armor',
            'bioware',
            'cyberware',
            'device',
            'equipment',
            'modification'
        ];
    }

    override async _prepareContext(options) {
        const data = await super._prepareContext(options);

        // Character actor types are matrix actors.
        super._prepareMatrixAttributes(data);

        data.isCharacter = true;
        return data;
    }

    protected override _prepareTabs(group: string) {
        const parts = super._prepareTabs(group);
        if (group === 'primary') {
            // if we should hide empty tabs
            if (this.isPlayMode && this.hideEmptyCategories()) {
                if (parts.social && !this.actor.hasItemOfType('sin', 'contact', 'lifestyle')) {
                    parts.social.hidden = true;
                }
                if (parts.bio && !this.actor.hasItemOfType('quality', 'metamagic', 'echo')) {
                    parts.bio.hidden = true;
                }
            }
            // hide critter powers if the character is not set as a critter and doesn't have critter powers
            if (parts.critterPowers
                && ((this.isPlayMode && !this._hasCritterPowers())
                    || (this.isEditMode && !(this.actor.isType('critter') || this.actor.system.is_critter)))) {
                parts.critterPowers.hidden = true;
            }
            if (parts.matrix && !(this.actor.isEmerged() || this.actor.hasPersona)) {
                parts.matrix.hidden = true;
            }
            if (parts.magic && (!this.actor.isAwakened() || (this.isPlayMode && this.hideEmptyCategories() && !this._hasMagicItems()))) {
                parts.magic.hidden = true;
            }
        }
        return parts;
    }

    override async _preparePartContext(partId, context, options) {
        const partContext = await super._preparePartContext(partId, context, options);

        if (partId === 'skills') {
            // initialize the check by seeing if we have language skills to skill over the other check
            partContext.hasLanguageKnowledgeSkills = Object.keys(this.actor.system.skills.language.value).length > 0;
            if (!partContext.hasLanguageKnowledgeSkills) {
                // iterate over the knowledge skill object and check if we have anything
                for (const value of Object.values(this.actor.system.skills.knowledge)) {
                    if (Object.values(value.value).length > 0) {
                        partContext.hasLanguageKnowledgeSkills = true;
                    }
                }
            }
        }

        return partContext;
    }

    /**
     * Inject special case handling for call in action items, only usable by character actors.
     */
    protected override async _handleCreateItem(event) {
        const type = event.target.dataset.itemType;
        if (type === 'summoning' || type === 'compilation') {
            event.preventDefault();
            return this._onCallInActionCreate(type);
        }
        return super._handleCreateItem(event);
    }

    /**
     * Create a call in action item with pre configured actor type.
     *
     * @param type The call in action sub type.
     */
    async _onCallInActionCreate(type: 'summoning'|  'compilation') {
        // Determine actor type from sub item type.
        const typeToActorType = {
            'summoning': 'spirit',
            'compilation': 'sprite'
        } as const;
        const actor_type = typeToActorType[type];
        if (!actor_type) return console.error('Shadowrun 5e | Call In Action Unknown actor type during creation');

        // TODO: Add translation for item names...
        const itemData: Item.CreateData = {
            name: `${game.i18n.localize('SR5.New')} ${Helpers.label(type)}`,
            type: 'call_in_action',
            system: { actor_type }
        };

        await this.actor.createEmbeddedDocuments('Item', [itemData], { renderSheet: true });
    }

    static async #openKarmaManager(this: SR5CharacterSheet, event) {
        const app = new KarmaManager(this.actor);
        await app.render(true);
    }

    static async #openNuyenManager(this: SR5CharacterSheet, event) {
        const app = new NuyenManager(this.actor);
        await app.render(true);
    }

    static async #openReputationManager(this: SR5CharacterSheet, event) {
        const app = new ReputationManager(this.actor);
        await app.render(true);
    }

}
