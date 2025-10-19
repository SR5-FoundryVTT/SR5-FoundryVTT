import { SR5ActiveEffect } from '../effect/SR5ActiveEffect';
import { SR5Item } from '../item/SR5Item';
import { SR5Actor } from '../actor/SR5Actor';
import { MatrixNetworkFlow } from '../item/flows/MatrixNetworkFlow';
import { SheetFlow } from '@/module/flows/SheetFlow';
import { ActorOwnershipFlow } from '@/module/actor/flows/ActorOwnershipFlow';

export const registerItemLineHelpers = () => {

    Handlebars.registerHelper('hasRoll', function (item: SR5Item, options) {
        return item?.hasRoll ?? false;
    });

    Handlebars.registerHelper('isBroken', function (item: SR5Item, options) {
        return item?.isMatrixDevice && item.isBroken;
    });

    Handlebars.registerHelper('canBeWireless', function (doc: SR5Item | SR5Actor, options) {
        if (doc instanceof SR5Item) return  doc.canBeWireless();
        if (doc instanceof SR5Actor) return doc.getMatrixDevice()?.canBeWireless() ?? false;
        return false;
    });

    Handlebars.registerHelper('isWireless', function (doc: SR5Item | SR5Actor, options) {
        if (doc instanceof SR5Item) return  doc.isWireless();
        if (doc instanceof SR5Actor) return doc.getMatrixDevice()?.isWireless() ?? false;
        return false;
    });

    Handlebars.registerHelper('isRunningSilent', function (item: SR5Item, options) {
        return item?.isRunningSilent() ?? false;
    });

    Handlebars.registerHelper('hasSource', function (item: SR5Item, options) {
        // todo figure out source for active effects and actors
        const source = (item instanceof SR5Item) ? item.getSource() ?? '' : ''
        return source !== '';
    });

    Handlebars.registerHelper('isOwner', function (item: SR5Item, options) {
        const owner = options.hash.owner;
        if (!owner || !(owner instanceof SR5Actor)) return false;
        return ActorOwnershipFlow._isOwnerOfItem(owner, item);
    });

    Handlebars.registerHelper('isMatrixAction', function (item: SR5Item, options) {
        return item.isType('action') && item.hasActionCategory('matrix');
    });

    Handlebars.registerHelper('isEquipped', function (item: SR5Item, options) {
        return item?.isEquipped();
    });

    Handlebars.registerHelper('isVisible', function (item: SR5Item | SR5ActiveEffect, options) {
        const actor = options?.data?.root?.actor;
        if (actor && item && actor instanceof SR5Actor) {
            return !actor.hiddenItems().has(item.uuid);
        }
        return true;
    });

    Handlebars.registerHelper('isFavorite', function (item: SR5Item, options) {
        const actor = options?.data?.root?.actor;
        if (actor && item && actor instanceof SR5Actor) {
            return actor.favorites().has(item.uuid);
        }
        return false;
    });

    Handlebars.registerHelper('marksRequired', function (item: SR5Item, options) {
        const neededMarks: number = item.getAction()?.category.matrix.marks ?? 0;
        const needed = neededMarks > 0 ? `${neededMarks}` : '';
        const owner = item.getAction()?.category.matrix.owner ? game.i18n.localize('SR5.Owner') : '';
        return new Handlebars.SafeString(needed || owner);
    });

    Handlebars.registerHelper('createItemHeaderLabel', function (type: string) {
        return new Handlebars.SafeString(SheetFlow._getCreateItemText(type));
    });

    Handlebars.registerHelper('effectDurationLabel', function (effect: SR5ActiveEffect) {
        const getDurationLabel = () => {
            if (effect.duration.seconds) return `${effect.duration.seconds}s`;
            if (effect.duration.rounds && effect.duration.turns) return `${effect.duration.rounds}r, ${effect.duration.turns}t`;
            if (effect.duration.rounds) return `${effect.duration.rounds}r`;
            if (effect.duration.turns) return `${effect.duration.turns}t`;

            return '';
        }
        return new Handlebars.SafeString(getDurationLabel());
    })

    Handlebars.registerHelper('isFreshImport', function (document, options) {
        if (!(document instanceof SR5Item)) return false;
        return document.system
    })

    Handlebars.registerHelper('usesAmmo', function (item, options) {
        if (!(item instanceof SR5Item)) return false;
        return item.usesAmmo();
    })

    Handlebars.registerHelper('equippedAmmo', function (item: SR5Item, options) {
        return item.getEquippedAmmo();
    })

    Handlebars.registerHelper('equippedMods', function (item: SR5Item, options) {
        return item.getEquippedMods();
    })

    Handlebars.registerHelper('ammoOptions', function (item: SR5Item, options) {
        return item.items.filter(i => i.isType('ammo')).map(i => ({ label: i.name, value: i.id }));
    })

    Handlebars.registerHelper('hasAmmo', function (item: SR5Item, options) {
        return item.items.filter(i => i.isType('ammo')).length > 0;
    })

    Handlebars.registerHelper('matrixIconType', function (icon: SR5Item | SR5Actor, options) {
        return game.i18n.localize(MatrixNetworkFlow.getDocumentType(icon));
    })

    Handlebars.registerHelper('hasConnectedIcons', function (target: Shadowrun.MatrixTargetDocument, options) {
        return (target.document instanceof SR5Actor && target.document.hasWirelessDevices());
    })
};
