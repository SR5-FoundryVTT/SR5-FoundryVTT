import { Helpers } from '../../helpers';
import { MatrixActorSheetData, SR5MatrixActorSheet } from '@/module/actor/sheets/SR5MatrixActorSheet';


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
    }

    static override PARTS = {
        ...super.PARTS,
        skills: {
            template: this.templateBase('actor/tabs/character-skills'),
            templates: [
                ...this.actorSystemParts('active-skills', 'language-and-knowledge-skills', 'attributes', 'special-attributes' ),
                ...this.listItem('skill')
            ]
        },
        magic: {
            template: this.templateBase('actor/tabs/magic'),
            templates: [
                ...this.actorSystemParts( 'spells', 'rituals', 'summonings', 'adept-powers'),
                ...this.listItem('spell', 'ritual', 'call_in_action', 'adept_power')
                ]
        },
        critter: {
            template: this.templateBase('actor/tabs/critter'),
            templates: this.listItem('critter_power')
        },
        inventory: {
            template: this.templateBase('actor/tabs/inventory'),
            templates: this.listItem('ammo', 'armor', 'bioware', 'cyberware', 'device', 'equipment', 'modification', 'weapon')
        },
        social: {
            template: this.templateBase('actor/tabs/social'),
            templates: this.listItem('sin', 'lifestyle', 'contact')
        },
        bio: {
            template: this.templateBase('actor/tabs/bio'),
            templates: [
                    ... this.actorSystemParts('metamagics', 'echoes'),
                    ...this.listItem('metamagic', 'echo', 'quality'),
                ]
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
    override async _onItemCreate(event) {
        event.preventDefault();
        const type = event.currentTarget.closest('.list-header').dataset.itemId;

        if (type !== 'summoning' && type !== 'compilation')
            return super._onItemCreate(event);

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

}
