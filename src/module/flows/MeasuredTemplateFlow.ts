import { WeaponRangeMeasuredTemplate } from '../WeaponRangeMeasuredTemplate';
import { RangesTemplateType } from '../types/template/Weapon';

const RANGE_KEYS = ['short', 'medium', 'long', 'extreme'] as const;

export const hasValidWeaponRanges = (ranges: RangesTemplateType): boolean => {
    let previousDistance = 0;

    for (const key of RANGE_KEYS) {
        const distance = ranges[key].distance;
        if (!Number.isFinite(distance) || distance < previousDistance) return false;
        previousDistance = distance;
    }

    return previousDistance > 0;
};

/**
 * General handling of any MeasuredTemplate related system to Foundry intercation and creation of system
 * custo sub-classes of MeasuredTemplate.
 */
export const MeasuredTemplateFlow = {
    async showWeaponRanges(token: TokenDocument, ranges: RangesTemplateType): Promise<WeaponRangeMeasuredTemplate | undefined> {
        if (!canvas.ready || !canvas.scene || !canvas.templates) return;
        if (!hasValidWeaponRanges(ranges)) {
            ui.notifications?.warn('SR5.Warnings.InvalidWeaponRanges', { localize: true });
            return;
        }

        const position = token.object?.center;
        if (!position) {
            ui.notifications?.warn('SR5.TargetingNeedsActorWithToken', { localize: true });
            return;
        }
        const origin = { x: position.x, y: position.y };

        const templateData = {
            t: 'circle' as const,
            user: game.user?.id,
            direction: 0,
            x: 0,
            y: 0,
            fillColor: game.user?.color,
            distance: ranges.extreme.distance,
        };

        const documentClass = CONFIG.MeasuredTemplate.documentClass;
        // The core document provides bounds and refresh flags; this flow never persists it.
        // @ts-expect-error Foundry's generic document constructor does not infer source data here.
        const document = new documentClass(templateData, { parent: canvas.scene });
        const template = new WeaponRangeMeasuredTemplate(document, ranges);

        try {
            await template.drawAt(origin);
            return template;
        } catch (error) {
            if (error) console.error('Shadowrun 5e | Could not render weapon range preview', error);
            template.destroy();
        }
    },
};