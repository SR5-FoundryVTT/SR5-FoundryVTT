import { LENGTH_UNIT, SR, SYSTEM_NAME } from '../constants';
import { Helpers } from '../helpers';
import { SR5 } from '../config';
import { RangedWeaponRules } from './RangedWeaponRules';
import { DataDefaults } from '../data/DataDefaults';
import { PartsList } from '../parts/PartsList';
import { DocumentSituationModifiers } from './DocumentSituationModifiers';
import { SuccessTest, SuccessTestData } from '../tests/SuccessTest';
import RangeData = Shadowrun.RangeData;
import WeaponItemData = Shadowrun.WeaponItemData;

export interface WeaponRangeTestDataFragment {
    damage: Shadowrun.DamageData
    ranges: Shadowrun.RangesTemplateData
    range: number
    targetRanges: Shadowrun.TargetRangeTemplateData[]
    // index of selected target range in targetRanges
    targetRangesSelected: number
    // keep track of last target selected, so it can reset range if changed
    lastTargetSelected: number
}

type WeaponRangeTest = SuccessTest<WeaponRangeTestDataFragment & SuccessTestData>

// Experimental - the idea of a test behavior is that it can be applied to multiple different types of tests
// without having to be a base class of both tests. This paradigm, if implemented correctly,
// should help prevent duplication of common behaviors across different tests
export class WeaponRangeTestBehavior {
    static prepareData(test: WeaponRangeTest, data: any) {
        data.ranges = {};
        data.range = 0;
        data.targetRanges = [];
        data.lastTargetSelected = -1;
        data.targetRangesSelected = 0;
        data.damage = data.damage || DataDefaults.damageData();
    }

    /**
     * Weapon range selection depends on the weapon alone.
     *
     * In case of selected targets, test will be overwritten.
     *
     */
    private static prepareWeaponRanges(test: WeaponRangeTest, rangesAccessor: (weapon: WeaponItemData) => RangeData) {
        // Don't let missing weapon ranges break test.
        const weapon = test.item?.asWeapon;
        if (!weapon) return;

        // Transform weapon ranges to something usable
        const ranges = rangesAccessor(weapon);
        const {range_modifiers} = SR.combat.environmental;
        const newRanges = {} as Shadowrun.RangesTemplateData;

        for (const key of ["short", "medium", "long", "extreme"] as const) {
            const rangeValue = ranges[key];
            const distance = (test.actor && !!ranges.attribute) ?
                test.actor.getAttribute(ranges.attribute).value * rangeValue :
                rangeValue;
            newRanges[key] = Helpers.createRangeDescription(SR5.weaponRanges[key], distance, range_modifiers[key]);
        }
        test.data.ranges = newRanges;

        // Get currently active range modifier.
        const actor = test.actor;
        if (!actor) return;

        const modifiers = actor.getSituationModifiers();
        // Provide test context to allow effects to limit application.
        modifiers.environmental.apply({test});
        // If no range is active, set to zero.
        test.data.range = modifiers.environmental.applied.active.range || 0;
    }

    /**
     * Actual target range between attack and target.
     *
     * This will overwrite the default weapon range selection.
     */
    private static prepareTargetRanges(test: WeaponRangeTest) {
        //@ts-expect-error // TODO: foundry-vtt-types v10
        if (foundry.utils.isEmpty(test.data.ranges)) return;
        if (!test.actor) return;
        if (!test.hasTargets) return;

        const attacker = test.actor.getToken();

        if (!attacker) {
            ui.notifications?.warn(game.i18n.localize('SR5.TargetingNeedsActorWithToken'));
            return [];
        }

        // Build target ranges for template display.
        test.data.targetRanges = test.targets.map(token => {
            const distance = Helpers.measureTokenDistance(attacker, token);
            const range = RangedWeaponRules.getRangeForTargetDistance(distance, test.data.ranges);
            return {
                tokenUuid: token.uuid,
                name: token.name || '',
                unit: LENGTH_UNIT,
                range,
                distance,
            };
        });

        // Sort targets by ascending distance from attacker.
        test.data.targetRanges = test.data.targetRanges.sort((a, b) => {
            if (a.distance < b.distance) return -1;
            if (a.distance > b.distance) return 1;
            return 0;
        });

        // if no range is active, set to first target selected.
        const modifiers = test.actor.getSituationModifiers();
        // Provide test context to allow effects to limit application.
        modifiers.environmental.apply({test});
        test.data.range = modifiers.environmental.applied.active.range || test.data.targetRanges[0].range.modifier;
    }

