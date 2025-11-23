import { SR5 } from '@/module/config';

export const preloadHandlebarsTemplates = async () => {

    const templateBase = (path: string) => {
        return `systems/shadowrun5e/templates/v2/${path}.hbs`
    }

    const templateListItem = (...parts: string[]) => {
        return parts.reduce<string[]>(( items, p) => {
            items.push(templateBase(`list-items/${p}/header`));
            items.push(templateBase(`list-items/${p}/item`));
            return items;
        }, [])
    }

    const v2Path = (...paths: string[]) => {
        return paths.map(path => templateBase(path));
    }
    const v2AP = (...paths: string[]) => {
        return paths.map(path => templateBase(`actor/parts/${path}`));
    }

    const templatePaths = [
        // common templates
        ...v2Path(
            'common/document-source-icon',
            'common/horizontal-cells',
            'common/import-flag',
            'list-items/connect-network-icon',
            'list-items/connected-icons-toggle',
            'list-items/edit-delete-icons',
            'list-items/equip-icon',
            'list-items/favorite-icon',
            'list-items/header-add-icon',
            'list-items/move-item-icon',
            'list-items/item-quantity-col',
            'list-items/item-name',
            'list-items/item-rating-col',
            'list-items/item-roll-image',
            'list-items/matrix-condition-monitor',
            'list-items/matrix-icon-image',
            'list-items/open-source-icon',
            'list-items/toggle-expand-icon',
            'list-items/toggle-visible-icon',
            'list-items/wireless-icon',
            'item-properties/action',
            'item-properties/adept_power',
            'item-properties/ammo',
            'item-properties/armor',
            'item-properties/call_in_action',
            'item-properties/complex_form',
            'item-properties/contact',
            'item-properties/critter_power',
            'item-properties/device',
            'item-properties/essence',
            'item-properties/effect',
            'item-properties/lifestyle',
            'item-properties/quality',
            'item-properties/program',
            'item-properties/ritual',
            'item-properties/sin',
            'item-properties/spell',
            'item-properties/sprite_power',
            'item-properties/technology',
            'item-properties/weapon',
        ),
        ...v2AP(
            'attribute',
            'condition-monitor',
            'fake-attribute',
            'language-and-knowledge-skills',
            'limits',
            'matrix-attribute',
            'special-attributes',
        ),

        'systems/shadowrun5e/templates/rolls/parts/parts-list.hbs',
        'systems/shadowrun5e/templates/rolls/parts/Damage.hbs',

        // to wrap the bodies of tabs
        'systems/shadowrun5e/templates/common/TabWrapper.hbs',
        'systems/shadowrun5e/templates/common/ValueInput.hbs',

        // Useful wrapper and implemented components
        'systems/shadowrun5e/templates/common/ValueMaxAttribute.hbs',
        'systems/shadowrun5e/templates/common/Attribute.hbs',
        'systems/shadowrun5e/templates/common/ValueModifiers.hbs',

        // useful select template for the common pattern
        'systems/shadowrun5e/templates/common/Select.hbs',

        // to create the condition monitors and edge counter
        'systems/shadowrun5e/templates/common/HorizontalCellInput.hbs',

        // looks like a ListHeader
        'systems/shadowrun5e/templates/common/HeaderBlock.hbs',

        'systems/shadowrun5e/templates/common/NameLineBlock.hbs',

        // list components
        'systems/shadowrun5e/templates/common/List/ListItem.hbs',
        'systems/shadowrun5e/templates/common/List/ListEntityItem.hbs',
        'systems/shadowrun5e/templates/common/List/ListHeader.hbs',

        // dialogs
        'systems/shadowrun5e/templates/apps/dialogs/damage-application.hbs',
        'systems/shadowrun5e/templates/apps/dialogs/parts/success-test-common.hbs',
        'systems/shadowrun5e/templates/apps/dialogs/parts/success-test-documents.hbs',
        'systems/shadowrun5e/templates/apps/dialogs/parts/attack-range-dialog-fragment.hbs',

        // Test chat messages and their parts
        'systems/shadowrun5e/templates/rolls/success-test-message.hbs',
        'systems/shadowrun5e/templates/rolls/parts/rolled-dice.hbs',

        // Application - Compendium Browser
        'systems/shadowrun5e/templates/apps/compendium-browser/settings-folder.hbs',

        // Application - Situational Modifiers
        'systems/shadowrun5e/templates/apps/partials/modifiers-physical.hbs'
    ];

    for (const type of Object.keys(SR5.itemTypes)) {
        templatePaths.push(...templateListItem(type));
    }

    return foundry.applications.handlebars.loadTemplates(templatePaths);
};
