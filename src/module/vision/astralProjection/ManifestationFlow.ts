import type { SR5Actor } from '@/module/actor/SR5Actor';
import { isAstralForm } from './AstralProjectionState';
import { isManifesting, isMaterialized, MANIFEST_STATUS, MATERIALIZE_STATUS } from './ManifestationState';

/**
 * Let astral beings show themselves on the physical plane.
 *
 * - Manifesting (SR5#314): a spirit or a projecting magician appears as a ghostly image that people see and
 *   hear, but technology can't detect. A projecting magician can only manifest for Magic x 5 minutes per
 *   projection, which isn't tracked.
 * - Materializing (SR5#303): a spirit takes a physical, dual-natured body.
 *
 * Both are statuses on the actor. A form shares its body's actor, but only the form is affected, see
 * getPhysicalPresence.
 */
export class ManifestationFlow {
    static canManifest(token: TokenDocument) {
        return isAstralForm(token) || token.actor?.type === 'spirit';
    }

    static canMaterialize(token: TokenDocument) {
        return token.actor?.type === 'spirit';
    }

    static isManifesting(token: TokenDocument) {
        return isManifesting(token.actor);
    }

    static isMaterialized(token: TokenDocument) {
        return isMaterialized(token.actor);
    }

    /** @returns Whether the token's actor is manifesting afterwards. */
    static async toggleManifest(token: TokenDocument) {
        if (!this.canManifest(token)) {
            ui.notifications.warn(game.i18n.localize('SR5.Vision.CannotManifest'));
            return this.isManifesting(token);
        }
        return this.toggle(token, MANIFEST_STATUS, MATERIALIZE_STATUS);
    }

    /** @returns Whether the token's actor is materialized afterwards. */
    static async toggleMaterialize(token: TokenDocument) {
        if (!this.canMaterialize(token)) {
            ui.notifications.warn(game.i18n.localize('SR5.Vision.CannotMaterialize'));
            return this.isMaterialized(token);
        }
        return this.toggle(token, MATERIALIZE_STATUS, MANIFEST_STATUS);
    }

    /** A being is either manifesting or materialized, so switching one on switches the other off. */
    private static async toggle(token: TokenDocument, status: string, exclusive: string) {
        const actor = token.actor as SR5Actor | null;
        if (!actor?.isOwner) {
            ui.notifications.warn(game.i18n.localize('SR5.Vision.CannotControlAstralState'));
            return !!actor?.statuses.has(status);
        }
        const active = !actor.statuses.has(status);
        if (active && actor.statuses.has(exclusive)) await actor.toggleStatusEffect(exclusive, { active: false });
        await actor.toggleStatusEffect(status, { active });
        return active;
    }
}