    static prepareDocumentData(test:WeaponRangeTest, rangesAccessor: (weapon: WeaponItemData) => RangeData){
        WeaponRangeTestBehavior.prepareWeaponRanges(test, rangesAccessor);
        WeaponRangeTestBehavior.prepareTargetRanges(test);
    }

    /**
     * Save selections made back to documents.
     * @returns
     */
    static async saveUserSelectionAfterDialog(test: WeaponRangeTest) {
        if (!test.actor) return;
        if (!test.item) return;

        // Save range selection
        const modifiers = test.actor.getSituationModifiers();
        modifiers.environmental.setActive('range', test.data.range);
        await test.actor.setSituationModifiers(modifiers);
    }

    /**
     * Apply test selections made by user in dialog.
     * @returns
     */
    static prepareBaseValues(test: WeaponRangeTest) {
        if (!test.actor) return;
        if (!test.item) return;

        // Get range modifier from selected target instead of selected range.
        if (test.hasTargets) {
            // Cast select options string to integer index.
            test.data.targetRangesSelected = Number(test.data.targetRangesSelected);
            const target = test.data.targetRanges[test.data.targetRangesSelected];

            if (test.data.lastTargetSelected !== test.data.targetRangesSelected)
                test.data.range = target.range.modifier;

            test.data.lastTargetSelected = test.data.targetRangesSelected;

            // Reduce all targets selected down to the actual target fired upon.
            const token = fromUuidSync(target.tokenUuid) as TokenDocument;
            if (!(token instanceof TokenDocument)) return console.error(`Shadowrun 5e | ${test.type} got a target that is no TokenDocument`, token);
            if (!token.actor) return console.error(`Shadowrun 5e | ${test.type} got a token that has no actor`, token);
            test.data.targetActorsUuid = [token.actor.uuid];
            test.targets = [token];
        }

        // Alter test data for range.
        test.data.range = Number(test.data.range);
    }

    /**
     * Ranged attack tests allow for temporarily changing of modifiers without altering the document.
     */
    static prepareTestModifiers(test: WeaponRangeTest) {
        WeaponRangeTestBehavior.prepareEnvironmentalModifier(test);
    }

    private static prepareEnvironmentalModifier(test: WeaponRangeTest) {
        if (!test.actor) return;

        const poolMods = new PartsList(test.data.modifiers.mod);

        // Apply altered environmental modifiers
        const range = test.hasTargets ? test.data.targetRanges[test.data.targetRangesSelected].range.modifier : test.data.range;
        const modifiers = DocumentSituationModifiers.getDocumentModifiers(test.actor);

        // Locally set env modifier temporarily.
        modifiers.environmental.setActive('range', Number(range));
        modifiers.environmental.apply({reapply: true, test});

        poolMods.addUniquePart(SR5.modifierTypes.environmental, modifiers.environmental.total);
    }

    static async processResults(test: WeaponRangeTest) {
        await WeaponRangeTestBehavior.markActionPhaseAsAttackUsed(test);
    }

    private static async markActionPhaseAsAttackUsed(test: WeaponRangeTest) {
        if (!test.actor! || !test.actor.combatActive) return;

        const combatant = test.actor.combatant;
        if (!combatant) return;

        await combatant.setFlag(SYSTEM_NAME, 'turnsSinceLastAttack', 0);
    }
}