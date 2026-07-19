import { SR5 } from '../module/config';
import { SR5TestFactory } from './utils';
import { SR5Actor } from '../module/actor/SR5Actor';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { CombatRules } from '../module/rules/CombatRules';
import { DataDefaults } from '../module/data/DataDefaults';
import { FireModeRules } from '../module/rules/FireModeRules';
import { TestCreator } from '../module/tests/TestCreator';
import { PhysicalDefenseTest } from '../module/tests/PhysicalDefenseTest';
import { DamageType, DamageTypeType } from 'src/module/types/item/Action';
type DamageElementType = DamageType['element']['base'];

export const shadowrunAttackTesting = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { await factory.destroy(); });

    describe('Fire Mode Rules', () => {
        it('apply defense modifier per fire mode', () => {
            // Check no modifier
            assert.strictEqual(FireModeRules.fireModeDefenseModifier({
                label: "SR5.Weapon.Mode.Full.SingleShot",
                value: 1,
                recoil: false,
                defense: 0,
                suppression: false,
                action: 'simple',
                mode: 'single_shot'
            }), 0);
            // Check positive modifiers
            assert.strictEqual(FireModeRules.fireModeDefenseModifier({
                label: "SR5.Weapon.Mode.Full.SingleShot",
                value: 1,
                recoil: false,
                defense: 3,
                suppression: false,
                action: 'simple',
                mode: 'single_shot'
            }), 3);
            // Check correct negative modifiers
            assert.strictEqual(FireModeRules.fireModeDefenseModifier({
                label: "SR5.Weapon.Mode.Full.SingleShot",
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
                label: "SR5.Weapon.Mode.Full.SingleShot",
                value: 3,
                recoil: false,
                defense: -3,
                suppression: false,
                action: 'simple',
                mode: 'single_shot'
            }, 3), -3);

            // Check with to little ammo
            assert.strictEqual(FireModeRules.fireModeDefenseModifier({
                label: "SR5.Weapon.Mode.Full.SingleShot",
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
                label: "SR5.Weapon.Mode.Full.BurstFireLong",
                value: 6,
                recoil: false,
                defense: -5,
                suppression: false,
                action: 'complex',
                mode: 'burst_fire',
            }, 0), 0);
            
            // No compensation should cause full recoil modifier
            assert.strictEqual(FireModeRules.recoilModifierAfterAttack({
                label: "SR5.Weapon.Mode.Full.BurstFireLong",
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
                label: "SR5.Weapon.Mode.Full.BurstFireLong",
                value: 6,
                recoil: true,
                defense: -5,
                suppression: false,
                action: 'complex',
                mode: 'burst_fire',
            }, 3), -3);

            // handle faulty value input gracefully, don't fire. Keep compensation.
            assert.strictEqual(FireModeRules.recoilModifierAfterAttack({
                label: "SR5.Weapon.Mode.Full.BurstFireLong",
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

    describe('PhysicalDefenseTest', () => {
        it('includes defender reach from Active Effects in melee defense reach modifiers', async () => {
            const attacker = await factory.createActor({ type: 'character' });
            const defender = await factory.createActor({ type: 'character' });
            const [weapon] = await attacker.createEmbeddedDocuments('Item', [{
                name: 'Attack Weapon',
                type: 'weapon',
                system: {
                    category: 'melee',
                    melee: { reach: 0 },
                    action: {
                        test: 'MeleeAttackTest',
                        opposed: { test: 'PhysicalDefenseTest' },
                    },
                    technology: { equipped: true },
                },
            }]);

            await defender.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Reach Effect',
                changes: [{ key: 'system.modifiers.reach', value: '1', mode: CONST.ACTIVE_EFFECT_MODES.ADD }],
            }]);

            const attackTest = await TestCreator.fromItem(weapon, attacker, { showDialog: false, showMessage: false });
            if (!attackTest) return assert.fail('Failed to create melee attack test');
            await attackTest._prepareExecution();

            const defenseData = await PhysicalDefenseTest._getOpposedActionTestData(attackTest.data, defender, '');
            if (!defenseData) return assert.fail('Failed to create physical defense test data');

            const defenseTest = new PhysicalDefenseTest(defenseData, { actor: defender, source: defender }, { showDialog: false, showMessage: false });
            await defenseTest._prepareExecution();

            const reachModifier = defenseTest.pool.changes.find(change => change.name === 'SR5.Weapon.Reach');

            assert.strictEqual(defender.system.modifiers.reach, 1);
            assert.strictEqual(defenseTest.data.defenseReach, 1);
            assert.strictEqual(reachModifier?.value, 1);
        });
    });

    describe('CombatRules', () => {
        const getCharacterWithArmor = async (armorValue: number, {
            hardened = false
        }: {
            hardened?: boolean
        } = {}): Promise<SR5Actor> => {
            const characterActor = await factory.createActor({ type: 'character' });
            const armor = await factory.createItem({
                type: 'armor',
                system: {
                    armor: {
                        base: armorValue,
                        is_hardened: hardened,
                        accessory: false,
                    },
                    technology: {
                        equipped: true,
                    }
                }
            });
            await characterActor.createEmbeddedDocuments('Item',  [armor]);
            return characterActor;
        }

        const getVehicleWithArmor = async (armorValue: number): Promise<SR5Actor> => {
            const armor = DataDefaults.createData('armor', { rating: { value: armorValue, base: armorValue } });
            return factory.createActor({ type: 'vehicle', system: { armor } });
        }

        const getDamage = (
            damageValue: number,
            {
                type = "physical",
                ap = 0,
                element,
                normal_weapon = false
            }: {
                type?: DamageTypeType,
                ap?: number,
                element?: DamageElementType,
                normal_weapon?: boolean
            } = {}
        ): DamageType => {
            return DataDefaults.createData('damage', {
                type: {
                    value: type,
                    base: type,
                },
                value: damageValue,
                base: damageValue,
                normal_weapon,
                ...(ap && {
                    ap: {
                        base: ap,
                        value: ap,
                    }
                }),
                ...(element && {
                    element: {
                        base: element,
                        value: element,
                    }
                }),
            });
        }

        const getCharacterWithImmunities = async (
            armorValue: number,
            immunities: (keyof typeof SR5.armorImmunityTypes)[]
        ): Promise<SR5Actor> => {
            const characterActor = await factory.createActor({ type: 'character' });
            const armor = await factory.createItem({
                type: 'armor',
                system: {
                    armor: {
                        base: armorValue,
                        is_hardened: false,
                        accessory: false,
                        immunities: {
                            base: immunities,
                            value: immunities,
                        },
                    },
                    technology: {
                        equipped: true,
                    }
                }
            });
            await characterActor.createEmbeddedDocuments('Item', [armor]);
            return characterActor;
        }

        const getCharacterWithSplitArmorAndImmunity = async (): Promise<SR5Actor> => {
            const characterActor = await factory.createActor({ type: 'character' });
            await characterActor.createEmbeddedDocuments('Item', [
                {
                    type: 'armor',
                    name: 'Base Armor',
                    system: {
                        armor: {
                            base: 6,
                            is_hardened: false,
                            accessory: false,
                            immunities: {
                                base: ['normal_weapons'],
                                value: ['normal_weapons'],
                            },
                        },
                        technology: {
                            equipped: true,
                        }
                    }
                },
                {
                    type: 'armor',
                    name: 'Hardened Accessory',
                    system: {
                        armor: {
                            base: 4,
                            is_hardened: true,
                            accessory: true,
                        },
                        technology: {
                            equipped: true,
                        }
                    }
                }
            ]);

            return characterActor;
        }

        describe("isBlockedByVehicleArmor", () => {
            it('blocks damage due to vehicle armor', async () => {
                const vehicle = await getVehicleWithArmor(50);
                const damage = getDamage(4);

                const result = CombatRules.isBlockedByVehicleArmor(damage, 5, 2, vehicle);

                assert.isTrue(result);
            });

            it("doesn't block damage for non-vehicle actors", async () => {
                const vehicleActor = await getVehicleWithArmor(50);
                const characterActor = await getCharacterWithArmor(50);
                const damage = getDamage(4);

                const characterResult = CombatRules.isBlockedByVehicleArmor(damage, 5, 2, characterActor);
                const vehicleResult = CombatRules.isBlockedByVehicleArmor(damage, 5, 2, vehicleActor);

                assert.isFalse(characterResult);
                assert.isTrue(vehicleResult);
            });

            it("takes net hits into account", async () => {
                const vehicle = await getVehicleWithArmor(6);
                const damage = getDamage(4);

                const blockedResult = CombatRules.isBlockedByVehicleArmor(damage, 5, 4, vehicle);
                const notBlockedResult = CombatRules.isBlockedByVehicleArmor(damage, 5, 3, vehicle);

                assert.isTrue(blockedResult);
                assert.isFalse(notBlockedResult);
            });

            it("takes AP into account", async () => {
                const vehicle = await getVehicleWithArmor(6);
                // This is "high" AP but a negative number, just go with it
                const highApDamage = getDamage(4, { ap: -5 });
                const lowApDamage = getDamage(4, { ap: 5 });

                const blockedResult = CombatRules.isBlockedByVehicleArmor(lowApDamage, 5, 3, vehicle);
                const notBlockedResult = CombatRules.isBlockedByVehicleArmor(highApDamage, 5, 3, vehicle);

                assert.isTrue(blockedResult);
                assert.isFalse(notBlockedResult);
            });
        });

        describe("isBlockedByHardenedArmor", () => {
            it('blocks damage due to hardened armor', async () => {
                const vehicle = await getCharacterWithArmor(50, { hardened: true });
                const damage = getDamage(4);

                const result = CombatRules.isBlockedByHardenedArmor(damage, 5, 2, vehicle);

                assert.isTrue(result);
            });

            it("doesn't block damage for non-vehicle actors", async () => {
                const hardenedArmorActor = await getCharacterWithArmor(50, { hardened: true });
                const normalArmorActor = await getCharacterWithArmor(50);
                const damage = getDamage(4);

                const characterResult = CombatRules.isBlockedByHardenedArmor(damage, 5, 2, normalArmorActor);
                const vehicleResult = CombatRules.isBlockedByHardenedArmor(damage, 5, 2, hardenedArmorActor);

                assert.isFalse(characterResult);
                assert.isTrue(vehicleResult);
            });

            it("takes net hits into account", async () => {
                const actor = await getCharacterWithArmor(6, { hardened: true });
                const damage = getDamage(4);

                const blockedResult = CombatRules.isBlockedByHardenedArmor(damage, 5, 4, actor);
                const notBlockedResult = CombatRules.isBlockedByHardenedArmor(damage, 5, 3, actor);

                assert.isTrue(blockedResult);
                assert.isFalse(notBlockedResult);
            });
        });

        describe("doesNoPhysicalDamageToVehicle", () => {
            it("blocks non-physical damage to vehicle", async () => {
                const vehicle = await factory.createActor({ type: 'vehicle' });
                const damage = getDamage(4, { type: 'stun' });

                const result = CombatRules.doesNoPhysicalDamageToVehicle(damage, vehicle);

                assert.isTrue(result);
            });

            it("does not block physical damage to vehicle", async () => {
                const vehicle = await factory.createActor({ type: 'vehicle' });
                const damage = getDamage(4, { type: 'physical' });

                const result = CombatRules.doesNoPhysicalDamageToVehicle(damage, vehicle);

                assert.isFalse(result);
            });

            it("does not block electric stun damage to vehicle", async () => {
                const vehicle = await factory.createActor({ type: 'vehicle' });
                const damage = getDamage(4, { type: 'stun', element: 'electricity' });

                const result = CombatRules.doesNoPhysicalDamageToVehicle(damage, vehicle);

                assert.isFalse(result);
            });
        });

        describe("AP cascade behavior", () => {
            it("merges the highest matching immunity into hardened armor", async () => {
                const actor = await getCharacterWithImmunities(0, ['normal_weapons', 'fire']);
                const damage = getDamage(4, { normal_weapon: true, element: 'fire' });

                const armor = actor.getArmor(damage);
                const normalWeaponImmunity = armor.immunities.normal_weapons.value;
                const fireImmunity = armor.immunities.fire.value;

                assert.strictEqual(armor.hardened.value, Math.max(normalWeaponImmunity, fireImmunity));
            });

            it("applies positive AP to normal armor only", async () => {
                const actor = await getCharacterWithSplitArmorAndImmunity();
                const damage = getDamage(4, { normal_weapon: true, ap: 2 });

                const armor = actor.getArmor(damage);

                assert.strictEqual(armor.rating.value, 8);
                assert.strictEqual(armor.hardened.value, 16);
                assert.strictEqual(armor.immunities.normal_weapons.value, 12);
            });

            it("cascades negative AP from matching immunity to hardened then normal armor", async () => {
                const actor = await getCharacterWithSplitArmorAndImmunity();
                const damage = getDamage(4, { normal_weapon: true, ap: -14 });

                const armor = actor.getArmor(damage);

                assert.strictEqual(armor.immunities.normal_weapons.value, 12);
                assert.strictEqual(armor.hardened.value, 2);
                assert.strictEqual(armor.rating.value, 6);
            });

            it("clamps cascaded AP results at zero", async () => {
                const actor = await getCharacterWithSplitArmorAndImmunity();
                const damage = getDamage(4, { normal_weapon: true, ap: -30 });

                const armor = actor.getArmor(damage);

                assert.strictEqual(armor.immunities.normal_weapons.value, 12);
                assert.strictEqual(armor.hardened.value, 0);
                assert.strictEqual(armor.rating.value, 0);
            });
        });

        describe("Physical resist armor pool", () => {
            it("adds normal and hardened armor as separate pool contributors when non-zero", async () => {
                const actor = await getCharacterWithSplitArmorAndImmunity();
                const action = DataDefaults.createData('action_roll', {
                    test: 'PhysicalResistTest',
                    armor: true,
                    attribute: 'body',
                });

                const test = await TestCreator.fromAction(action, actor, { showDialog: false, showMessage: false });
                if (!test) return assert.fail('Failed to create PhysicalResistTest');

                // Immunity is merged into hardened only when it matches incoming damage context.
                (test as any).data.incomingDamage.normal_weapon = true;
                test.prepareBaseValues();
                test.calculateBaseValues();

                const normalArmor = test.pool.changes.find(change => change.name === 'SR5.Armor.label');
                const hardenedArmor = test.pool.changes.find(change => change.name === 'SR5.HardenedArmor');

                assert.strictEqual(normalArmor?.value, 6);
                assert.strictEqual(hardenedArmor?.value, 16);
            });
        });
    });
};
