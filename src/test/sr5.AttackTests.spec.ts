import { FireModeRules } from './../module/rules/FireModeRules';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SR5 } from '../module/config';

export const shadowrunAttackTesting = (context: QuenchBatchContext) => {
    const {describe, it, assert, before, after} = context;

    before(async () => {})
    after(async () => {})

    describe('Fire Mode Rules', () => {
        it('apply defense modifier per fire mode', () => {
            // Check no modifier
            assert.strictEqual(FireModeRules.fireModeDefenseModifier({
                label: "SR5.WeaponModeSingleShot",
                value: 1,
                recoil: false,
                defense: 0,
                suppression: false,
                action: 'simple',
                mode: 'single_shot'
            }), 0);
            // Check positive modifiers
            assert.strictEqual(FireModeRules.fireModeDefenseModifier({
                label: "SR5.WeaponModeSingleShot",
                value: 1,
                recoil: false,
                defense: 3,
                suppression: false,
                action: 'simple',
                mode: 'single_shot'
            }), 3);
            // Check correct negative modifiers
            assert.strictEqual(FireModeRules.fireModeDefenseModifier({
                label: "SR5.WeaponModeSingleShot",
                value: 1,
                recoil: false,
                defense: -3,
                suppression: false,
                action: 'simple',
                mode: 'single_shot'
            }), -3);
        })

        it('reduce defense modifier per firemode by ammo available', () => {
            // Check with enough ammo
            assert.strictEqual(FireModeRules.fireModeDefenseModifier({
                label: "SR5.WeaponModeSingleShot",
                value: 3,
                recoil: false,
                defense: -3,
                suppression: false,
                action: 'simple',
                mode: 'single_shot'
            }, 3), -3);

            // Check with to little ammo
            assert.strictEqual(FireModeRules.fireModeDefenseModifier({
                label: "SR5.WeaponModeSingleShot",
                value: 6,
                recoil: false,
                defense: -6,
                suppression: false,
                action: 'simple',
                mode: 'single_shot'
            }, 3), -3);
        })

        it('apply attack modifier per fire mode', () => {
            // A mode without recoil, shouldn't cause recoil modifiers.
            assert.deepEqual(FireModeRules.recoilAttackModifier({
                label: "SR5.WeaponModeBurstFireLong",
                value: 6,
                recoil: false,
                defense: -5,
                suppression: false,
                action: 'complex',
                mode: 'burst_fire',
            }, 0), {compensation: 0, recoilModifier: 0});
            
            // No compensation should cause full recoil modifier
            assert.deepEqual(FireModeRules.recoilAttackModifier({
                label: "SR5.WeaponModeBurstFireLong",
                value: 6,
                recoil: true,
                defense: -5,
                suppression: false,
                action: 'complex',
                mode: 'burst_fire',
            }, 0), {compensation: 0, recoilModifier: -6});

            // recoil modifier should be reduced by compensation,
            // compensation shouldbe reduced
            assert.deepEqual(FireModeRules.recoilAttackModifier({
                label: "SR5.WeaponModeBurstFireLong",
                value: 6,
                recoil: true,
                defense: -5,
                suppression: false,
                action: 'complex',
                mode: 'burst_fire',
            }, 3), {compensation: 0, recoilModifier: -3});

            // handle faulty value input gracefully, don't fire. Keep compensation.
            assert.deepEqual(FireModeRules.recoilAttackModifier({
                label: "SR5.WeaponModeBurstFireLong",
                value: -6,
                recoil: true,
                defense: -5,
                suppression: false,
                action: 'complex',
                mode: 'burst_fire',
            }, 3), {compensation: 3, recoilModifier: 0});
        })

        it('reduce the available fire modes', () => {            
            assert.lengthOf(FireModeRules.availableFireModes({
                single_shot: true,
                semi_auto: true,
                burst_fire: true,
                full_auto: true
            }), SR5.fireModes.length);

            assert.lengthOf(FireModeRules.availableFireModes({
                single_shot: true,
                semi_auto: false,
                burst_fire: false,
                full_auto: false
            }), 1); // per default rules only one single shot mode

            assert.lengthOf(FireModeRules.availableFireModes({
                single_shot: false,
                semi_auto: true,
                burst_fire: false,
                full_auto: false
            }), 2); // per default rules only one single shot mode

            assert.lengthOf(FireModeRules.availableFireModes({
                single_shot: false,
                semi_auto: false,
                burst_fire: true,
                full_auto: false
            }), 2); // per default rules only one single shot mode

            assert.lengthOf(FireModeRules.availableFireModes({
                single_shot: false,
                semi_auto: false,
                burst_fire: false,
                full_auto: true
            }), 3); // per default rules only one single shot mode
        })
    })
}