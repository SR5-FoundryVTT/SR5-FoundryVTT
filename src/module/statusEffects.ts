import { FLAGS, SYSTEM_NAME } from './constants';

const DEFAULT_MOVEMENT_EXPIRY = 'firstActionPhase';

function getMovementExpiry() {
    const resetSetting = game.settings.get(SYSTEM_NAME, FLAGS.TokenMovementHistoryReset);
    if (resetSetting === 'firstActionPhase')
        return 'firstActionPhase';

    return 'roundStart';
}

const SRStatus = [
    {
        id: 'sr5run',
        name: 'SR5.StatusEffects.Running',
        img: 'systems/shadowrun5e/dist/icons/status-effects/run.svg',
        duration: { rounds: 1, expiry: DEFAULT_MOVEMENT_EXPIRY },
        system: {
            targets: [
                {
                    id: 'penalty',
                    name: 'penalty',
                    applyTo: 'test_all',
                    conditions: [
                        // Exclude defense and resist tests from the penalty.
                        { type: 'tests', mode: 'exclude', values: ['PhysicalDefenseTest', 'SuppressionDefenseTest', 'PhysicalResistTest'] },
                        // Exclude the running skill test itself from the penalty.
                        { type: 'skills', mode: 'exclude', values: ['running'] },
                    ],
                },
                {
                    // Running grants +2 physical defense.
                    id: 'defense',
                    applyTo: 'test_all',
                    conditions: [
                        { type: 'tests', mode: 'include', values: ['PhysicalDefenseTest'] },
                        { type: 'categories', mode: 'include', values: ['defense'] },
                    ],
                },
                {
                    // +4 raw on melee attacks = net +2 after the general -2 penalty.
                    id: 'melee',
                    name: 'melee',
                    applyTo: 'test_all',
                    conditions: [
                        { type: 'tests', mode: 'include', values: ['MeleeAttackTest'] },
                    ],
                },
                {
                    // -2 to a ranged/thrown attack made against this running actor (applies to the attacker's test).
                    id: 'targetRanged',
                    name: 'targetRanged',
                    applyTo: 'test_target',
                    conditions: [
                        { type: 'tests', mode: 'include', values: ['RangedAttackTest', 'ThrownAttackTest', 'SpellCastingTest'] },
                        { type: 'categories', mode: 'include', values: ['attack_ranged', 'attack_thrown'] },
                    ],
                },
            ],
            changes: [
                { key: "data.pool", type: "add", value: "-2", target: 'penalty' },
                { key: "data.pool", type: "add", value: "2", target: 'defense' },
                { key: "data.pool", type: "add", value: "4",  target: 'melee' },
                { key: "data.pool", type: "add", value: "-2", target: 'targetRanged' },
            ],
        },
    },
    {
        id: 'sr5sprint',
        name: 'SR5.StatusEffects.Sprinting',
        img: 'systems/shadowrun5e/dist/icons/status-effects/sprint.svg',
        duration: { rounds: 1, expiry: DEFAULT_MOVEMENT_EXPIRY },
        system: {
            targets: [
                {
                    id: 'penalty',
                    name: 'penalty',
                    applyTo: 'test_all',
                    conditions: [
                        { type: 'tests', mode: 'exclude', values: ['PhysicalDefenseTest', 'SuppressionDefenseTest', 'PhysicalResistTest'] },
                        { type: 'skills', mode: 'exclude', values: ['running'] },
                    ],
                },
                {
                    // Running grants +2 physical defense.
                    id: 'defense',
                    applyTo: 'test_all',
                    conditions: [
                        { type: 'tests', mode: 'include', values: ['PhysicalDefenseTest'] },
                        { type: 'categories', mode: 'include', values: ['defense'] },
                    ],
                },
                {
                    // +4 raw on melee attacks = net +2 after the general -2 penalty.
                    id: 'melee',
                    name: 'melee',
                    applyTo: 'test_all',
                    conditions: [
                        { type: 'tests', mode: 'include', values: ['MeleeAttackTest'] },
                    ],
                },
                {
                    // -4 to a ranged/thrown attack made against this sprinting actor (applies to the attacker's test).
                    id: 'targetRanged',
                    name: 'targetRanged',
                    applyTo: 'test_target',
                    conditions: [
                        { type: 'tests', mode: 'include', values: ['RangedAttackTest', 'ThrownAttackTest', 'SpellCastingTest'] },
                        { type: 'categories', mode: 'include', values: ['attack_ranged', 'attack_thrown'] },
                    ],
                },
            ],
            changes: [
                { key: "data.pool", type: "add", value: "-2", target: 'penalty' },
                { key: "data.pool", type: "add", value: "2", target: 'defense' },
                { key: "data.pool", type: "add", value: "4",  target: 'melee' },
                { key: "data.pool", type: "add", value: "-4", target: 'targetRanged' },
            ],
        },
    },
    {
        id: 'sr5jumpedIn',
        name: 'SR5.StatusEffects.JumpedIn',
        img: 'icons/svg/lock.svg',
    },
    {
        id: 'sr5riggedVehicle',
        name: 'SR5.StatusEffects.RiggedVehicle',
        img: 'systems/shadowrun5e/dist/icons/status-effects/steering-wheel.svg',
    },
    {
        id: 'sr5disoriented',
        name: 'SR5.Rigger.Disoriented',
        img: 'icons/svg/daze.svg',
        system: {
            targets: [
                {
                    id: 'penalty',
                    name: 'penalty',
                    applyTo: 'test_all',
                    conditions: [
                        { type: 'tests', mode: 'exclude', values: ['PhysicalDefenseTest', 'SuppressionDefenseTest', 'PhysicalResistTest', 'BiofeedbackResistTest'] },
                    ],
                },
            ],
            changes: [
                { key: "data.pool", type: "add", value: "-2", target: 'penalty' },
            ],
        },
    },
    {
        id: 'sr5sensorLock',
        name: 'SR5.Rigger.ActiveSensorLock',
        img: 'icons/svg/target.svg',
        system: {
            targets: [
                {
                    id: 'defensePenalty',
                    name: 'defensePenalty',
                    applyTo: 'test_target',
                    conditions: [
                        { type: 'tests', mode: 'include', values: ['PhysicalDefenseTest', 'RangedDefenseTest', 'MeleeDefenseTest'] },
                    ],
                },
            ],
            changes: [
                { key: "data.pool", type: "add", value: "-1", target: 'defensePenalty' },
            ],
        },
    },
];

export function getSRStatus(): CONFIG.StatusEffect[] {
    const expiry = getMovementExpiry();

    return SRStatus.map(status => ({
        ...status,
        duration: { ...status.duration, expiry },
    })) as CONFIG.StatusEffect[];
}
