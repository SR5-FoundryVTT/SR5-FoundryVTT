export const preloadHandlebarsTemplates = async () => {
    const v2Path = (...paths: string[]) => {
        return paths.map(path => `systems/shadowrun5e/dist/templates/v2/${path}.hbs`);
    }
    const v2AP = (...paths: string[]) => {
        return paths.map(path => `systems/shadowrun5e/dist/templates/v2/actor/parts/${path}.hbs`);
    }

    const templatePaths = [
        // common templates
        ...v2Path(
            'common/header-block',
            'common/horizontal-cells',
            'common/list-header',
            'common/list-item',
            'common/name-line-block',
            'common/profile-image',
            'common/select',
            'common/value-modifiers',
            'common/value-input'
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
        // item tabs
        'systems/shadowrun5e/dist/templates/item/tabs/GridNetworkTab.hbs',
        'systems/shadowrun5e/dist/templates/item/tabs/GridDescriptionTab.hbs',
        'systems/shadowrun5e/dist/templates/item/tabs/DescriptionTab.hbs',
        'systems/shadowrun5e/dist/templates/item/tabs/ActionTab.hbs',
        'systems/shadowrun5e/dist/templates/item/tabs/MiscellaneousTab.hbs',
        'systems/shadowrun5e/dist/templates/item/tabs/NetworksTab.hbs',

        // limited actor
        'systems/shadowrun5e/dist/templates/actor-limited/character.hbs',
        'systems/shadowrun5e/dist/templates/actor-limited/spirit.hbs',
        'systems/shadowrun5e/dist/templates/actor-limited/sprite.hbs',
        'systems/shadowrun5e/dist/templates/actor-limited/vehicle.hbs',
        'systems/shadowrun5e/dist/templates/actor-limited/critter.hbs',
        'systems/shadowrun5e/dist/templates/actor-limited/parts/Header.hbs',
        'systems/shadowrun5e/dist/templates/actor-limited/parts/MiscCharacter.hbs',
        'systems/shadowrun5e/dist/templates/actor-limited/parts/MiscSpirit.hbs',
        'systems/shadowrun5e/dist/templates/actor-limited/parts/MiscSprite.hbs',
        'systems/shadowrun5e/dist/templates/actor-limited/parts/MiscIc.hbs',
        'systems/shadowrun5e/dist/templates/actor-limited/parts/MiscVehicle.hbs',
        'systems/shadowrun5e/dist/templates/actor-limited/parts/MiscCritter.hbs',


        // item parts
        'systems/shadowrun5e/dist/templates/item/parts/description.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/technology.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/header.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/weapon-ammo-list.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/weapon-mods-list.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/action.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/modifier.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/network.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/damage.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/opposed.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/spell.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/complex_form.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/weapon.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/armor.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/matrix.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/sin.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/contact.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/lifestyle.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/ammo.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/modification.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/program.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/critter_power.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/sprite_power.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/summoning.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/compilation.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/ritual.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/misc_matrix.hbs',

        'systems/shadowrun5e/dist/templates/rolls/parts/parts-list.hbs',
        'systems/shadowrun5e/dist/templates/rolls/parts/Damage.hbs',

        // to wrap the bodies of tabs
        'systems/shadowrun5e/dist/templates/common/TabWrapper.hbs',
        'systems/shadowrun5e/dist/templates/common/ValueInput.hbs',

        // Useful wrapper and implemented components
        'systems/shadowrun5e/dist/templates/common/ValueMaxAttribute.hbs',
        'systems/shadowrun5e/dist/templates/common/Attribute.hbs',
        'systems/shadowrun5e/dist/templates/common/ValueModifiers.hbs',

        // useful select template for the common pattern
        'systems/shadowrun5e/dist/templates/common/Select.hbs',

        // to create the condition monitors and edge counter
        'systems/shadowrun5e/dist/templates/common/HorizontalCellInput.hbs',

        // looks like a ListHeader
        'systems/shadowrun5e/dist/templates/common/HeaderBlock.hbs',

        'systems/shadowrun5e/dist/templates/common/NameLineBlock.hbs',

        // list components
        'systems/shadowrun5e/dist/templates/common/List/ListItem.hbs',
        'systems/shadowrun5e/dist/templates/common/List/ListEntityItem.hbs',
        'systems/shadowrun5e/dist/templates/common/List/ListHeader.hbs',

        // dialogs
        'systems/shadowrun5e/dist/templates/apps/dialogs/damage-application.hbs',
        'systems/shadowrun5e/dist/templates/apps/dialogs/parts/success-test-common.hbs',
        'systems/shadowrun5e/dist/templates/apps/dialogs/parts/success-test-documents.hbs',
        'systems/shadowrun5e/dist/templates/apps/dialogs/parts/attack-range-dialog-fragment.hbs',

        // Test chat messages and their parts
        'systems/shadowrun5e/dist/templates/rolls/success-test-message.hbs',
        'systems/shadowrun5e/dist/templates/rolls/parts/rolled-dice.hbs',

        // Modifier management parts
        'systems/shadowrun5e/dist/templates/apps/partials/modifiers-physical.hbs',

        // Application - Matrix Network Hacking
        'systems/shadowrun5e/dist/templates/apps/matrix-network-hacking/tabs/networks.hbs',
    ];

    return foundry.applications.handlebars.loadTemplates(templatePaths);
};
