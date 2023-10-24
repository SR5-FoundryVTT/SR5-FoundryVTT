import { FireModeRules } from '../module/rules/FireModeRules';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SR5 } from '../module/config';
import { SR5TestingDocuments } from './utils';
import { SR5Actor } from '../module/actor/SR5Actor';
import { SR5Item } from '../module/item/SR5Item';
import { DataDefaults } from '../module/data/DataDefaults';
import { CombatRules } from '../module/rules/CombatRules';

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
            assert.strictEqual(FireModeRules.recoilModifierAfterAttack({
                label: "SR5.WeaponModeBurstFireLong",
                value: 6,
                recoil: false,
                defense: -5,
                suppression: false,
                action: 'complex',
                mode: 'burst_fire',
            }, 0), 0);
            
            // No compensation should cause full recoil modifier
            assert.strictEqual(FireModeRules.recoilModifierAfterAttack({
                label: "SR5.WeaponModeBurstFireLong",
                value: 6,
                recoil: true,
                defense: -5,
                suppression: false,
                action: 'complex',
                mode: 'burst_fire',
            }, 0), -6);

            // recoil modifier should be reduced by compensation,
            // compensation shouldbe reduced
            assert.strictEqual(FireModeRules.recoilModifierAfterAttack({
                label: "SR5.WeaponModeBurstFireLong",
                value: 6,
                recoil: true,
                defense: -5,
                suppression: false,
                action: 'complex',
                mode: 'burst_fire',
            }, 3), -3);

            // handle faulty value input gracefully, don't fire. Keep compensation.
            assert.strictEqual(FireModeRules.recoilModifierAfterAttack({
                label: "SR5.WeaponModeBurstFireLong",
                value: -6,
                recoil: true,
                defense: -5,
                suppression: false,
                action: 'complex',
                mode: 'burst_fire',
            }, 3), 0);
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

    describe('CombatRules', () => {
        let testActor;
        let testItem;
        let testScene;

        before(async () => {
            testActor = new SR5TestingDocuments(SR5Actor);
            testItem = new SR5TestingDocuments(SR5Item);
            testScene = new SR5TestingDocuments(Scene);
        });

        describe("isBlockedByVehicleArmor", () => {
            it('blocks damage due to vehicle armor', async () => {
                const armor = DataDefaults.actorArmorData({
                    value: 50,
                    base: 50,
                });
                const vehicle = await testActor.create({
                    type: 'vehicle', system: {
                        armor,
                    },
                }) as SR5Actor;
                const damage = DataDefaults.damageData({
                    type: {
                        value: 'physical',
                        base: 'physical',
                    },
                    value: 4,
                    base: 4,
                });

                const result = CombatRules.isBlockedByVehicleArmor(damage, 5, 2, vehicle);

                assert.isTrue(result);
            });

            it("doesn't block damage for non-vehicle actors", async () => {
                const vehicleArmor = DataDefaults.actorArmorData({
                    value: 50,
                    base: 50,
                });
                const vehicleActor = await testActor.create({
                    type: 'vehicle', system: {
                        armor: vehicleArmor,
                    },
                }) as SR5Actor;

                const characterActor = await testActor.create({
                    type: 'character',
                }) as SR5Actor;
                await characterActor.createEmbeddedDocuments('Item',  [{
                    type: 'armor',
                    name: 'Test Armor',
                    system: {
                        armor: {
                            base: 50,
                            value: 50,
                        },
                        technology: DataDefaults.technologyData({
                            equipped: true,
                        })
                    }
                }]);

                const damage = DataDefaults.damageData({
                    type: {
                        value: 'physical',
                        base: 'physical',
                    },
                    value: 4,
                    base: 4,
                });

                const characterResult = CombatRules.isBlockedByVehicleArmor(damage, 5, 2, characterActor);
                const vehicleResult = CombatRules.isBlockedByVehicleArmor(damage, 5, 2, vehicleActor);

                assert.isFalse(characterResult);
                assert.isTrue(vehicleResult);
            });

            it("takes net hits into account", async () => {
                const armor = DataDefaults.actorArmorData({
                    value: 6,
                    base: 6,
                });
                const vehicle = await testActor.create({
                    type: 'vehicle', system: {
                        armor,
                    },
                }) as SR5Actor;
                const damage = DataDefaults.damageData({
                    type: {
                        value: 'physical',
                        base: 'physical',
                    },
                    value: 4,
                    base: 4,
                });

                const blockedResult = CombatRules.isBlockedByVehicleArmor(damage, 5, 4, vehicle);
                const notBlockedResult = CombatRules.isBlockedByVehicleArmor(damage, 5, 3, vehicle);

                assert.isTrue(blockedResult);
                assert.isFalse(notBlockedResult);
            });

            it("takes AP into account", async () => {
                const armor = DataDefaults.actorArmorData({
                    value: 6,
                    base: 6,
                });
                const vehicle = await testActor.create({
                    type: 'vehicle', system: {
                        armor,
                    },
                }) as SR5Actor;
                // This is "high" AP but a negative number, just go with it
                const highApDamage = DataDefaults.damageData({
                    type: {
                        value: 'physical',
                        base: 'physical',
                    },
                    value: 4,
                    base: 4,
                    ap: {
                        base: -5,
                        value: -5,
                    }
                });
                const lowApDamage = DataDefaults.damageData({
                    type: {
                        value: 'physical',
                        base: 'physical',
                    },
                    value: 4,
                    base: 4,
                    ap: {
                        base: 5,
                        value: 5,
                    }
                });

                const blockedResult = CombatRules.isBlockedByVehicleArmor(lowApDamage, 5, 3, vehicle);
                const notBlockedResult = CombatRules.isBlockedByVehicleArmor(highApDamage, 5, 3, vehicle);

                assert.isTrue(blockedResult);
                assert.isFalse(notBlockedResult);
            });
        });

        describe("doesNoPhysicalDamageToVehicle", () => {
            it("blocks non-physical damage to vehicle", async () => {
                const vehicle = await testActor.create({ type: 'vehicle' }) as SR5Actor;
                const damage = DataDefaults.damageData({
                    type: {
                        value: 'stun',
                        base: 'stun',
                    },
                    value: 4,
                    base: 4,
                });

                const result = CombatRules.doesNoPhysicalDamageToVehicle(damage, vehicle);

                assert.isTrue(result);
            });

            it("does not block physical damage to vehicle", async () => {
                const vehicle = await testActor.create({ type: 'vehicle' }) as SR5Actor;
                const damage = DataDefaults.damageData({
                    type: {
                        value: 'physical',
                        base: 'physical',
                    },
                    value: 4,
                    base: 4,
                });

                const result = CombatRules.doesNoPhysicalDamageToVehicle(damage, vehicle);

                assert.isFalse(result);
            });

            it("does not block electric stun damage to vehicle", async () => {
                const vehicle = await testActor.create({ type: 'vehicle' }) as SR5Actor;
                const damage = DataDefaults.damageData({
                    type: {
                        value: 'stun',
                        base: 'stun',
                    },
                    element: {
                        base: 'electricity',
                        value: 'electricity',
                    },
                    value: 4,
                    base: 4,
                });

                const result = CombatRules.doesNoPhysicalDamageToVehicle(damage, vehicle);

                assert.isFalse(result);
            });
        });
    });
};