import { Helpers } from '../../helpers';
import { MatrixActorSheetData, SR5MatrixActorSheet } from '@/module/actor/sheets/SR5MatrixActorSheet';
import { SheetFlow } from '@/module/flows/SheetFlow';


export interface CharacterSheetData extends MatrixActorSheetData {
    awakened: boolean
    emerged: boolean
    woundTolerance: number
    handledItemTypes: string[]
    inventory: Record<string, any>
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
    override getHandledItemTypes(): string[] {
        const itemTypes = super.getHandledItemTypes();

        return [
            ...itemTypes,
            'program',
            'sin',
            'lifestyle',
            'contact',
            'spell',
            'ritual_spells',
            'adept_power',
            'complex_form',
            'quality',
            'echo',
            'metamagic',
            'critter_power',
            'call_in_action',
            'ritual'
        ];
    }

    static override TABS = {
        ...super.TABS,
        primary: {
            initial: 'skills',
            tabs: [
                { id: 'actions', label: 'Actions', cssClass: '' },
                { id: 'skills', label: 'Skills', cssClass: '' },
                { id: 'inventory', label: 'Inventory', cssClass: '' },
                { id: 'critter', label: 'Critter', cssClass: '' },
                { id: 'magic', label: 'Magic', cssClass: '' },
                { id: 'matrix', label: 'Matrix', cssClass: '' },
                { id: 'social', label: 'Social', cssClass: '' },
                { id: 'bio', label: 'Bio', cssClass: '' },
                { id: 'effects', label: 'Effects', cssClass: '' },
                { id: 'misc', label: 'Misc', cssClass: '' },
            ]
        },
        matrixRight: {
            initial: 'matrixActions',
            tabs: [
                { id: 'matrixActions', label: 'Actions', cssClass: '', },
                { id: 'complexForms', label: 'ComplexForms', cssClass: '', },
                { id: 'compilations', label: 'Compilations', cssClass: '', }
            ]
        }
    }

    _hasCritterPowers() {
        return this.actor.items.filter(item => item.type === 'critter_power').length > 0;
    }

    protected override _prepareTabs(group: string) {
        const retVal = super._prepareTabs(group);
        if (group === 'primary') {
            if (!this._hasCritterPowers()) {
                delete retVal['critter'];
            }
            if (!this.actor.isAwakened()) {
                delete retVal['magic'];
            }
        }
        if (group === 'matrixRight') {
            if (!this.actor.isEmerged()) {
                delete retVal['complexForms'];
                delete retVal['compilations'];
            }
        }
        return retVal;
    }

    protected override _configureRenderParts(options) {
        const retVal = super._configureRenderParts(options);
        if (!this._hasCritterPowers()) {
            delete retVal['critter'];
        }
        if (!this.actor.isAwakened()) {
            delete retVal['magic'];
        }
        if (!this.actor.isEmerged()) {
            delete retVal['complexForms'];
            delete retVal['compilations'];
        }
        return retVal;
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
                ...SheetFlow.templateListItem('spell', 'ritual', 'call_in_action', 'adept_power')
                ],
            scrollable: ['.scrollable']
        },
        complexForms: {
            template: SheetFlow.templateBase('actor/tabs/matrix/complex-forms'),
            templates: SheetFlow.templateListItem('complex_form'),
            scrollable: ['.scrollable']
        },
        compilations: {
            template: SheetFlow.templateBase('actor/tabs/matrix/compilations'),
            templates: SheetFlow.templateListItem('call_in_action'),
            scrollable: ['.scrollable']
        },
        critter: {
            template: SheetFlow.templateBase('actor/tabs/critter'),
            templates: SheetFlow.templateListItem('critter_power'),
            scrollable: ['.scrollable']
        },
        inventory: {
            template: SheetFlow.templateBase('actor/tabs/inventory'),
            templates: SheetFlow.templateListItem('ammo', 'armor', 'bioware', 'cyberware', 'device', 'equipment', 'modification', 'weapon'),
            scrollable: ['.scrollable']
        },
        social: {
            template: SheetFlow.templateBase('actor/tabs/social'),
            templates: SheetFlow.templateListItem('sin', 'lifestyle', 'contact'),
            scrollable: ['.scrollable']
        },
        bio: {
            template: SheetFlow.templateBase('actor/tabs/bio'),
            templates: [
                    ...SheetFlow.templateActorSystemParts('metamagics', 'echoes'),
                    ...SheetFlow.templateListItem('metamagic', 'echo', 'quality'),
                ],
            scrollable: ['.scrollable']
        },
    }

    /**
     * Character actors will always show these item types.
     *
     * For more info see into super.getInventoryItemTypes jsdoc.
     *
     * @returns An array of item types from the template.json Item section.
     */
    override getInventoryItemTypes(): string[] {
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

    /**
     * Inject special case handling for call in action items, only usable by character actors.
     */
    static async #createItem(this: SR5CharacterSheet, event) {
        const type = event.target.dataset.itemType;
        if (type !== 'summoning' && type !== 'compilation') return;
        event.preventDefault();

        return this._onCallInActionCreate(type);
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

    protected override async _renderHTML(content, options) {
        const parts = await super._renderHTML(content, options);
        const matrixRightSideContent = parts.matrix.querySelector("section.content.matrix-right-tab-content");
        if (matrixRightSideContent) {
            this.moveTabs(SR5CharacterSheet.TABS.matrixRight.tabs, parts, matrixRightSideContent);
        }

        return parts;
    }

}
