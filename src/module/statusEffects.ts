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
        duration: { value: 1, units: 'rounds', expiry: DEFAULT_MOVEMENT_EXPIRY },
        system: {
            targets: [
                {
                    id: 'penalty',
                    applyTo: 'test_all',
                    conditions: [
                        // Exclude defense and resist tests from the penalty.
                        { type: 'tests', mode: 'exclude', values: ['PhysicalDefenseTest', 'SuppressionDefenseTest', 'PhysicalResistTest'] },
                        // Exclude the running skill test itself from the penalty.
                        { type: 'skills', mode: 'exclude', values: ['running'] },
                    ],
                },
                {
                    // +4 raw on melee attacks = net +2 after the general -2 penalty.
                    id: 'melee',
                    applyTo: 'test_all',
                    conditions: [
                        { type: 'tests', mode: 'include', values: ['MeleeAttackTest'] },
                    ],
                },
                {
                    // -2 to a ranged/thrown attack made against this running actor (applies to the attacker's test).
                    id: 'targetRanged',
                    applyTo: 'test_target',
                    conditions: [
                        { type: 'tests', mode: 'include', values: ['RangedAttackTest', 'ThrownAttackTest'] },
                    ],
                },
            ],
            changes: [
                { key: "data.pool", type: "add", value: "-2", target: 'penalty' },
                { key: "data.pool", type: "add", value: "4",  target: 'melee' },
                { key: "data.pool", type: "add", value: "-2", target: 'targetRanged' },
            ],
        },
    },
    {
        id: 'sr5sprint',
        name: 'SR5.StatusEffects.Sprinting',
        img: 'systems/shadowrun5e/dist/icons/status-effects/sprint.svg',
        duration: { value: 1, units: 'rounds', expiry: DEFAULT_MOVEMENT_EXPIRY },
        system: {
            targets: [
                {
                    id: 'penalty',
                    applyTo: 'test_all',
                    conditions: [
                        { type: 'tests', mode: 'exclude', values: ['PhysicalDefenseTest', 'SuppressionDefenseTest', 'PhysicalResistTest'] },
                        { type: 'skills', mode: 'exclude', values: ['running'] },
                    ],
                },
                {
                    // +4 raw on melee attacks = net +2 after the general -2 penalty.
                    id: 'melee',
                    applyTo: 'test_all',
                    conditions: [
                        { type: 'tests', mode: 'include', values: ['MeleeAttackTest'] },
                    ],
                },
                {
                    // -4 to a ranged/thrown attack made against this sprinting actor (applies to the attacker's test).
                    id: 'targetRanged',
                    applyTo: 'test_target',
                    conditions: [
                        { type: 'tests', mode: 'include', values: ['RangedAttackTest', 'ThrownAttackTest'] },
                    ],
                },
            ],
            changes: [
                { key: "data.pool", type: "add", value: "-2", target: 'penalty' },
                { key: "data.pool", type: "add", value: "4",  target: 'melee' },
                { key: "data.pool", type: "add", value: "-4", target: 'targetRanged' },
            ],
        },
    },
] as const satisfies CONFIG.StatusEffect[];

export function getSRStatus(): CONFIG.StatusEffect[] {
    const expiry = getMovementExpiry();

    return SRStatus.map(status => ({
        ...status,
        duration: { ...status.duration, expiry },
    }));
}
